import sys
from config.crons import cron_runner

index = int(sys.argv[1])

cron_runner(index)
