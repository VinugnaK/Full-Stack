import subprocess
import random
from datetime import datetime, timedelta

start = datetime(2025, 3, 1)
end   = datetime(2025, 4, 3)

total_seconds = int((end - start).total_seconds())

commits = subprocess.check_output(
    ["git", "rev-list", "--reverse", "HEAD"],
    text=True
).strip().split("\n")

# generate sorted timestamps
timestamps = sorted([
    start + timedelta(seconds=random.randint(0, total_seconds))
    for _ in commits
])

index = 0

def callback(commit):
    global index
    ts = int(timestamps[index].timestamp())
    commit.commit_time = ts
    commit.author_time = ts
    index += 1

from git_filter_repo import FilterRepo
FilterRepo(commit_callback=callback).run()