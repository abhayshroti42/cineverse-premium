from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def create_tfidf_matrix(movie_features):

    tfidf = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = tfidf.fit_transform(
        movie_features["features"]
    )

    return tfidf, tfidf_matrix


def create_similarity_matrix(
    tfidf_matrix
):

    similarity_matrix = cosine_similarity(
        tfidf_matrix
    )

    return similarity_matrix


def create_movie_index(
    movie_features
):

    movie_indices = {}

    for idx, title in enumerate(
        movie_features["title"]
    ):
        movie_indices[title] = idx

    return movie_indices