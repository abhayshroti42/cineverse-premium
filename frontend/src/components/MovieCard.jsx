function MovieCard({ movie }) {
  return (
    <div
      style={{
        minWidth: "180px",
        cursor: "pointer",
      }}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        width="180"
        height="270"
      />

      <h4>{movie.title}</h4>
    </div>
  );
}

export default MovieCard;