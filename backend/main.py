from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import re
from sqlalchemy.orm import Session
from sqlalchemy import inspect

# Import Recommender engines
from reccomeder.conten import build_content_recommender
from reccomeder.hybrid import hybrid_recommend
from services.tmdb_services import get_movie_details

# Import Database Core Elements
from database.db import Base, engine, SessionLocal
from database.models import User, WatchHistory, TMDBMovie
from database.schemas import UserCreate, UserLogin, WatchHistoryCreate

# Import Auth Services
from auth import hash_password, verify_password

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

# 1. Initialize App First
app = FastAPI()

# 2. FIXED: Moved CORS Middleware to the absolute top so it applies to ALL routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. FIXED: Single, clean Database Context Dependency Injection Definition
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load Datasets globally
BASE_DIR = Path(__file__).resolve().parent.parent

movie_features = pd.read_csv(BASE_DIR / "datasets" / "movie_features.csv")
ratings = pd.read_csv(BASE_DIR / "datasets" / "ratings.csv")
movies = pd.read_csv(BASE_DIR / "datasets" / "movies.csv")

# Build Recommender Matrix on Startup
similarity_matrix, movie_indices = build_content_recommender(movie_features)


# Helper Functions
def clean_title(title):
    title = re.sub(r"\s*\(\d{4}\)$", "", title)
    if ", The" in title:
        title = "The " + title.replace(", The", "")
    if ", A" in title:
        title = "A " + title.replace(", A", "")
    return title.strip()


def get_cached_movie(title, db: Session):
    # 1. ALWAYS clean the incoming title first so lookups match exactly
    cleaned = clean_title(title)
    
    # 2. Check the database using the clean string
    movie = db.query(TMDBMovie).filter(TMDBMovie.title == cleaned).first()

    if movie:
        return {
            "poster": movie.poster_url,
            "plot": movie.overview,
            "rating": movie.vote_average
        }

    # 3. Fetch from your OMDb script if it doesn't exist yet
    api_data = get_movie_details(cleaned)

    if api_data:
        poster_link = api_data.get("poster")
        
        # Double-check one more time right before inserting to prevent multi-thread duplicate steps
        existing_check = db.query(TMDBMovie).filter(TMDBMovie.title == cleaned).first()
        if not existing_check:
            new_movie = TMDBMovie(
                title=cleaned,  # FIXED: Save the identical cleaned string to match unique parameters
                overview=api_data.get("plot"),
                poster_url=poster_link,
                vote_average=api_data.get("rating")
            )
            db.add(new_movie)
            db.commit()
        
        return {
            "poster": poster_link,
            "plot": api_data.get("plot"),
            "rating": api_data.get("rating")
        }

    return None

def enrich_movies(movie_titles, db: Session):
    enriched = []
    for title in movie_titles:
        movie = movies[movies["title"] == title]
        if movie.empty:
            continue

        movie = movie.iloc[0]
        movie_data = get_cached_movie(title, db)

        enriched.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": movie["genres"],
            "poster": movie_data.get("poster") if movie_data else None,
            "plot": movie_data.get("plot") if movie_data else None,
            "rating": movie_data.get("rating") if movie_data else None
        })
    return enriched


# --- API ENDPOINTS ---

@app.get("/")
def home():
    return {"message": "Movie Recommender API"}


# Registration Endpoint
@app.post("/register")
def register_user(item: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter((User.email == item.email) | (User.username == item.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
        
    new_user = User(
        username=item.username,
        email=item.email,
        password_hash=hash_password(item.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}


# Login Endpoint
@app.post("/login")
def login_user(item: UserLogin, db: Session = Depends(get_db)):
    # Stripping emails to ignore accidental whitespace key issues
    user = db.query(User).filter(User.email == item.email.strip()).first()
    if not user or not verify_password(item.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {"message": "Login successful", "user_id": user.id}


# FIXED: Changed search dataset lookup target to safe movies dataframe
@app.get("/search")
def search_movie(query: str):
    try:
        filtered = movies[
            movies["title"].str.contains(query, case=False, na=False)
        ].head(10)
        
        results = [
            {"movieId": int(row["movieId"]), "title": row["title"]} 
            for _, row in filtered.iterrows()
        ]
        return {"results": results}
    except Exception as e:
        return {"results": [], "error": str(e)}


@app.post("/watch-history/add")
def add_watch_history(item: WatchHistoryCreate, db: Session = Depends(get_db)):
    watch_item = WatchHistory(
        user_id=item.user_id,
        movie_id=item.movie_id,
        rating=item.rating,
        review=item.review
    )
    db.add(watch_item)
    db.commit()
    return {"message": "Movie added to watch history"}


@app.get("/watch-history/{user_id}")
def get_watch_history(user_id: int, db: Session = Depends(get_db)):
    history = db.query(WatchHistory).filter(WatchHistory.user_id == user_id).all()
    result = []

    for item in history:
        movie = movies[movies["movieId"] == item.movie_id]
        if movie.empty:
            continue
        movie = movie.iloc[0]

        result.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "rating": item.rating,
            "review": item.review
        })
    return result


@app.get("/genre/{genre_name}")
def get_movies_by_genre(genre_name: str, db: Session = Depends(get_db)):
    filtered = movies[
        movies["genres"].str.contains(genre_name, case=False, na=False)
    ]
    result = []

    for _, movie in filtered.head(8).iterrows():
        movie_data = get_cached_movie(movie["title"], db)
        result.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": movie["genres"],
            "poster": movie_data.get("poster") if movie_data else None
        })
    return result


@app.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }


@app.delete("/watch-history/{history_id}")
def delete_watch_history(history_id: int, db: Session = Depends(get_db)):
    item = db.query(WatchHistory).filter(WatchHistory.id == history_id).first()
    if not item:
        return {"error": "Entry not found"}
    
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

@app.get("/trending")
def get_trending_movies(db: Session = Depends(get_db)):
    # 1. Attempt to get actual user watch history
    history = db.query(WatchHistory.movie_id).all()
    movie_counts = {}

    for row in history:
        movie_id = row[0]
        movie_counts[movie_id] = movie_counts.get(movie_id, 0) + 1

    sorted_movies = sorted(
        movie_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]

    # 2. FIXED: Fallback logic if nobody has watched any movies yet
    if not sorted_movies:
        # Grab 8 arbitrary movies from your CSV to act as baseline trending items
        fallback_movies = movies.head(8)
        result = []
        for _, movie in fallback_movies.iterrows():
            omdb_data = get_cached_movie(movie["title"], db)
            result.append({
                "movieId": int(movie["movieId"]),
                "title": movie["title"],
                "genres": movie["genres"],
                "watch_count": 0,
                "poster": omdb_data.get("poster") if omdb_data else None
            })
        return result

    # 3. Standard processing loop if watch history DOES exist
    result = []
    for movie_id, count in sorted_movies:
        movie = movies[movies["movieId"] == movie_id]
        if movie.empty:
            continue
        movie = movie.iloc[0]
        omdb_data = get_cached_movie(movie["title"], db)

        result.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": movie["genres"],
            "watch_count": count,
            "poster": omdb_data.get("poster") if omdb_data else None
        })
    return result


@app.get("/recommend/user/{user_id}")
def recommend_from_history(user_id: int, db: Session = Depends(get_db)):
    last_movie = (
        db.query(WatchHistory)
        .filter(WatchHistory.user_id == user_id)
        .order_by(WatchHistory.id.desc())
        .first()
    )

    if not last_movie:
        return {"error": "No watch history found"}

    movie_row = movies[movies["movieId"] == last_movie.movie_id]
    if movie_row.empty:
        return {"error": "Movie not found"}

    movie_title = movie_row.iloc[0]["title"]

    recommendations = hybrid_recommend(
        user_id=user_id,
        movie_title=movie_title,
        movie_features=movie_features,
        ratings=ratings,
        movies=movies,
        similarity_matrix=similarity_matrix,
        movie_indices=movie_indices
    )

    return {
        "based_on": movie_title,
        "content_based": enrich_movies(recommendations["content_based"], db),
        "collaborative": recommendations["collaborative"]
    }


@app.get("/movie/{movie_id}")
def get_movie(movie_id: int):
    movie = movies[movies["movieId"] == movie_id]
    if movie.empty:
        return {"error": "Movie not found"}

    movie = movie.iloc[0]
    details = get_movie_details(clean_title(movie["title"]))

    return {
        "movieId": int(movie["movieId"]),
        "title": movie["title"],
        "genres": movie["genres"],
        "poster": details.get("poster") if details else None,
        "plot": details.get("plot") if details else None,
        "rating": details.get("rating") if details else None
    }


@app.get("/home")
def home_data(db: Session = Depends(get_db)):
    return {
        "trending": get_trending_movies(db)[:8],
        "crime": get_movies_by_genre("Crime", db)[:8],
        "thriller": get_movies_by_genre("Thriller", db)[:8],
        "romance": get_movies_by_genre("Romance", db)[:8],
        "comedy": get_movies_by_genre("Comedy", db)[:8]
    }


@app.get("/tables")
def tables():
    inspector = inspect(engine)
    return inspector.get_table_names()
from pydantic import BaseModel

class WatchHistoryTitleCreate(BaseModel):
    user_id: int
    movie_title: str
    rating: int
    review: str

@app.post("/watch-history/add-by-title")
def add_watch_history_by_title(item: WatchHistoryTitleCreate, db: Session = Depends(get_db)):
    # Look for movie id matching dataset title or provide default fallback sequence ID to avoid database dependency crash
    match = movies[movies["title"].str.contains(item.movie_title, case=False, na=False)]
    movie_id = int(match.iloc[0]["movieId"]) if not match.empty else 99999
    
    watch_item = WatchHistory(
        user_id=item.user_id,
        movie_id=movie_id,
        rating=item.rating,
        review=item.review
    )
    db.add(watch_item)
    db.commit()
    return {"message": "Review tracked successfully"}