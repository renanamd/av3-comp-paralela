const pptxgen = require("pptxgenjs");

// ── Paleta ───────────────────────────────────────────────────────────
const AE  = "1F4E79";   // azul escuro
const AM  = "2E75B6";   // azul médio
const AC  = "D6E4F0";   // azul claro
const BR  = "FFFFFF";
const CZ  = "64748B";
const BG  = "F4F8FC";   // fundo claro dos slides de conteúdo
const VD  = "1A7A4A";   // verde (destaque positivo)
const VM  = "C0392B";   // vermelho (atenção)

const W = 10, H = 5.625, M = 0.45;

const makeShadow = () => ({ type: "outer", blur: 5, offset: 2, angle: 135, color: "000000", opacity: 0.13 });

let pres = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.author  = "Renan Almeida";
pres.title   = "Multiplicação de Matrizes Distribuída";

// ── Helper: faixa de título ───────────────────────────────────────────
function addTitleBar(slide, text, light = true) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.07,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });
  slide.addText(text, {
    x: M, y: 0.12, w: W - M - 0.2, h: 0.75,
    fontSize: 26, bold: true, fontFace: "Arial",
    color: light ? AE : BR, margin: 0
  });
}

// ── Helper: bloco colorido com título + corpo ─────────────────────────
function addCard(slide, x, y, w, h, headerText, bodyText, headerColor, bodyBg = "F0F7FF") {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.42,
    fill: { color: headerColor }, line: { color: headerColor, width: 0 }
  });
  slide.addText(headerText, {
    x, y, w, h: 0.42,
    fontSize: 13, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: y + 0.42, w, h: h - 0.42,
    fill: { color: bodyBg }, line: { color: headerColor, width: 1 }
  });
  slide.addText(bodyText, {
    x: x + 0.1, y: y + 0.5, w: w - 0.2, h: h - 0.6,
    fontSize: 12, fontFace: "Arial", color: "1E293B", align: "center"
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 1 — CAPA
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: AE };

  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.1, h: H,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 0.1, y: 2.18, w: W - 0.1, h: 0.05,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });

  sl.addText([
    { text: "Multiplicação de Matrizes", options: { breakLine: true } },
    { text: "Distribuída" }
  ], {
    x: 0.5, y: 0.7, w: 9, h: 1.5,
    fontSize: 40, bold: true, fontFace: "Arial", color: BR, align: "center"
  });

  sl.addText("Computação Paralela e Distribuída", {
    x: 0.5, y: 2.4, w: 9, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: AC, align: "center"
  });

  sl.addText("Renan Almeida   •   Maio de 2026", {
    x: 0.5, y: 3.1, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: AC, align: "center"
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 2 — O PROBLEMA
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "Por que Distribuir o Cálculo?");

  sl.addText([
    { text: "Multiplicação de matrizes tem complexidade O(n³)", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "n = 1.000  →  ~1 bilhão de operações", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "n = 5.000  →  ~125 bilhões de operações", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Em um único processador isso leva segundos a minutos", options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Solução: dividir o trabalho entre múltiplas máquinas", options: { bullet: true } },
  ], { x: M, y: 1.05, w: 5.4, h: 3.5, fontSize: 15, fontFace: "Arial", color: "1E293B" });

  // Painel direito: fórmula
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 6.3, y: 1.0, w: 3.3, h: 3.7,
    fill: { color: AE }, line: { color: AE, width: 0 }, shadow: makeShadow()
  });
  sl.addText("Fórmula", {
    x: 6.3, y: 1.1, w: 3.3, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: AC, align: "center", bold: true
  });
  sl.addText("C[i][j] = Σ A[i][k] × B[k][j]", {
    x: 6.3, y: 1.55, w: 3.3, h: 0.55,
    fontSize: 13, fontFace: "Courier New", color: BR, align: "center", bold: true
  });
  sl.addText("k = 0 ... n-1", {
    x: 6.3, y: 2.1, w: 3.3, h: 0.35,
    fontSize: 12, fontFace: "Courier New", color: AC, align: "center"
  });

  // Estatísticas
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 6.45, y: 2.65, w: 1.35, h: 0.85,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });
  sl.addText([
    { text: "n=1.000", options: { breakLine: true } },
    { text: "~1 bilhão ops" }
  ], { x: 6.45, y: 2.65, w: 1.35, h: 0.85, fontSize: 10, fontFace: "Arial", color: BR, align: "center", valign: "middle" });

  sl.addShape(pres.shapes.RECTANGLE, {
    x: 8.0, y: 2.65, w: 1.45, h: 0.85,
    fill: { color: VM }, line: { color: VM, width: 0 }
  });
  sl.addText([
    { text: "n=5.000", options: { breakLine: true } },
    { text: "~125 bilhões ops" }
  ], { x: 8.0, y: 2.65, w: 1.45, h: 0.85, fontSize: 10, fontFace: "Arial", color: BR, align: "center", valign: "middle" });

  sl.addText("Torna o paralelismo essencial para n grandes", {
    x: 6.3, y: 3.65, w: 3.3, h: 0.5,
    fontSize: 11, fontFace: "Arial", color: AC, align: "center", italic: true
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 3 — CONCORRÊNCIA E PARALELISMO
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BR };
  addTitleBar(sl, "Concorrência e Paralelismo");

  // Coluna esquerda
  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 1.0, w: 4.2, h: 0.42,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });
  sl.addText("No Conceito", {
    x: M, y: 1.0, w: 4.2, h: 0.42,
    fontSize: 14, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
  });
  sl.addText([
    { text: "Concorrência", options: { bold: true, color: AE, breakLine: true } },
    { text: "Múltiplas tarefas progridem de forma intercalada. Não precisam acontecer ao mesmo instante.", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "Paralelismo", options: { bold: true, color: AE, breakLine: true } },
    { text: "Execução simultânea real em hardware dedicado (múltiplos núcleos ou máquinas).", options: {} }
  ], { x: M, y: 1.5, w: 4.2, h: 3.7, fontSize: 14, fontFace: "Arial", color: "374151" });

  // Divisor
  sl.addShape(pres.shapes.LINE, {
    x: 5.0, y: 1.0, w: 0, h: 4.3,
    line: { color: AC, width: 1.5, dashType: "dash" }
  });

  // Coluna direita
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.4, y: 1.0, w: 4.2, h: 0.42,
    fill: { color: AE }, line: { color: AE, width: 0 }
  });
  sl.addText("No Projeto", {
    x: 5.4, y: 1.0, w: 4.2, h: 0.42,
    fontSize: 14, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
  });
  sl.addText([
    { text: "threading.Thread no cliente", options: { bold: true, color: AM, breakLine: true } },
    { text: "Paralelismo de dados: todas as threads disparam ao mesmo tempo, cada uma para um servidor.", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "Servidores como processos independentes", options: { bold: true, color: AM, breakLine: true } },
    { text: "Computação distribuída: cada worker tem memória própria e calcula sua fatia de forma autônoma.", options: {} }
  ], { x: 5.4, y: 1.5, w: 4.2, h: 3.7, fontSize: 14, fontFace: "Arial", color: "374151" });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 4 — ARQUITETURA
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "Arquitetura: 3 Arquivos, 1 Sistema");

  const files = [
    { name: "config.py",  color: AM,  desc: "Configurações globais\nServidores, tamanhos\ne limites de exibição" },
    { name: "server.py",  color: VD,  desc: "Worker independente\nRecebe sub_A e B\nCalcula np.dot" },
    { name: "client.py",  color: AE,  desc: "Coordenador\nDivide, distribui\nColeta e exibe métricas" },
  ];

  files.forEach((f, i) => {
    const x = M + i * 3.0;
    sl.addShape(pres.shapes.RECTANGLE, {
      x, y: 0.95, w: 2.7, h: 0.45,
      fill: { color: f.color }, line: { color: f.color, width: 0 }
    });
    sl.addText(f.name, {
      x, y: 0.95, w: 2.7, h: 0.45,
      fontSize: 15, bold: true, fontFace: "Courier New", color: BR, align: "center", valign: "middle"
    });
    sl.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.4, w: 2.7, h: 1.35,
      fill: { color: "EBF5FB" }, line: { color: f.color, width: 1.2 }
    });
    sl.addText(f.desc, {
      x: x + 0.1, y: 1.45, w: 2.5, h: 1.25,
      fontSize: 12, fontFace: "Arial", color: "1E293B", align: "center"
    });
  });

  // Fluxo
  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 3.0, w: W - M * 2, h: 0.04,
    fill: { color: AC }, line: { color: AC, width: 0 }
  });

  sl.addText("Fluxo de execução:", {
    x: M, y: 3.1, w: 2.0, h: 0.35,
    fontSize: 12, bold: true, fontFace: "Arial", color: AE
  });

  // Blocos do fluxo
  const fluxo = ["client.py", "Thread 1→ :5001", "Thread 2→ :5002", "Thread 3→ :5003", "Thread 4→ :5004", "np.vstack()"];
  const fColors = [AE, AM, AM, AM, AM, VD];
  fluxo.forEach((label, i) => {
    const bw = i === 0 || i === 5 ? 1.35 : 1.35;
    const bx = M + i * 1.52;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: 3.5, w: 1.35, h: 0.55,
      fill: { color: fColors[i] }, line: { color: fColors[i], width: 0 }
    });
    sl.addText(label, {
      x: bx, y: 3.5, w: 1.35, h: 0.55,
      fontSize: 10, fontFace: i === 0 || i === 5 ? "Courier New" : "Arial",
      color: BR, align: "center", valign: "middle"
    });
    if (i < fluxo.length - 1) {
      sl.addText("→", {
        x: bx + 1.35, y: 3.5, w: 0.17, h: 0.55,
        fontSize: 12, fontFace: "Arial", color: CZ, align: "center", valign: "middle"
      });
    }
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 5 — FOSTER PCAM
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BR };
  addTitleBar(sl, "Metodologia de Foster (PCAM) no Projeto");

  const pcam = [
    { letter: "P", title: "Particionamento", color: "1A5276",
      desc: "np.array_split(A, n)\ndivide A em blocos de\nlinhas iguais entre\nos workers" },
    { letter: "C", title: "Comunicação", color: "1F618D",
      desc: "Cada servidor recebe\nsub_A + B completa\nvia TCP. Devolve\nsub_resultado." },
    { letter: "A", title: "Aglomeração", color: AM,
      desc: "Todo o bloco de linhas\né enviado de uma vez.\nUma conexão\npor servidor." },
    { letter: "M", title: "Mapeamento", color: AE,
      desc: "Uma thread por servidor.\nHost e porta definidos\nno config.py.\nBalanceamento automático." },
  ];

  pcam.forEach((item, i) => {
    const x = M + i * 2.25;

    sl.addShape(pres.shapes.OVAL, {
      x: x + 0.65, y: 1.0, w: 0.95, h: 0.95,
      fill: { color: item.color }, line: { color: item.color, width: 0 }
    });
    sl.addText(item.letter, {
      x: x + 0.65, y: 1.0, w: 0.95, h: 0.95,
      fontSize: 28, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
    });

    sl.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.08, w: 2.1, h: 0.42,
      fill: { color: item.color }, line: { color: item.color, width: 0 }
    });
    sl.addText(item.title, {
      x, y: 2.08, w: 2.1, h: 0.42,
      fontSize: 12, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
    });

    sl.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.5, w: 2.1, h: 2.7,
      fill: { color: "F0F7FF" }, line: { color: item.color, width: 1.2 }
    });
    sl.addText(item.desc, {
      x: x + 0.1, y: 2.55, w: 1.9, h: 2.6,
      fontSize: 12, fontFace: "Arial", color: "1E293B", align: "center"
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 6 — FLUXO DE EXECUÇÃO
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "O que Acontece ao Rodar  python client.py");

  const steps = [
    { n: "1", txt: "Gera matrizes A e B com inteiros aleatórios 0–9" },
    { n: "2", txt: "Calcula np.dot(A,B) serial → mede tempo base" },
    { n: "3", txt: "Se tamanho ≤ 100×100 → salva .txt em output/" },
    { n: "4", txt: "Divide A com np.array_split (2, depois 4 partes)" },
    { n: "5", txt: "Dispara threads → cada uma conecta a um servidor TCP" },
    { n: "6", txt: "Servidores calculam np.dot(sub_A, B) em paralelo" },
    { n: "7", txt: "Cliente remonta com np.vstack e mede tempo total" },
    { n: "8", txt: "Exibe Speedup = T_serial / T_dist  e  Eficiência = S(n)/n" },
  ];

  const cH = 0.82, cW = 4.25, startY = 1.0;
  steps.forEach((s, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = col === 0 ? M : M + 5.1;
    const y = startY + row * (cH + 0.06);

    sl.addShape(pres.shapes.OVAL, {
      x, y: y + 0.1, w: 0.58, h: 0.58,
      fill: { color: AE }, line: { color: AE, width: 0 }
    });
    sl.addText(s.n, {
      x, y: y + 0.1, w: 0.58, h: 0.58,
      fontSize: 14, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
    });
    sl.addText(s.txt, {
      x: x + 0.68, y, w: cW - 0.68, h: cH,
      fontSize: 13, fontFace: "Arial", color: "1E293B", valign: "middle"
    });
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 7 — PROTOCOLO DE COMUNICAÇÃO
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BR };
  addTitleBar(sl, "Como os Dados Viajam pela Rede");

  const etapas = [
    { txt: "pickle.dumps({sub_A, B})",      color: AE },
    { txt: "struct.pack: 8 bytes de tamanho", color: "1A6B3C" },
    { txt: "sendall() via socket TCP",        color: AM },
    { txt: "np.dot(sub_A, B) no servidor",   color: "7D3C98" },
    { txt: "pickle.loads() → resultado",      color: VM },
  ];

  etapas.forEach((e, i) => {
    const y = 1.05 + i * 0.83;
    sl.addShape(pres.shapes.RECTANGLE, {
      x: M, y, w: 4.5, h: 0.65,
      fill: { color: e.color }, line: { color: e.color, width: 0 }
    });
    sl.addText(e.txt, {
      x: M, y, w: 4.5, h: 0.65,
      fontSize: 12, fontFace: "Courier New", color: BR, align: "center", valign: "middle"
    });
    if (i < etapas.length - 1) {
      sl.addText("↓", {
        x: M + 1.9, y: y + 0.65, w: 0.7, h: 0.18,
        fontSize: 12, fontFace: "Arial", color: CZ, align: "center"
      });
    }
  });

  // Painel direito
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 1.0, w: 4.1, h: 4.25,
    fill: { color: "F0F7FF" }, line: { color: AC, width: 1 }
  });
  sl.addText("Por que assim?", {
    x: 5.5, y: 1.05, w: 4.1, h: 0.42,
    fontSize: 14, bold: true, fontFace: "Arial", color: AE, align: "center"
  });
  sl.addText([
    { text: "TCP garante entrega ordenada e sem perdas", options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Prefixo de 8 bytes resolve onde a mensagem termina", options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
    { text: "pickle serializa arrays NumPy nativamente, com tipo e forma", options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Leitura em loop de chunks de 8192 bytes por vez", options: { bullet: true } },
  ], { x: 5.65, y: 1.55, w: 3.8, h: 3.5, fontSize: 13, fontFace: "Arial", color: "374151" });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 8 — CASOS DE TESTE
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "12 Casos de Teste");

  sl.addText("6 tamanhos de matriz  ×  2 configurações de servidores", {
    x: M, y: 0.88, w: 9.1, h: 0.28,
    fontSize: 13, fontFace: "Arial", color: CZ, italic: true
  });

  const rows = [
    ["10 × 10",       "Caso 1",  "Caso 2"],
    ["50 × 50",       "Caso 3",  "Caso 4"],
    ["100 × 100",     "Caso 5",  "Caso 6"],
    ["500 × 500",     "Caso 7",  "Caso 8"],
    ["1.000 × 1.000", "Caso 9",  "Caso 10"],
    ["5.000 × 5.000", "Caso 11", "Caso 12"],
  ];

  const tableData = [
    [
      { text: "Tamanho",       options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
      { text: "2 Servidores",  options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
      { text: "4 Servidores",  options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
    ],
    ...rows.map((r, i) => r.map((cell, j) => ({
      text: cell,
      options: {
        fill: { color: i % 2 === 0 ? BR : "EBF3FB" },
        color: j === 0 ? AE : "1E293B",
        bold: j === 0,
        align: "center"
      }
    })))
  ];

  sl.addTable(tableData, {
    x: 1.6, y: 1.25, w: 6.8, h: 3.45,
    colW: [2.5, 2.15, 2.15],
    border: { pt: 0.5, color: "BBCFDF" },
    fontSize: 14, fontFace: "Arial"
  });

  sl.addText("Para 10×10, 50×50 e 100×100: matrizes A, B e resultado são salvas automaticamente em arquivos .txt na pasta output/", {
    x: M, y: 5.0, w: 9.1, h: 0.38,
    fontSize: 11, fontFace: "Arial", color: CZ, italic: true, align: "center"
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 9 — TEMPOS DE EXECUÇÃO
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "Tempos de Execução por Caso de Teste");

  sl.addText("Média de 5 execuções  •  OPENBLAS_NUM_THREADS=1  •  Verde = distribuído mais rápido que serial", {
    x: M, y: 0.88, w: 9.1, h: 0.28,
    fontSize: 12, fontFace: "Arial", color: CZ, italic: true, align: "center"
  });

  const timeRows = [
    ["10×10",       "< 0.0001", "0.0092", "0.0034"],
    ["50×50",       "< 0.0001", "0.0039", "0.0045"],
    ["100×100",     "0.0001",   "0.0033", "0.0045"],
    ["500×500",     "0.0071",   "0.0225", "0.0238"],
    ["1.000×1.000", "0.0497",   "0.0948", "0.1011"],
    ["5.000×5.000", "5.2974",   "4.9209", "4.9784"],
  ];

  // serial (s): col 1; dist_2 (s): col 2; dist_4 (s): col 3
  // verde se dist < serial; vermelho se dist > serial
  const serialVals = [0.00001, 0.00001, 0.0001, 0.0071, 0.0497, 5.2974];

  const timeData = [
    [
      { text: "Tamanho",             options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
      { text: "T. Serial (s)",       options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
      { text: "T. 2 Servidores (s)", options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
      { text: "T. 4 Servidores (s)", options: { bold: true, color: BR, fill: { color: AE }, align: "center" } },
    ],
    ...timeRows.map((r, i) => {
      const bg    = i % 2 === 0 ? "F0F7FF" : BR;
      const sv    = serialVals[i];
      const d2    = parseFloat(r[2]);
      const d4    = parseFloat(r[3]);
      const c2    = d2 < sv ? VD : VM;
      const c4    = d4 < sv ? VD : VM;
      return [
        { text: r[0], options: { fill: { color: bg }, color: AE,       bold: true, align: "center" } },
        { text: r[1], options: { fill: { color: bg }, color: "374151",             align: "center" } },
        { text: r[2], options: { fill: { color: bg }, color: c2,        bold: d2 < sv, align: "center" } },
        { text: r[3], options: { fill: { color: bg }, color: c4,        bold: d4 < sv, align: "center" } },
      ];
    })
  ];

  sl.addTable(timeData, {
    x: 1.1, y: 1.22, w: 7.8, h: 3.8,
    colW: [2.2, 1.87, 1.87, 1.86],
    border: { pt: 0.5, color: "BBCFDF" },
    fontSize: 14, fontFace: "Arial"
  });

  sl.addText("Todos os tempos em segundos (s)  •  Comparação justa: serial = 1 núcleo, cada servidor = 1 núcleo", {
    x: M, y: 5.22, w: 9.1, h: 0.35,
    fontSize: 11, fontFace: "Arial", color: CZ, italic: true, align: "center"
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 10 — RESULTADOS
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BR };
  addTitleBar(sl, "Resultados: Speedup e Eficiência");

  // Fórmulas
  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 0.95, w: W - M * 2, h: 0.55,
    fill: { color: AE }, line: { color: AE, width: 0 }
  });
  sl.addText("S(n) = T_serial / T_paralelo          |          E = S(n) / n", {
    x: M, y: 0.95, w: W - M * 2, h: 0.55,
    fontSize: 14, bold: true, fontFace: "Courier New", color: BR, align: "center", valign: "middle"
  });

  // Resultados finais — numpy single-thread (OPENBLAS_NUM_THREADS=1), média 5 runs
  const resRows = [
    ["10×10",       "<0.0001", "0.01x", "0.01x",  "0.26%",  "0.36%"],
    ["50×50",       "<0.0001", "0.02x", "0.01x",  "0.86%",  "0.26%"],
    ["100×100",     "0.0001",  "0.04x", "0.03x",  "2.05%",  "0.75%"],
    ["500×500",     "0.0071",  "0.32x", "0.30x", "16.02%",  "7.38%"],
    ["1.000×1.000", "0.0497",  "0.53x", "0.50x", "26.50%", "12.61%"],
    ["5.000×5.000", "5.2974",  "1.07x", "1.08x", "53.73%", "26.89%"],
  ];

  const resData = [
    [
      { text: "Tamanho",       options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
      { text: "T. Serial (s)", options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
      { text: "Spd. 2 Srv.",   options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
      { text: "Spd. 4 Srv.",   options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
      { text: "Efic. 2 Srv.",  options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
      { text: "Efic. 4 Srv.",  options: { bold: true, color: BR, fill: { color: AM }, align: "center" } },
    ],
    ...resRows.map((r, i) => {
      const bg = i % 2 === 0 ? "F0F7FF" : BR;
      const isPending = r[2] === "—";
      const spd2Val = parseFloat(r[2]);
      const spd4Val = parseFloat(r[3]);
      const spd2Color = isPending ? CZ : (spd2Val >= 1 ? VD : VM);
      const spd4Color = isPending ? CZ : (spd4Val >= 1 ? VD : VM);
      return [
        { text: r[0], options: { fill: { color: bg }, color: AE, bold: true, align: "center" } },
        { text: r[1], options: { fill: { color: bg }, color: "1E293B", align: "center" } },
        { text: r[2], options: { fill: { color: bg }, color: spd2Color, bold: spd2Val >= 1, align: "center" } },
        { text: r[3], options: { fill: { color: bg }, color: spd4Color, bold: spd4Val >= 1, align: "center" } },
        { text: r[4], options: { fill: { color: bg }, color: isPending ? CZ : "374151", align: "center" } },
        { text: r[5], options: { fill: { color: bg }, color: isPending ? CZ : "374151", align: "center" } },
      ];
    })
  ];

  sl.addTable(resData, {
    x: M, y: 1.6, w: W - M * 2, h: 3.0,
    colW: [1.6, 1.4, 1.4, 1.4, 1.4, 1.48],
    border: { pt: 0.5, color: "BBCFDF" },
    fontSize: 12, fontFace: "Arial"
  });

  sl.addText("Média de 5 execuções  •  Baseline: numpy single-thread (OPENBLAS_NUM_THREADS=1)  •  Valores em verde = distribuído ganhou do serial", {
    x: M, y: 4.88, w: W - M * 2, h: 0.5,
    fontSize: 10, fontFace: "Arial", color: CZ, italic: true, align: "center"
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 10 — GRÁFICOS DOS RESULTADOS
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: BG };
  addTitleBar(sl, "Gráficos dos Resultados");

  // ── Speedup (esquerda, maior) ──────────────────────────────────────
  sl.addImage({ path: "output/grafico_speedup.png", x: M, y: 0.95, w: 5.3, h: 2.94 });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 3.93, w: 5.3, h: 0.26,
    fill: { color: AC }, line: { color: AC, width: 0 }
  });
  sl.addText("Speedup por Tamanho — 2 vs 4 Servidores", {
    x: M, y: 3.93, w: 5.3, h: 0.26,
    fontSize: 10, fontFace: "Arial", color: AE, align: "center", bold: true
  });

  // ── Eficiência (direita, superior) ────────────────────────────────
  sl.addImage({ path: "output/grafico_eficiencia.png", x: 5.9, y: 0.95, w: 3.65, h: 2.03 });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.9, y: 3.01, w: 3.65, h: 0.23,
    fill: { color: "D6EED9" }, line: { color: "D6EED9", width: 0 }
  });
  sl.addText("Eficiência por Tamanho (%)", {
    x: 5.9, y: 3.01, w: 3.65, h: 0.23,
    fontSize: 10, fontFace: "Arial", color: VD, align: "center", bold: true
  });

  // ── Tempo de execução (direita, inferior) ─────────────────────────
  sl.addImage({ path: "output/grafico_tempo.png", x: 5.9, y: 3.35, w: 3.65, h: 2.03 });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: 5.9, y: 5.41, w: 3.65, h: 0.21,
    fill: { color: "E2E8F0" }, line: { color: "E2E8F0", width: 0 }
  });
  sl.addText("Tempo de Execução (escala logarítmica)", {
    x: 5.9, y: 5.41, w: 3.65, h: 0.21,
    fontSize: 10, fontFace: "Arial", color: CZ, align: "center", bold: true
  });
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 11 — CONCLUSÃO
// ════════════════════════════════════════════════════════════════════
{
  let sl = pres.addSlide();
  sl.background = { color: AE };

  sl.addText("Conclusões", {
    x: M, y: 0.25, w: 9.1, h: 0.7,
    fontSize: 30, bold: true, fontFace: "Arial", color: BR
  });
  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 0.95, w: 9.1, h: 0.05,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });

  const items = [
    { cor: VD,  txt: "5.000×5.000: speedup 1,07x (2 srv.) e 1,08x (4 srv.) — primeiro tamanho onde distribuir ganhou do serial" },
    { cor: VD,  txt: "2 e 4 servidores empatados em 5000×5000: ganho de cálculo equilibrou exatamente o custo de enviar B a mais" },
    { cor: VM,  txt: "Bug O(n²) corrigido: data += chunk travou por 1h — lista + join reduziu para O(n)" },
    { cor: VD,  txt: "Tendência confirmada: speedup de 0,01x (10×10) até 1,08x (5000×5000) — Lei de Amdahl na prática" },
  ];

  items.forEach((item, i) => {
    const y = 1.15 + i * 0.85;
    sl.addShape(pres.shapes.OVAL, {
      x: M, y: y + 0.12, w: 0.52, h: 0.52,
      fill: { color: item.cor }, line: { color: item.cor, width: 0 }
    });
    sl.addText("✓", {
      x: M, y: y + 0.12, w: 0.52, h: 0.52,
      fontSize: 16, bold: true, fontFace: "Arial", color: BR, align: "center", valign: "middle"
    });
    sl.addText(item.txt, {
      x: M + 0.65, y, w: 8.5, h: 0.78,
      fontSize: 15, fontFace: "Arial", color: BR, valign: "middle"
    });
  });

  sl.addShape(pres.shapes.RECTANGLE, {
    x: M, y: 4.72, w: 9.1, h: 0.62,
    fill: { color: AM }, line: { color: AM, width: 0 }
  });
  sl.addText("→  Próximos passos: pré-distribuir B uma única vez  •  reutilizar conexões TCP  •  distribuir B em colunas para 4 servidores", {
    x: M, y: 4.72, w: 9.1, h: 0.62,
    fontSize: 12, fontFace: "Arial", color: BR, align: "center", valign: "middle"
  });
}

// ── Gera o arquivo ────────────────────────────────────────────────────
pres.writeFile({ fileName: "C:\\Users\\renan.almeida\\Desktop\\av3-comp-paralela\\apresentacao.pptx" })
  .then(() => console.log("Apresentação gerada: apresentacao.pptx"))
  .catch(err => { console.error("Erro:", err); process.exit(1); });
