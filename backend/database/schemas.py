from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# FIXED: Changed from username to email to match your React Login form fields
class UserLogin(BaseModel):
    email: str  
    password: str

class WatchHistoryCreate(BaseModel):
    user_id: int
    movie_id: int
    rating: int
    review: str