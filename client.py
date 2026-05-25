import socket
import pickle
import struct
import threading
import time
import numpy as np

from config import SERVERS, SERVER_CONFIGS, BUFFER_SIZE, TEST_SIZES


# ──────────────────────────────────────────────
#  Comunicação via socket
# ──────────────────────────────────────────────

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


# ──────────────────────────────────────────────
#  Lógica de distribuição
# ──────────────────────────────────────────────

def send_to_server(host, port, sub_A, B, results, index):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    send_message(sock, {"sub_A": sub_A, "B": B})
    results[index] = receive_message(sock)
    sock.close()


def multiply_distributed(A, B, servers):
    sub_matrices = np.array_split(A, len(servers))
    results      = [None] * len(servers)

    # Cada thread representa uma máquina trabalhando em paralelo
    threads = [
        threading.Thread(
            target=send_to_server,
            args=(host, port, sub_matrices[i], B, results, i)
        )
        for i, (host, port) in enumerate(servers)
    ]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    return np.vstack(results)


def multiply_serial(A, B):
    return np.dot(A, B)


# ──────────────────────────────────────────────
#  Exibição
# ──────────────────────────────────────────────

def display_matrix(name, matrix, size):
    print(f"\n  {name}:")
    if size <= 20:
        print(matrix)
    else:
        print(f"  (matriz {size}x{size} — exibindo canto 4x4)")
        print(matrix[:4, :4])


def print_separator(title=""):
    print("\n" + "=" * 55)
    if title:
        print(f"  {title}")
        print("=" * 55)


# ──────────────────────────────────────────────
#  Execução dos testes
# ──────────────────────────────────────────────

def run_test(size):
    print_separator(f"Matriz {size}x{size}")

    A = np.random.randint(0, 10, (size, size)).astype(float)
    B = np.random.randint(0, 10, (size, size)).astype(float)

    display_matrix("Matriz A", A, size)
    display_matrix("Matriz B", B, size)

    # Execução serial
    start = time.time()
    result = multiply_serial(A, B)
    serial_time = time.time() - start

    display_matrix("Resultado C = A x B", result, size)
    print(f"\n  Tempo Serial: {serial_time:.4f}s")

    # Execução distribuída com 2 e 4 servidores
    for num_servers in SERVER_CONFIGS:
        servers   = SERVERS[:num_servers]
        start     = time.time()
        multiply_distributed(A, B, servers)
        dist_time = time.time() - start

        speedup    = serial_time / dist_time if dist_time > 0 else 0
        efficiency = speedup / num_servers

        print(f"\n  [{num_servers} servidores]")
        print(f"  Distribuido: {dist_time:.4f}s")
        print(f"  Speedup:     {speedup:.2f}x")
        print(f"  Eficiencia:  {efficiency:.2%}")


if __name__ == "__main__":
    print_separator("Multiplicacao de Matrizes Distribuida")

    for size in TEST_SIZES:
        run_test(size)

    print_separator("Testes concluidos")
