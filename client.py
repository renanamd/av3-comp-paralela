import os
# Força 1 thread no serial — baseline de 1 núcleo para comparação justa com
# N servidores rodando em paralelo (cada um também com 1 thread via server.py).
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['OMP_NUM_THREADS']      = '1'
os.environ['MKL_NUM_THREADS']      = '1'

import socket
import pickle
import struct
import threading
import time
import numpy as np

from config import ALL_SERVERS, SERVER_CONFIGS, BUFFER_SIZE, TEST_SIZES, MAX_DISPLAY_SIZE, MAX_FILE_SIZE

OUTPUT_DIR = "output"


def receive_message(sock):
    raw_size = sock.recv(8)
    size = struct.unpack(">Q", raw_size)[0]

    chunks = []
    received = 0
    while received < size:
        chunk = sock.recv(min(BUFFER_SIZE, size - received))
        if not chunk:
            break
        chunks.append(chunk)
        received += len(chunk)

    return pickle.loads(b"".join(chunks))


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


def multiply_distributed(A, B, servers):
    sub_matrices = np.array_split(A, len(servers))
    results      = [None] * len(servers)

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


def salvar_matriz_txt(nome_arquivo, label, matriz):
    """Salva uma matriz em arquivo txt com cabeçalho descritivo."""
    rows, cols = matriz.shape
    caminho = os.path.join(OUTPUT_DIR, nome_arquivo)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(f"{label} ({rows}x{cols})\n")
        f.write("=" * (cols * 6) + "\n")
        for row in matriz:
            linha = "  ".join(f"{int(v):4d}" for v in row)
            f.write(f"[ {linha} ]\n")
    print(f"  💾 Salvo: {caminho}")


def salvar_matrizes(size, A, B, resultado):
    """Salva A, B e resultado em arquivos txt separados."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    salvar_matriz_txt(f"A_{size}x{size}.txt",          f"Matriz A",          A)
    salvar_matriz_txt(f"B_{size}x{size}.txt",          f"Matriz B",          B)
    salvar_matriz_txt(f"resultado_{size}x{size}.txt",  f"Resultado (A x B)", resultado)


def print_matrix(label, matrix):
    rows, cols = matrix.shape
    print(f"\n  {label} ({rows}x{cols}):")
    # Formata cada número com largura fixa para alinhar colunas
    for row in matrix:
        valores = "  ".join(f"{int(v):4d}" for v in row)
        print(f"    [ {valores} ]")


def run_test(size, A, B):
    """Roda o teste para uma configuração de tamanho, reaproveitando as mesmas matrizes."""

    # --- Exibe matrizes de entrada (apenas para tamanhos pequenos) ---
    if size <= MAX_DISPLAY_SIZE:
        print(f"\n{'─'*50}")
        print(f"  Matrizes geradas para [{size}x{size}]:")
        print_matrix("Matriz A", A)
        print_matrix("Matriz B", B)

    # --- Serial ---
    start = time.time()
    result_serial = multiply_serial(A, B)
    serial_time = time.time() - start

    if size <= MAX_DISPLAY_SIZE:
        print_matrix("Resultado Serial (A × B)", result_serial)

    # --- Salva arquivos txt para matrizes pequenas ---
    if size <= MAX_FILE_SIZE:
        salvar_matrizes(size, A, B, result_serial)

    print(f"\n{'─'*50}")
    print(f"  [{size}x{size}] — comparativo por número de servidores")
    print(f"{'─'*50}")
    print(f"  {'Config':<20} {'Tempo':>10} {'Speedup':>10} {'Eficiência':>12}")
    print(f"  {'Serial':<20} {serial_time:>9.4f}s {'—':>10} {'—':>12}")

    # --- Distribuído para cada configuração ---
    for n_servers in SERVER_CONFIGS:
        servers = ALL_SERVERS[:n_servers]

        start = time.time()
        result_dist = multiply_distributed(A, B, servers)
        dist_time = time.time() - start

        speedup    = serial_time / dist_time if dist_time > 0 else 0
        efficiency = speedup / n_servers

        label = f"Distribuído ({n_servers} serv.)"
        print(f"  {label:<20} {dist_time:>9.4f}s {speedup:>9.2f}x {efficiency:>11.2%}")

        # Exibe resultado distribuído para tamanhos pequenos
        if size <= MAX_DISPLAY_SIZE:
            print_matrix(f"  Resultado Distribuído ({n_servers} servidores)", result_dist)

            # Verifica se o resultado distribuído é igual ao serial
            if np.allclose(result_serial, result_dist):
                print(f"    ✔ Resultado idêntico ao serial")
            else:
                print(f"    ✘ DIVERGÊNCIA detectada!")


if __name__ == "__main__":
    print("=" * 50)
    print("  Multiplicacao de Matrizes Distribuida")
    print(f"  Servidores disponíveis: {[p for _, p in ALL_SERVERS]}")
    print(f"  Configs testadas: {SERVER_CONFIGS} servidores")
    print("=" * 50)

    for size in TEST_SIZES:
        # Gera as matrizes UMA vez e reutiliza em todos os testes do mesmo tamanho
        A = np.random.randint(0, 10, (size, size)).astype(float)
        B = np.random.randint(0, 10, (size, size)).astype(float)
        run_test(size, A, B)

    print("\n" + "=" * 50)
    print("  Testes concluidos.")
    print("=" * 50)
