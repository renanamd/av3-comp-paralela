import os
# Força 1 thread por processo — garante que cada servidor usa 1 núcleo,
# tornando a comparação com o serial justa (1 servidor = 1 thread).
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS']      = '1'
os.environ['MKL_NUM_THREADS']      = '1'

import socket
import pickle
import struct
import sys
import numpy as np

from config import BUFFER_SIZE


def receive_message(conn):
    raw_size = conn.recv(8)
    size = struct.unpack(">Q", raw_size)[0]

    chunks = []
    received = 0
    while received < size:
        chunk = conn.recv(min(BUFFER_SIZE, size - received))
        if not chunk:
            break
        chunks.append(chunk)
        received += len(chunk)

    return pickle.loads(b"".join(chunks))


def send_message(conn, data):
    payload = pickle.dumps(data)
    size = struct.pack(">Q", len(payload))
    conn.sendall(size + payload)


def handle_request(conn):
    data = receive_message(conn)

    sub_A = data["sub_A"]
    B     = data["B"]

    result = np.dot(sub_A, B)

    send_message(conn, result)
    conn.close()


def start(port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("localhost", port))
    server.listen()

    print(f"Servidor rodando na porta {port}. Aguardando conexoes...")

    while True:
        conn, _ = server.accept()
        handle_request(conn)


if __name__ == "__main__":
    port = int(sys.argv[1])
    start(port)
