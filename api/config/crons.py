from core.crons.balances import balances_cron

cron_jobs = [
    {'func': balances_cron, 'trigger': 'cron', 'day': '*', 'hour': 4}
]


def cron_runner(job_index: int):
    """
    helper method to help run cron jobs in dev and test them out.
    :return:
    """
    from app import init_app

    app = init_app('sys')
    with app.app_context():
        cron_jobs[job_index]['func']()
