import subprocess
import random
from datetime import datetime, timedelta

commits = subprocess.check_output(
    ["git", "rev-list", "--reverse", "HEAD"],
    text=True
).strip().split("\n")

start = datetime(2026, 3, 1)
end   = datetime(2026, 4, 4)

total_seconds = int((end - start).total_seconds())

timestamps = sorted([
    start + timedelta(seconds=random.randint(0, total_seconds))
    for _ in commits
])

env_filter = ""

for commit, ts in zip(commits, timestamps):
    date_str = ts.strftime("%Y-%m-%dT%H:%M:%S +0530")
    env_filter += f'''
if [ "\" = "{commit}" ]; then
    export GIT_AUTHOR_DATE="{date_str}"
    export GIT_COMMITTER_DATE="{date_str}"
fi
'''

print("Rewriting history...")

subprocess.run([
    "git", "filter-branch", "-f",
    "--env-filter", env_filter,
    "--", "--all"
])

print("Done! Run: git push --force --tags")
