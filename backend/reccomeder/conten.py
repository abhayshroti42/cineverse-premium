import pandas as pd

from reccomeder.utils import (
    create_tfidf_matrix,
    create_similarity_matrix,
    create_movie_index
)


def build_content_recommender(movie_features):

    tfidf, tfidf_matrix = create_tfidf_matrix(
        movie_features
    )

    similarity_matrix = create_similarity_matrix(
        tfidf_matrix
    )

    movie_indices = create_movie_index(
        movie_features
    )

    return (
        similarity_matrix,
        movie_indices
    )


def get_recommendations(
    movie_title,
    movie_features,
    similarity_matrix,
    movie_indices,
    n=10
):

    if movie_title not in movie_indices:
        return []

    idx = movie_indices[movie_title]

    similarity_scores = list(
        enumerate(
            similarity_matrix[idx]
        )
    )

    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    similarity_scores = similarity_scores[
        1:n+1
    ]

    movie_indexes = [
        movie[0]
        for movie in similarity_scores
    ]

    recommendations = (
        movie_features.iloc[
            movie_indexes
        ]["title"]
        .tolist()
    )

    return recommendations


if __name__ == "__main__":

    movie_features = pd.read_csv(
        "../../datasets/movie_features.csv"
    )

    similarity_matrix, movie_indices = (
        build_content_recommender(
            movie_features
        )
    )

    recommendations = (
        get_recommendations(
            "Toy Story (1995)",
            movie_features,
            similarity_matrix,
            movie_indices
        )
    )

    print("\nRecommended Movies:\n")

    for movie in recommendations:
        print(movie)