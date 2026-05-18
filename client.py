import socket
import pickle
import struct
import threading
import time
import numpy as np

from config import SERVERS, BUFFER_SIZE, TEST_SIZES


def receive_message(sock):
    raw_size = sock.recv(8)
    size = struct.unpack(">Q", raw_size)[0]

    data = b""
    while len(data) < size:
        chunk = sock.recv(min(BUFFER_SIZE, size - len(data)))
        if not chunk:
            break
        data += chunk

    return pickle.loads(data)


def send_message(sock, data):
    payload = pickle.dumps(data)
    size = struct.pack(">Q", len(payload))
    sock.sendall(size + payload)


def send_to_server(host, port, sub_A, B, results, index):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    send_message(sock, {"sub_A": sub_A, "B": B})
    results[index] = receive_message(sock)
    sock.close()


def multiply_distributed(A, B):
    sub_matrices = np.array_split(A, len(SERVERS))
    results      = [None] * len(SERVERS)

    threads = [
        threading.Thread(
            target=send_to_server,
            args=(host, port, sub_matrices[i], B, results, i)
        )
        for i, (host, port) in enumerate(SERVERS)
    ]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    return np.vstack(results)


def multiply_serial(A, B):
    return np.dot(A, B)


def run_test(size):
    A = np.random.randint(0, 10, (size, size)).astype(float)
    B = np.random.randint(0, 10, (size, size)).astype(float)

    start = time.time()
    multiply_serial(A, B)
    serial_time = time.time() - start

    start = time.time()
    multiply_distributed(A, B)
    distributed_time = time.time() - start

    speedup    = serial_time / distributed_time if distributed_time > 0 else 0
    efficiency = speedup / len(SERVERS)

    print(f"\n[{size}x{size}] com {len(SERVERS)} servidor(es)")
    print(f"  Serial:      {serial_time:.4f}s")
    print(f"  Distribuido: {distributed_time:.4f}s")
    print(f"  Speedup:     {speedup:.2f}x")
    print(f"  Eficiencia:  {efficiency:.2%}")


if __name__ == "__main__":
    print("=" * 45)
    print("  Multiplicacao de Matrizes Distribuida")
    print("=" * 45)

    for size in TEST_SIZES:
        run_test(size)

    print("\n" + "=" * 45)
    print("  Testes concluidos.")
    print("=" * 45)
