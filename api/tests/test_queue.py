from multiprocessing import Process
from time import sleep


def start_queue(func):
    p = Process(target=func)
    p.start()


def test_message_queue():
    from core.mem_queue import send_msg, receive_msg
    from core.queue_worker import exit_program, run
    start_queue(run)
    # ensure queue starts
    sleep(0.2)
    assert receive_msg() is None, 'No messages should be in queue'
    assert receive_msg() is None, 'No messages should be in queue'

    #assert send_msg('hey bro') is True

    # msg = receive_msg()
    # assert msg == 'hey bro'

    #exit_program()
