import { useEffect, useState } from "react";
import API from "../services/api";

function WatchHistory() {
  const [history, setHistory] = useState([]);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    API.get(`/watch-history/${userId}`)
      .then((res) => setHistory(res.data))
      .catch(console.error);
  }, [userId]);

  return (
    <div>
      <h1>Watch History</h1>

      {history.map((movie) => (
        <div key={movie.movieId}>
          <h3>{movie.title}</h3>
          <p>Rating: {movie.rating}</p>
          <p>{movie.review}</p>
        </div>
      ))}
    </div>
  );
}

export default WatchHistory;