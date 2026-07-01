import pandas as pd
from sqlalchemy import create_engine

engine = create_engine("sqlite:///movies.db")

movies = pd.read_csv("../../datasets/movies.csv")
ratings = pd.read_csv("../../datasets/ratings.csv")
links = pd.read_csv("../../datasets/links.csv")

movies.to_sql(
    "movies",
    engine,
    if_exists="replace",
    index=False
)

ratings.to_sql(
    "ratings",
    engine,
    if_exists="replace",
    index=False
)

links.to_sql(
    "links",
    engine,
    if_exists="replace",
    index=False
)

print("Movies Loaded")
print("Ratings Loaded")
print("Links Loaded")