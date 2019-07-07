from core.crons.balances import balances_cron

# schedule is UTC time so assume +4 hours while daylight savings

cron_jobs = [
    {'func': balances_cron, 'trigger': 'cron', 'day': '*', 'hour': 5}
]
