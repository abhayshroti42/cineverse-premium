import { useEffect, useState } from "react";
import API from "../services/api";

function Recommendations() {

  const [data, setData] =
    useState(null);

  const userId =
    localStorage.getItem("user_id");

  useEffect(() => {

    API.get(
      `/recommend/user/${userId}`
    )
      .then((res) =>
        setData(res.data)
      )
      .catch(console.error);

  }, [userId]);

  if (!data)
    return <h1>Loading...</h1>;

  return (
    <div>
      <h1>Recommendations</h1>

      {data.content_based.map(
        (movie) => (
          <div
            key={movie.movieId}
          >
            {movie.title}
          </div>
        )
      )}
    </div>
  );
}

export default Recommendations;