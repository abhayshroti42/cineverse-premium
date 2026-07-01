from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("sqlite:///movies.db")

query = """
SELECT name
FROM sqlite_master
WHERE type='table';
"""

print(pd.read_sql(query, engine))