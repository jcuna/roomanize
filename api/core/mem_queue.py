import sys
import socket
from time import sleep
from select import select
from core import SERVER_ADDRESS, DELIMITER, ACTION_PUSH, ACTION_PULL


def send_msg(message: str):
    """
    we want this to return ASAP
    we trust that it went mostly OK
    :param message:
    :return:
    """
    socket_client = get_reply(ACTION_PUSH, message)
    socket_client.close()
    return True


def receive_msg():
    socket_client = get_reply(ACTION_PULL, '')
    reply = socket_client.recv(1024)
    socket_client.close()
    return reply.decode('utf-8') if reply else None


def get_reply(action, msg):
    try:
        encoded = (str(action) + DELIMITER + msg).encode('utf-8')
        socket_client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        socket_client.connect(SERVER_ADDRESS)
        socket_client.sendall(bytes(encoded))
        return socket_client

    except socket.error as err:
        print('message not sent', sys.stderr)
        raise err
