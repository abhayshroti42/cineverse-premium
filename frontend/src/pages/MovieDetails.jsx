import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function MovieDetails() {

  const { id } = useParams();

  const [movie, setMovie] =
    useState(null);

  useEffect(() => {

    API.get(`/movie/${id}`)
      .then((res) =>
        setMovie(res.data)
      )
      .catch(console.error);

  }, [id]);

  if (!movie)
    return <h1>Loading...</h1>;

  return (
    <div>
      <h1>{movie.title}</h1>

      <img
        src={movie.poster}
        width="250"
      />

      <p>{movie.genres}</p>

      <p>{movie.plot}</p>

      <h3>
        Rating:
        {movie.rating}
      </h3>
    </div>
  );
}

export default MovieDetails;