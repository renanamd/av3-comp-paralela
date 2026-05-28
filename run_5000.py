"""
Roda o teste 5000x5000 cinco vezes, calcula a média e salva em resultados.json.
Os outros tamanhos também são executados (são rápidos), mas apenas o 5000 é salvo.
"""
import subprocess, sys, time, re, json, os

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
        print(line, flush=True)
    proc.wait(timeout=600)
    return lines

def parse_5000(lines):
    """Extrai apenas os resultados do 5000x5000."""
    results = {}
    current = None
    for line in lines:
        m = re.search(r'\[(\d+)x\d+\].*comparativo', line)
        if m:
            current = int(m.group(1)); results[current] = {}; continue
        if current != 5000: continue
        if 'serial' not in results[current]:
            m = re.search(r'Serial\s+([\d.]+)s', line)
            if m: results[current]['serial'] = float(m.group(1)); continue
        m = re.search(r'Distribu\S+\s+\((\d+)\s+serv\.\)\s+([\d.]+)s\s+([\d.]+)x\s+([\d.]+)%', line)
        if m:
            n = int(m.group(1))
            results[current][f'dist_{n}']    = float(m.group(2))
            results[current][f'speedup_{n}'] = float(m.group(3))
            results[current][f'eff_{n}']     = float(m.group(4))
    return results.get(5000, {})

if __name__ == '__main__':
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'

    print("Iniciando 4 servidores...", flush=True)
    servers = start_servers()
    print(f"Servidores prontos. Rodando {N_RUNS} execucoes do 5000x5000...\n", flush=True)

    all_runs = []
    try:
        for i in range(1, N_RUNS + 1):
            print(f"\n{'='*45}", flush=True)
            print(f"  Execucao {i}/{N_RUNS}", flush=True)
            print(f"{'='*45}", flush=True)
            t0 = time.time()
            lines = run_client_once(env)
            elapsed = time.time() - t0
            r = parse_5000(lines)
            if r:
                all_runs.append(r)
                print(f"\n  -> 5000x5000 parsed em {elapsed:.1f}s: {r}\n", flush=True)
            else:
                print(f"\n  AVISO: execucao {i} nao produziu resultado 5000x5000\n", flush=True)
    finally:
        print("Encerrando servidores...", flush=True)
        stop_servers(servers)

    if not all_runs:
        print("Nenhum resultado coletado. Abortando.", flush=True)
        sys.exit(1)

    # Calcula médias
    metrics = ['serial', 'dist_2', 'speedup_2', 'eff_2', 'dist_4', 'speedup_4', 'eff_4']
    avg = {}
    for metric in metrics:
        vals = [r[metric] for r in all_runs if metric in r]
        avg[metric] = round(sum(vals) / len(vals), 4) if vals else 0

    resultado_5000 = {
        'serial':    f"{avg['serial']:.4f}",
        'dist_2':    f"{avg['dist_2']:.4f}",
        'speedup_2': f"{avg['speedup_2']:.2f}",
        'eff_2':     f"{avg['eff_2']:.2f}",
        'dist_4':    f"{avg['dist_4']:.4f}",
        'speedup_4': f"{avg['speedup_4']:.2f}",
        'eff_4':     f"{avg['eff_4']:.2f}",
    }

    # Salva preservando os outros tamanhos
    existing = {}
    if os.path.exists('resultados.json'):
        with open('resultados.json', encoding='utf-8') as f:
            existing = json.load(f)

    existing['5000'] = resultado_5000

    with open('resultados.json', 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

    print(f"\n=== Media de {len(all_runs)} execucoes — 5000x5000 ===")
    print(json.dumps(resultado_5000, indent=2))
    print("\nSalvo em resultados.json")
