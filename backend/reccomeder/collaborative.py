from pathlib import Path
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy
import joblib

BASE_DIR = Path(__file__).resolve().parents[2]

ratings = pd.read_csv(
    BASE_DIR / "datasets" / "ratings.csv"
)

reader = Reader(rating_scale=(0.5, 5.0))

data = Dataset.load_from_df(
    ratings[['userId', 'movieId', 'rating']],
    reader
)

trainset, testset = train_test_split(
    data,
    test_size=0.2,
    random_state=42
)

model = SVD()
model.fit(trainset)

predictions = model.test(testset)

print(
    "RMSE:",
    accuracy.rmse(predictions)
)

MODEL_PATH = Path(__file__).parent / "svd_model.pkl"

joblib.dump(
    model,
    MODEL_PATH
)

print("Model Saved Successfully")