import requests

API_KEY = "dfbbce21"


def get_movie_details(movie_title):

    url = "https://www.omdbapi.com/"

    params = {
        "apikey": API_KEY,
        "t": movie_title
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        data = response.json()

        if data.get("Response") == "False":
            return None

        return {
            "title": data.get("Title"),
            "year": data.get("Year"),
            "poster": data.get("Poster"),
            "plot": data.get("Plot"),
            "rating": data.get("imdbRating"),
            "genre": data.get("Genre"),
            "runtime": data.get("Runtime")
        }

    except Exception as e:
        print("OMDb Error:", e)
        return None
print(get_movie_details("Toy Story"))