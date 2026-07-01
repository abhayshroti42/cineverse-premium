from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # Relationships
    watch_history = relationship("WatchHistory", back_populates="user", cascade="all, delete-orphan")


class TMDBMovie(Base):
    __tablename__ = "tmdb_movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    overview = Column(Text, nullable=True)
    poster_url = Column(String, nullable=True)
    vote_average = Column(Float, nullable=True)

    # Relationships
    watch_history = relationship("WatchHistory", back_populates="tmdb_movie", cascade="all, delete-orphan")


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(Integer, ForeignKey("tmdb_movies.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=True)
    review = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="watch_history")
    # FIXED: Changed back_populates from "watch_histories" to "watch_history" to match TMDBMovie property name
    tmdb_movie = relationship("TMDBMovie", back_populates="watch_history")