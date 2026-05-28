"""
Executa o cliente N vezes, faz a média dos resultados e salva em resultados.json
Os 4 servidores ficam ligados durante todas as rodadas.
"""
import subprocess, sys, time, re, json, os
from collections import defaultdict

# Força UTF-8 no stdout para não quebrar com caracteres especiais
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

N_RUNS = 5

def start_servers():
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    servers = []
    for port in [5001, 5002, 5003, 5004]:
        p = subprocess.Popen(
            [sys.executable, 'server.py', str(port)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env
        )
        servers.append(p)
    time.sleep(2)
    return servers

def stop_servers(servers):
    for p in servers:
        p.terminate()
    for p in servers:
        try: p.wait(timeout=3)
        except: p.kill()

def run_client_once(env):
    lines = []
    proc = subprocess.Popen(
        [sys.executable, 'client.py'],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env
    )
    for raw in proc.stdout:
        line = raw.decode('utf-8', errors='replace').rstrip()
        lines.append(line)
    proc.wait(timeout=300)
    return lines

def parse_output(lines):
    results = {}
    current = None
    for line in lines:
        m = re.search(r'\[(\d+)x\d+\].*comparativo', line)
        if m:
            current = int(m.group(1)); results[current] = {}; continue
        if current is None: continue
        if 'serial' not in results[current]:
            m = re.search(r'Serial\s+([\d.]+)s', line)
            if m: results[current]['serial'] = float(m.group(1)); continue
        m = re.search(r'Distribu\S+\s+\((\d+)\s+serv\.\)\s+([\d.]+)s\s+([\d.]+)x\s+([\d.]+)%', line)
        if m:
            n = int(m.group(1))
            results[current][f'dist_{n}']    = float(m.group(2))
            results[current][f'speedup_{n}'] = float(m.group(3))
            results[current][f'eff_{n}']     = float(m.group(4))
    return results

def average_runs(all_runs):
    # all_runs: lista de dicts {size -> {metric -> float}}
    sizes = all_runs[0].keys()
    avg = {}
    for size in sizes:
        avg[size] = {}
        metrics = all_runs[0][size].keys()
        for metric in metrics:
            vals = [r[size][metric] for r in all_runs if metric in r.get(size, {})]
            avg[size][metric] = round(sum(vals) / len(vals), 4) if vals else None
    return avg

def format_results(avg):
    """Converte floats para strings formatadas."""
    out = {}
    for size, metrics in avg.items():
        out[str(size)] = {
            'serial':     f"{metrics.get('serial', 0):.4f}",
            'dist_2':     f"{metrics.get('dist_2', 0):.4f}",
            'speedup_2':  f"{metrics.get('speedup_2', 0):.2f}",
            'eff_2':      f"{metrics.get('eff_2', 0):.2f}",
            'dist_4':     f"{metrics.get('dist_4', 0):.4f}",
            'speedup_4':  f"{metrics.get('speedup_4', 0):.2f}",
            'eff_4':      f"{metrics.get('eff_4', 0):.2f}",
        }
    return out

if __name__ == '__main__':
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'

    print(f"Iniciando 4 servidores...", flush=True)
    servers = start_servers()
    print(f"Servidores prontos. Rodando {N_RUNS} execuções...\n", flush=True)

    all_runs = []
    try:
        for i in range(1, N_RUNS + 1):
            print(f"{'='*45}", flush=True)
            print(f"  Execução {i}/{N_RUNS}", flush=True)
            print(f"{'='*45}", flush=True)
            lines = run_client_once(env)
            for l in lines: print(l, flush=True)
            parsed = parse_output(lines)
            if parsed:
                all_runs.append(parsed)
                print(f"\n  → Execução {i} parseada: {list(parsed.keys())}\n", flush=True)
            else:
                print(f"\n  ⚠ Execução {i}: nenhum resultado parseado.\n", flush=True)
    finally:
        print("Encerrando servidores...", flush=True)
        stop_servers(servers)

    if not all_runs:
        print("Nenhum resultado coletado. Abortando.", flush=True)
        sys.exit(1)

    print(f"\nCalculando médias de {len(all_runs)} execuções...", flush=True)
    avg = average_runs(all_runs)
    final = format_results(avg)

    # Preserva resultados anteriores do 5000x5000 se existirem
    existing = {}
    if os.path.exists('resultados.json'):
        with open('resultados.json', encoding='utf-8') as f:
            existing = json.load(f)
    if '5000' in existing:
        final['5000'] = existing['5000']
        print("Resultado 5000x5000 preservado do arquivo anterior.", flush=True)

    with open('resultados.json', 'w', encoding='utf-8') as f:
        json.dump(final, f, indent=2, ensure_ascii=False)

    print("\n=== Médias finais ===")
    print(json.dumps(final, indent=2, ensure_ascii=False))
    print("\nSalvo em resultados.json")
