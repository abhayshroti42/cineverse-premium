import pandas as pd

from reccomeder.conten import (
    build_content_recommender,
    get_recommendations
)

from reccomeder.collaborative import model


def get_collaborative_recommendations(
    user_id,
    ratings,
    movies,
    model,
    n=10
):

    movie_ids = ratings["movieId"].unique()

    predictions = []

    for movie_id in movie_ids:

        pred = model.predict(
            user_id,
            movie_id
        )

        predictions.append(
            (
                movie_id,
                pred.est
            )
        )

    predictions.sort(
        key=lambda x: x[1],
        reverse=True
    )

    movie_dict = dict(
        zip(
            movies["movieId"],
            movies["title"]
        )
    )

    top_movies = []

    for movie_id, score in predictions[:n]:

        title = movie_dict.get(
            movie_id,
            "Unknown Movie"
        )

        top_movies.append(
            (
                title,
                round(score, 2)
            )
        )

    return top_movies


def hybrid_recommend(
    user_id,
    movie_title,
    movie_features,
    ratings,
    movies,
    similarity_matrix,
    movie_indices,
    n=10
):

    content_recs = get_recommendations(
        movie_title,
        movie_features,
        similarity_matrix,
        movie_indices,
        n
    )

    collaborative_recs = (
        get_collaborative_recommendations(
            user_id,
            ratings,
            movies,
            model,
            n
        )
    )

    return {
        "content_based":
            content_recs,

        "collaborative":
            collaborative_recs
    }


if __name__ == "__main__":

    movie_features = pd.read_csv(
        "../../datasets/movie_features.csv"
    )

    ratings = pd.read_csv(
        "../../datasets/ratings.csv"
    )

    movies = pd.read_csv(
        "../../datasets/movies.csv"
    )

    similarity_matrix, movie_indices = (
        build_content_recommender(
            movie_features
        )
    )

    recommendations = (
        hybrid_recommend(
            user_id=1,
            movie_title="Toy Story (1995)",
            movie_features=movie_features,
            ratings=ratings,
            movies=movies,
            similarity_matrix=similarity_matrix,
            movie_indices=movie_indices
        )
    )

    print("\nCONTENT BASED\n")

    for movie in recommendations["content_based"]:
        print(movie)

    print("\nCOLLABORATIVE\n")

    for movie, score in recommendations["collaborative"]:
        print(f"{movie} --> {score}")