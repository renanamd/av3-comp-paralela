"""
Gera os gráficos de resultados em PNG para inserção no caderno de testes.
"""
import json, os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

os.makedirs("output", exist_ok=True)

with open("resultados.json", encoding="utf-8") as f:
    dados = json.load(f)

tamanhos_labels = ["10×10", "50×50", "100×100", "500×500", "1000×1000", "5000×5000"]
tamanhos_chaves = ["10", "50", "100", "500", "1000", "5000"]
x = np.arange(len(tamanhos_chaves))

speedup_2 = [float(dados[k]["speedup_2"]) for k in tamanhos_chaves]
speedup_4 = [float(dados[k]["speedup_4"]) for k in tamanhos_chaves]
eff_2     = [float(dados[k]["eff_2"])     for k in tamanhos_chaves]
eff_4     = [float(dados[k]["eff_4"])     for k in tamanhos_chaves]
serial    = [float(dados[k]["serial"])    for k in tamanhos_chaves]
dist_2    = [float(dados[k]["dist_2"])    for k in tamanhos_chaves]
dist_4    = [float(dados[k]["dist_4"])    for k in tamanhos_chaves]

AE = "#1F4E79"   # azul escuro
AM = "#2E75B6"   # azul médio
VD = "#1A7A4A"   # verde
CZ = "#64748B"   # cinza
VM = "#C0392B"   # vermelho

plt.rcParams.update({
    "font.family": "Arial",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.35,
    "grid.linestyle": "--",
})

# ── GRÁFICO 1: Speedup ─────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor("white")

ax.plot(x, speedup_2, marker="o", linewidth=2.2, color=AM, label="2 servidores", zorder=3)
ax.plot(x, speedup_4, marker="s", linewidth=2.2, color=AE, linestyle="--", label="4 servidores", zorder=3)
ax.axhline(1.0, color=VD, linewidth=1.5, linestyle=":", alpha=0.8, label="Speedup = 1 (limiar)")

# Destacar ponto onde speedup > 1
for i, (s2, s4) in enumerate(zip(speedup_2, speedup_4)):
    if s2 >= 1.0:
        ax.annotate(f"{s2:.2f}x", (x[i], s2), textcoords="offset points",
                    xytext=(0, 10), ha="center", fontsize=9, color=AM, fontweight="bold")
    if s4 >= 1.0:
        ax.annotate(f"{s4:.2f}x", (x[i], s4), textcoords="offset points",
                    xytext=(0, -16), ha="center", fontsize=9, color=AE, fontweight="bold")

ax.set_xticks(x)
ax.set_xticklabels(tamanhos_labels, fontsize=10)
ax.set_ylabel("Speedup  S(n) = T_serial / T_dist", fontsize=11)
ax.set_xlabel("Tamanho da Matriz", fontsize=11)
ax.set_title("Speedup por Tamanho de Matriz — Comparativo 2 vs 4 Servidores",
             fontsize=13, fontweight="bold", color=AE, pad=14)
ax.legend(fontsize=10, framealpha=0.9)
ax.set_facecolor("#F8FBFF")

# Faixa cinza para valores < 1
ax.axhspan(0, 1.0, alpha=0.06, color="gray")
ax.text(5.35, 0.5, "< 1\n(serial\nganhou)", fontsize=8, color="gray",
        ha="center", va="center")
ax.text(5.35, 1.06, "> 1\n(distribuído\nganhou)", fontsize=8, color=VD,
        ha="center", va="center")

plt.tight_layout()
plt.savefig("output/grafico_speedup.png", dpi=150, bbox_inches="tight")
plt.close()
print("Salvo: output/grafico_speedup.png")

# ── GRÁFICO 2: Eficiência ──────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor("white")

ax.bar(x - 0.2, eff_2, width=0.38, color=AM, alpha=0.85, label="2 servidores", zorder=3)
ax.bar(x + 0.2, eff_4, width=0.38, color=AE, alpha=0.85, label="4 servidores", zorder=3)

for i, (e2, e4) in enumerate(zip(eff_2, eff_4)):
    ax.text(x[i] - 0.2, e2 + 0.8, f"{e2:.1f}%", ha="center", va="bottom",
            fontsize=8, color=AM, fontweight="bold")
    ax.text(x[i] + 0.2, e4 + 0.8, f"{e4:.1f}%", ha="center", va="bottom",
            fontsize=8, color=AE, fontweight="bold")

ax.set_xticks(x)
ax.set_xticklabels(tamanhos_labels, fontsize=10)
ax.set_ylabel("Eficiência  E = S(n) / n  (%)", fontsize=11)
ax.set_xlabel("Tamanho da Matriz", fontsize=11)
ax.set_title("Eficiência por Tamanho de Matriz — Comparativo 2 vs 4 Servidores",
             fontsize=13, fontweight="bold", color=AE, pad=14)
ax.legend(fontsize=10, framealpha=0.9)
ax.set_facecolor("#F8FBFF")

plt.tight_layout()
plt.savefig("output/grafico_eficiencia.png", dpi=150, bbox_inches="tight")
plt.close()
print("Salvo: output/grafico_eficiencia.png")

# ── GRÁFICO 3: Tempo de execução (escala log) ──────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor("white")

ax.plot(x, serial, marker="^", linewidth=2.2, color=CZ,  label="Serial (1 núcleo)", zorder=3)
ax.plot(x, dist_2, marker="o", linewidth=2.2, color=AM,  label="Distribuído — 2 serv.", zorder=3)
ax.plot(x, dist_4, marker="s", linewidth=2.2, color=AE,  linestyle="--", label="Distribuído — 4 serv.", zorder=3)

ax.set_yscale("log")
ax.set_xticks(x)
ax.set_xticklabels(tamanhos_labels, fontsize=10)
ax.set_ylabel("Tempo (s) — escala logarítmica", fontsize=11)
ax.set_xlabel("Tamanho da Matriz", fontsize=11)
ax.set_title("Tempo de Execução por Configuração",
             fontsize=13, fontweight="bold", color=AE, pad=14)
ax.legend(fontsize=10, framealpha=0.9)
ax.set_facecolor("#F8FBFF")

# Anotação no cruzamento
ax.annotate("Serial cruza\n2 servidores aqui", xy=(x[5], serial[5]),
            xytext=(x[4] + 0.3, serial[5] * 3),
            arrowprops=dict(arrowstyle="->", color=VD, lw=1.5),
            fontsize=9, color=VD)

plt.tight_layout()
plt.savefig("output/grafico_tempo.png", dpi=150, bbox_inches="tight")
plt.close()
print("Salvo: output/grafico_tempo.png")

print("\nTodos os graficos gerados em output/")
