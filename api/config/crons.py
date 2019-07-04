from core.crons.balances import balances_cron

cron_jobs = [
    {'func': balances_cron, 'trigger': 'cron', 'day': '*', 'hour': 4}
]
