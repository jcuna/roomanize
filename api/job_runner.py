import sys
from config.crons import cron_jobs

index = int(sys.argv[1])

cron_jobs[index]['func']()
