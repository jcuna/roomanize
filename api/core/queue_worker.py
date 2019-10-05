import os
import sys
import socket
from queue import Queue, Empty
from core import SERVER_ADDRESS, DELIMITER, ACTION_PUSH, ACTION_PULL
import atexit


socket_client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)


def exit_program(code=0):
    print('Terminating service', file=sys.stderr)
    socket_client.close()
    try:
        os.unlink(SERVER_ADDRESS)
    except OSError:
        if os.path.exists(SERVER_ADDRESS):
            raise
    exit(code)


atexit.register(exit_program)


def run():
    socket_client.bind(SERVER_ADDRESS)
    socket_client.listen(1)
    task_queue = Queue()
    while True:
        print('waiting for a connection', file=sys.stderr)
        connection, client_address = socket_client.accept()
        try:
            print('connection from', client_address, file=sys.stderr)
            data = connection.recv(1024)
            print('received "%s"' % data, file=sys.stderr)
            if data:
                action, msg = data.decode('utf8').split(DELIMITER)
                if int(action) == ACTION_PUSH:
                    connection.sendall(b'OK')
                    task_queue.put(data)
                elif int(action) == ACTION_PULL:
                    try:
                        msg = task_queue.get_nowait().decode('utf8')
                        connection.sendall(msg)
                    except Empty:
                        connection.sendall(bytes())
                raise RuntimeError('Invalid action type passed')

        finally:
            print('Ended connection from', client_address, file=sys.stderr)
            connection.close()
