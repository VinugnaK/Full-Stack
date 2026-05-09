from datetime import datetime, timedelta
import random

def callback(commit):
    start = datetime(2026, 3, 1)
    end   = datetime(2026, 4, 4)

    delta = (end - start).days
    new_date = start + timedelta(days=random.randint(0, delta))

    ts = int(new_date.timestamp())
    commit.commit_time = ts
    commit.author_time = ts
