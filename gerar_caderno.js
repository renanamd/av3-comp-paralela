const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, HeadingLevel, LevelFormat,
  BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, TableOfContents, ImageRun
} = require('docx');
const fs = require('fs');

// Imagens dos gráficos
const imgSpeedup   = fs.readFileSync("output/grafico_speedup.png");
const imgEficiencia = fs.readFileSync("output/grafico_eficiencia.png");
const imgTempo     = fs.readFileSync("output/grafico_tempo.png");

const grafico = (imgBuffer, altText) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 200 },
  children: [new ImageRun({
    type: "png",
    data: imgBuffer,
    transformation: { width: 580, height: 323 },
    altText: { title: altText, description: altText, name: altText }
  })]
});

const AZUL_ESCURO = "1F4E79";
const AZUL        = "2E75B6";
const CINZA_ALT   = "EBF3FB";
const BRANCO      = "FFFFFF";
const CONTENT_WIDTH = 9026;

const borda  = (c = "AAAAAA") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const bordas = { top: borda(), bottom: borda(), left: borda(), right: borda() };
const bordasH = { top: borda(AZUL_ESCURO), bottom: borda(AZUL_ESCURO), left: borda(AZUL_ESCURO), right: borda(AZUL_ESCURO) };

const titulo = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text, bold: true, size: 56, color: AZUL_ESCURO, font: "Arial" })]
});

const subtitulo = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, size: 28, color: AZUL, font: "Arial" })]
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  pageBreakBefore: true,
  spacing: { before: 0, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, color: AZUL_ESCURO, font: "Arial" })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, color: AZUL, font: "Arial" })]
});

const p = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 160 },
  children: [new TextRun({ text, size: 24, font: "Arial" })]
});

const pMix = (runs) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 160 },
  children: runs
});

const li = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 100 },
  children: [new TextRun({ text, size: 24, font: "Arial" })]
});

const formula = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 160, after: 160 },
  children: [new TextRun({ text, bold: true, size: 26, font: "Courier New", color: AZUL_ESCURO })]
});

const nb = (text) => new TextRun({ text, bold: true, size: 24, font: "Arial" });
const n  = (text) => new TextRun({ text, size: 24, font: "Arial" });
const esp = () => new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] });

// Bloco de referência ao código — barra azul à esquerda
const refCod = (arquivo, trecho) => new Paragraph({
  spacing: { before: 120, after: 160 },
  indent: { left: 360 },
  border: { left: { style: BorderStyle.THICK, size: 14, color: AZUL, space: 10 } },
  children: [
    new TextRun({ text: `📄 ${arquivo}  `, bold: true, size: 22, font: "Courier New", color: AZUL }),
    new TextRun({ text: trecho, size: 22, font: "Courier New", color: "374151" }),
  ]
});
const linhas = (qtd) => Array.from({ length: qtd }, () =>
  new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "", size: 24, font: "Arial" })] })
);

function celula(texto, opts = {}) {
  const { bold = false, color = "000000", fill = BRANCO, width, align = AlignmentType.CENTER, borders: b = bordas } = opts;
  return new TableCell({
    borders: b, shading: { fill, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: texto, bold, color, size: 22, font: "Arial" })] })]
  });
}
const celulaH = (texto, width) => celula(texto, { bold: true, color: BRANCO, fill: AZUL_ESCURO, width, borders: bordasH });

// Tabela de casos
// Casos: 18 linhas — 6 tamanhos × 3 configurações (1 servidor serial, 2 dist., 4 dist.)
// Colunas: Caso | Tamanho | Nº Serv. | T. Execução (s) | Speedup | Eficiência (%)
// Serial (1 servidor) é a linha de referência de cada grupo — Speedup e Eficiência = —
const COL = [700, 1600, 1500, 2026, 1500, 1700]; // soma = 9026
const casos = [
  ["1", "10×10",     "1 (serial)", "< 0.0001", "—",    "—"    ],
  ["2", "10×10",     "2",          "0.0092",   "0.01", "0.26" ],
  ["3", "10×10",     "4",          "0.0034",   "0.01", "0.36" ],
  ["4", "50×50",     "1 (serial)", "< 0.0001", "—",    "—"    ],
  ["5", "50×50",     "2",          "0.0039",   "0.02", "0.86" ],
  ["6", "50×50",     "4",          "0.0045",   "0.01", "0.26" ],
  ["7", "100×100",   "1 (serial)", "0.0001",   "—",    "—"    ],
  ["8", "100×100",   "2",          "0.0033",   "0.04", "2.05" ],
  ["9", "100×100",   "4",          "0.0045",   "0.03", "0.75" ],
  ["10","500×500",   "1 (serial)", "0.0071",   "—",    "—"    ],
  ["11","500×500",   "2",          "0.0225",   "0.32", "16.02"],
  ["12","500×500",   "4",          "0.0238",   "0.30", "7.38" ],
  ["13","1000×1000", "1 (serial)", "0.0497",   "—",    "—"    ],
  ["14","1000×1000", "2",          "0.0948",   "0.53", "26.50"],
  ["15","1000×1000", "4",          "0.1011",   "0.50", "12.61"],
  ["16","5000×5000", "1 (serial)", "5.2974",   "—",    "—"    ],
  ["17","5000×5000", "2",          "4.9209",   "1.07", "53.73"],
  ["18","5000×5000", "4",          "4.9784",   "1.08", "26.89"],
];
// Grupos de 3 linhas (serial + 2srv + 4srv) — fundo alternado por grupo de tamanho
const tabelaCasos = new Table({
  width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: COL,
  rows: [
    new TableRow({ tableHeader: true, children: [
      celulaH("Caso",COL[0]), celulaH("Tamanho",COL[1]), celulaH("Nº Serv.",COL[2]),
      celulaH("T. Execução (s)",COL[3]), celulaH("Speedup",COL[4]), celulaH("Eficiência (%)",COL[5]),
    ]}),
    ...casos.map((row, i) => {
      const grupo = Math.floor(i / 3); // 0–5
      const isSerial = row[2] === "1 (serial)";
      const fill = isSerial ? "D6E4F0" : (grupo % 2 === 0 ? BRANCO : CINZA_ALT);
      return new TableRow({
        children: row.map((val, j) => celula(val, {
          width: COL[j],
          fill,
          color: isSerial && j >= 4 ? "888888" : "000000",
        }))
      });
    })
  ]
});

// Tabela de arquivos
const COL_ARQ = [1500, 3000, 4526];
const tabelaArquivos = new Table({
  width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: COL_ARQ,
  rows: [
    new TableRow({ tableHeader: true, children: [
      celulaH("Tamanho",COL_ARQ[0]), celulaH("Arquivos gerados",COL_ARQ[1]), celulaH("Pasta",COL_ARQ[2]),
    ]}),
    ...[
      ["10×10",   "A_10x10.txt, B_10x10.txt, resultado_10x10.txt",       "output/"],
      ["50×50",   "A_50x50.txt, B_50x50.txt, resultado_50x50.txt",       "output/"],
      ["100×100", "A_100x100.txt, B_100x100.txt, resultado_100x100.txt", "output/"],
    ].map((row, i) => new TableRow({
      children: row.map((val, j) => celula(val, {
        width: COL_ARQ[j], fill: i % 2 === 0 ? BRANCO : CINZA_ALT,
        align: j === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
      }))
    }))
  ]
});

const rodape = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "Computação Paralela e Distribuída  |  Renan Almeida  |  Página ", size: 20, font: "Arial", color: "888888" }),
      new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Arial", color: "888888" }),
      new TextRun({ text: " de ", size: 20, font: "Arial", color: "888888" }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20, font: "Arial", color: "888888" }),
    ]
  })]
});

const pageProps = { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } };

const doc = new Document({
  numbering: {
    config: [{ reference: "bullets", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]}]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: AZUL_ESCURO },
        paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: AZUL },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [
    // ── CAPA ─────────────────────────────────────────────────────
    {
      properties: { page: pageProps },
      children: [
        new Paragraph({ spacing: { after: 2000 }, children: [new TextRun("")] }),
        titulo("Caderno de Testes"),
        titulo("Multiplicação de Matrizes Distribuída"),
        new Paragraph({ spacing: { before: 600, after: 0 }, children: [new TextRun("")] }),
        subtitulo("Aluno: Renan Almeida"),
        subtitulo("Disciplina: Computação Paralela e Distribuída"),
        subtitulo("Maio de 2026"),
      ]
    },

    // ── CONTEÚDO ─────────────────────────────────────────────────
    {
      properties: { page: pageProps },
      footers: { default: rodape },
      children: [

        // SUMÁRIO
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: "Sumário", bold: true, size: 36, font: "Arial", color: AZUL_ESCURO })]
        }),
        new TableOfContents("Sumário", {
          hyperlink: true,
          headingStyleRange: "1-2",
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 1. CONCORRÊNCIA ──────────────────────────────────────
        h1("1. Concorrência"),

        h2("1.1 Definição"),
        p(`Concorrência é a capacidade de um sistema gerenciar múltiplas tarefas que avançam de forma intercalada, sem necessariamente executá-las ao mesmo instante. É como cozinhar: você coloca a água para ferver e vai cortando os legumes enquanto espera — as tarefas se alternam, mas parecem simultâneas.`),
        p(`O que define a concorrência não é a execução em si, mas a estrutura do programa: como ele é organizado para lidar com várias atividades ao mesmo tempo.`),
        refCod("client.py", "threads = [threading.Thread(target=send_to_server, ...)]  — estrutura concorrente: múltiplas tarefas de comunicação organizadas para progredir juntas."),

        h2("1.2 Concorrência vs. Paralelismo"),
        p(`Concorrência é sobre estrutura — como o programa lida com múltiplas tarefas. Paralelismo é sobre execução — quando essas tarefas acontecem ao mesmo tempo em processadores diferentes. Um programa pode ser concorrente sem ser paralelo (uma thread alternando tarefas num único núcleo) e paralelo sem ser concorrente (múltiplos núcleos processando um único vetor).`),
        refCod("client.py", "for t in threads: t.start()  /  for t in threads: t.join()  — disparo simultâneo (paralelismo) + espera coordenada (concorrência)."),

        h2("1.3 Exemplos e quando usar"),
        li(`Navegador carregando várias abas ao mesmo tempo.`),
        li(`Sistema operacional alternando entre processos num único processador.`),
        li(`Servidor web atendendo múltiplas requisições simultaneamente.`),
        p(`A concorrência brilha em tarefas I/O-bound, onde boa parte do tempo é gasta esperando rede ou disco. Quando o gargalo é processamento puro, o paralelismo real faz mais diferença.`),
        refCod("client.py → send_to_server()", "Cada thread bloqueia em sock.recv() aguardando o servidor — comportamento I/O-bound típico; GIL liberado durante a espera de rede."),

        // ── 2. PARALELISMO ───────────────────────────────────────
        h1("2. Paralelismo"),

        h2("2.1 Definição e tipos"),
        p(`Paralelismo é a execução simultânea e real de múltiplas tarefas em hardware dedicado — múltiplos núcleos ou máquinas. Não dá para simular: precisa de recursos físicos. No projeto, enquanto o servidor 1 calcula sua parte da matriz, o servidor 2 já está calculando a dele, ao mesmo instante.`),
        p(`Existem dois tipos principais: paralelismo de dados (mesma operação aplicada a partes diferentes dos dados — é o que fazemos com a matriz A) e paralelismo de tarefas (operações diferentes executadas ao mesmo tempo, como em um pipeline).`),
        refCod("client.py → multiply_distributed()", "Paralelismo de dados: np.array_split(A, len(servers)) divide A em blocos de linhas; cada servidor processa seu bloco com np.dot(sub_A, B) simultaneamente."),

        h2("2.2 Speedup e Lei de Amdahl"),
        p(`O speedup mede o ganho ao paralelizar:`),
        formula("S(n) = T_serial / T_paralelo"),
        p(`A Lei de Amdahl estabelece o limite teórico considerando que uma fração Fs do programa é obrigatoriamente sequencial:`),
        formula("S(n) = 1 / (Fs + Fp/n)"),
        p(`Se 20% do código for sempre sequencial, o speedup nunca vai passar de 5x — não importa quantas máquinas você adicione. No projeto, serialização, envio pela rede e remontagem do resultado formam essa fração sequencial.`),
        refCod("client.py → run_test()", "speedup = serial_time / dist_time  — medido diretamente com time.time() antes e depois de multiply_distributed(). A fração sequencial (pickle + TCP + vstack) é visível quando speedup < 1."),

        h2("2.3 Eficiência"),
        p(`A eficiência mede o aproveitamento de cada processador:`),
        formula("E = S(n) / n"),
        p(`100% seria perfeito. Na prática, comunicação e overhead reduzem esse valor. Para matrizes pequenas, o tempo de rede domina o cálculo e a eficiência tende a ser baixa. Para matrizes grandes, o equilíbrio muda e o paralelismo começa a compensar de verdade.`),
        refCod("client.py → run_test()", "efficiency = speedup / n_servers  — exibida no terminal como percentual (formato {efficiency:.2%}). Para 5000×5000 com 2 servidores: 53,73%."),

        // ── 3. FOSTER (PCAM) ─────────────────────────────────────
        h1("3. Metodologia de Foster (PCAM)"),

        p(`Ian Foster propôs quatro etapas para transformar um problema sequencial em paralelo: Particionamento, Comunicação, Aglomeração e Mapeamento. A seguir, cada etapa com sua aplicação direta no projeto.`),

        h2("3.1 Particionamento (P)"),
        p(`Identificar o que pode ser dividido, ignorando por ora o hardware disponível. No projeto: as linhas da matriz A. Cada linha de A contribui para uma linha de C de forma independente, o que permite dividir A em quantas fatias quisermos. Implementado por np.array_split(A, len(SERVERS)) no client.py.`),
        refCod("client.py → multiply_distributed()", "sub_matrices = np.array_split(A, len(servers))  — divide A em blocos de linhas iguais; para 1000×1000 com 2 servidores: dois blocos de 500×1000."),

        h2("3.2 Comunicação (C)"),
        p(`Definir quais dados precisam ir de onde para onde. Cada servidor recebe sua fatia de A (sub_A) e a matriz B completa — necessária porque cada linha de C depende de todas as colunas de B. Após o cálculo, o servidor devolve sua fatia do resultado via socket TCP com serialização pickle.`),
        refCod("client.py → send_message()", `payload = pickle.dumps({"sub_A": sub_A, "B": B})  — serializa o dicionário com sub_A e B inteira.`),
        refCod("server.py → send_message()", "conn.sendall(size + payload)  — servidor devolve apenas sub_resultado (sem B), reduzindo o tráfego de retorno."),

        h2("3.3 Aglomeração (A)"),
        p(`Agrupar tarefas pequenas em unidades maiores para reduzir o overhead de comunicação. Em vez de enviar linha por linha, enviamos todo o bloco sub_A de uma vez. Uma conexão por servidor, um envio, uma resposta — o custo de rede é amortizado pelo volume de cálculo.`),
        refCod("config.py", "BUFFER_SIZE = 8192  — tamanho de cada chunk TCP na recepção. Uma única mensagem por servidor por rodada: sem múltiplas conexões ou fragmentação lógica."),

        h2("3.4 Mapeamento (M)"),
        p(`Atribuir as tarefas ao hardware real. O cliente cria uma thread por servidor (threading.Thread), cada uma conectando ao host e porta definidos no config.py. O np.array_split garante distribuição equilibrada das linhas. Para usar máquinas reais bastaria trocar o localhost pelos IPs no config.py.`),
        refCod("config.py", "ALL_SERVERS = [(HOST, 5001), ..., (HOST, 5004)]  — mapeamento explícito de tarefa para worker. Substituir 'localhost' por IPs reais escala para máquinas físicas distintas."),

        // ── 4. COMPUTAÇÃO DISTRIBUÍDA ────────────────────────────
        h1("4. Computação Distribuída"),

        h2("4.1 Conceitos e características"),
        p(`Computação distribuída é um modelo onde múltiplas máquinas independentes cooperam pela rede para resolver um problema. Diferente de sistemas multicore, não há memória compartilhada — cada nó tem sua memória local e se comunica exclusivamente por troca de mensagens.`),
        li(`Autonomia dos nós: cada máquina opera independentemente e pode falhar sem derrubar o sistema.`),
        li(`Sem relógio global: a sincronização é feita pelas próprias mensagens.`),
        li(`Escalabilidade horizontal: mais capacidade significa adicionar máquinas, não trocar hardware.`),

        h2("4.2 Vantagens e desvantagens"),
        p(`As principais vantagens são escalabilidade e tolerância a falhas. O ponto fraco é o custo de comunicação: acessar dados pela rede é muito mais lento que acessar a memória local. Para tarefas pequenas, esse overhead domina e a versão distribuída pode ser mais lenta que a sequencial — o que veremos claramente nos testes com matrizes 10×10.`),

        h2("4.3 Modelos de comunicação"),
        p(`Memória compartilhada: processos leem e escrevem na mesma RAM. Funciona em sistemas multicore, mas não escala para múltiplas máquinas. Troca de mensagens: cada processo tem memória privada e se comunica explicitamente pela rede. É o modelo deste projeto, que permite escalar para qualquer número de máquinas físicas.`),

        h2("4.4 Sockets TCP no projeto"),
        p(`O protocolo usa um prefixo de 8 bytes com o tamanho da mensagem antes do payload real — necessário porque sockets TCP não têm noção de fim de mensagem. O cliente serializa os dados com pickle, envia o tamanho e depois os bytes. O servidor lê o tamanho, aguarda todos os bytes em loop e desserializa. Na volta, repete o processo. Pickle foi escolhido por lidar nativamente com arrays NumPy sem conversão manual.`),
        refCod("client.py + server.py → send_message()", "size = struct.pack('>Q', len(payload))  — prefixo big-endian de 8 bytes (uint64). conn.sendall(size + payload)  — garante envio completo mesmo para payloads grandes."),
        refCod("client.py + server.py → receive_message()", "chunks = []  /  chunks.append(chunk)  /  b''.join(chunks)  — recepção O(n). (Versão anterior usava data += chunk, padrão O(n²) que travou o sistema.)"),

        // ── 5. MULTIPLICAÇÃO DE MATRIZES ─────────────────────────
        h1("5. Multiplicação de Matrizes"),

        h2("5.1 Definição matemática"),
        p(`Dadas as matrizes A (m×k) e B (k×n), o produto C = A×B é uma matriz (m×n) onde:`),
        formula("C[i][j] = Soma(k=0 ate K-1) de A[i][k] x B[k][j]"),
        p(`O número de colunas de A deve ser igual ao de linhas de B. No projeto trabalhamos sempre com matrizes quadradas n×n.`),

        h2("5.2 Complexidade e cálculo sequencial"),
        p(`O algoritmo clássico usa três laços aninhados, com complexidade O(n³). Para n=1000, são cerca de 1 bilhão de operações. Para n=5000, são 125 bilhões — daí a motivação para distribuir o cálculo. No projeto, a referência serial usa numpy.dot(A, B), que internamente chama bibliotecas BLAS otimizadas, tornando o tempo serial já muito competitivo.`),
        refCod("client.py → multiply_serial()", "return np.dot(A, B)  — baseline serial. Forçamos OPENBLAS_NUM_THREADS=1 para garantir uso de 1 núcleo e comparação justa com N servidores em paralelo."),

        h2("5.3 Paralelização por particionamento de linhas"),
        p(`A matriz A é dividida em P blocos horizontais, um por servidor. Cada servidor recebe seu bloco e a matriz B inteira, e calcula de forma completamente independente — a linha i de C depende só da linha i de A e de toda a matriz B, sem depender de nenhuma outra linha de C. Isso elimina qualquer necessidade de comunicação entre servidores durante o cálculo.`),
        li(`Divisão: np.array_split(A, n_servidores) distribui as linhas igualmente.`),
        li(`Cálculo distribuído: sub_resultado = numpy.dot(sub_A, B) em cada servidor.`),
        li(`Remontagem: np.vstack(results) empilha os blocos na ordem correta.`),
        refCod("server.py → handle_request()", "result = np.dot(sub_A, B)  — cada servidor executa esta linha de forma independente; nenhum servidor conhece ou espera pelos outros."),
        refCod("client.py → multiply_distributed()", "return np.vstack(results)  — reconstrói C empilhando os blocos na ordem original do array results[], que preserva o índice de cada thread."),

        // ── 6. PROJETO IMPLEMENTADO ──────────────────────────────
        h1("6. Descrição do Projeto Implementado"),

        h2("6.1 Arquitetura"),
        p(`Três arquivos com responsabilidades bem separadas: config.py centraliza as configurações; server.py implementa o worker (recebe, calcula, devolve); client.py é o coordenador (divide, distribui, coleta, exibe métricas).`),

        h2("6.2 config.py"),
        li(`ALL_SERVERS: 4 servidores em localhost, portas 5001 a 5004.`),
        li(`SERVER_CONFIGS = [2, 4]: o cliente testa automaticamente com 2 e 4 servidores.`),
        li(`TEST_SIZES = [10, 50, 100, 500, 1000, 5000]: tamanhos usados nos casos de teste.`),
        li(`MAX_DISPLAY_SIZE = 10: matrizes até 10×10 são impressas no terminal.`),
        li(`MAX_FILE_SIZE = 100: matrizes até 100×100 são salvas em arquivos .txt na pasta output/.`),

        h2("6.3 server.py"),
        p(`Processo independente iniciado com python server.py <porta>. Fica em loop aguardando conexões. Ao receber uma: lê o tamanho, lê o payload, desserializa, calcula numpy.dot(sub_A, B), serializa e devolve o resultado. Não tem lógica de coordenação — não sabe quantos outros servidores existem.`),

        h2("6.4 client.py"),
        p(`Para cada tamanho em TEST_SIZES, o ciclo é:`),
        li(`Gera A e B com numpy.random.randint. As mesmas matrizes são usadas em todos os testes do mesmo tamanho.`),
        li(`Cronometra numpy.dot(A, B) como referência serial.`),
        li(`Para tamanhos até 100×100, salva A, B e resultado em arquivos .txt na pasta output/.`),
        li(`Distribuído (2 serv.): 2 threads simultâneas, uma por servidor, cada uma envia sub_A e B e recebe o resultado parcial. Remonta com np.vstack.`),
        li(`Distribuído (4 serv.): mesmo processo com 4 threads e 4 servidores.`),
        li(`Calcula e exibe speedup e eficiência para cada configuração.`),

        h2("6.5 Protocolo de comunicação"),
        li(`Serialização: pickle.dumps() transforma o array em bytes.`),
        li(`Prefixo: struct.pack('>Q', len(payload)) envia 8 bytes com o tamanho total.`),
        li(`Recepção em loop: lê chunks de até 8192 bytes até completar a mensagem.`),
        li(`Desserialização: pickle.loads() reconstrói o array original.`),

        // ── 7. CASOS DE TESTE ────────────────────────────────────
        h1("7. Casos de Teste"),

        p(`Os 12 casos abaixo combinam 6 tamanhos de matriz com 2 configurações de servidores. Cada caso foi executado 5 vezes e os valores reportados são a média aritmética das 5 rodadas, obtida com o script run_avg.py. Os 4 servidores permanecem ativos durante todas as rodadas, e as mesmas matrizes A e B geradas no início de cada rodada são reaproveitadas nos testes com 2 e 4 servidores para garantir comparação justa.`),
        esp(),
        tabelaCasos,
        esp(),

        h2("7.1 Arquivos gerados automaticamente"),
        p(`Para os três menores tamanhos, o client.py salva as matrizes de entrada e o resultado em arquivos .txt na pasta output/, permitindo verificação manual da corretude.`),
        esp(),
        tabelaArquivos,
        esp(),

        h2("7.2 Como executar"),
        p(`Abra 5 terminais. Os quatro primeiros iniciam os servidores; o quinto roda o cliente depois que todos estiverem ativos:`),
        li(`Terminal 1:  python server.py 5001`),
        li(`Terminal 2:  python server.py 5002`),
        li(`Terminal 3:  python server.py 5003`),
        li(`Terminal 4:  python server.py 5004`),
        li(`Terminal 5 (após os 4 servidores estarem rodando):  python client.py`),

        // ── 8. ANÁLISE E CONCLUSÃO ───────────────────────────────
        h1("8. Análise e Conclusão"),

        h2("8.1 Gráficos dos Resultados"),

        p(`Os três gráficos abaixo foram gerados a partir dos dados de resultados.json (médias de 5 execuções com numpy single-thread).`),

        h2("Speedup por Tamanho de Matriz"),
        grafico(imgSpeedup, "Gráfico de Speedup — 2 vs 4 servidores por tamanho de matriz"),
        p(`Para matrizes pequenas (≤ 100×100), o speedup é inferior a 0,1x porque o overhead fixo de TCP — estabelecer conexão, serializar os dados com pickle e transmitir pela rede — dura cerca de 3 a 10 ms, enquanto o próprio cálculo leva menos de 0,1 ms no serial. O custo de comunicação domina completamente o tempo total.`),
        p(`A tendência crescente ao longo dos tamanhos reflete a assimetria entre os custos: a comunicação cresce proporcionalmente ao volume de dados, que é O(n²), enquanto o cálculo cresce em O(n³). A partir de n suficientemente grande, o ganho computacional supera o overhead de rede — o que se observa empiricamente a partir de 5000×5000.`),
        p(`Somente em 5000×5000 o speedup ultrapassa 1,0 — 1,07x com 2 servidores e 1,08x com 4. O fato de 4 servidores não superar 2 de forma expressiva é uma manifestação direta da Lei de Amdahl: a fração sequencial não-paralelizável (envio da matriz B inteira para cada servidor individualmente) limita o speedup máximo independentemente do número de workers adicionados.`),

        h2("Eficiência por Tamanho de Matriz"),
        grafico(imgEficiencia, "Gráfico de Eficiência — 2 vs 4 servidores por tamanho de matriz"),
        p(`A eficiência E = S(n)/n mede o aproveitamento real de cada servidor: 100% significaria que cada servidor contribuiu exatamente como um núcleo adicional ideal sem nenhuma perda. Em 5000×5000, 2 servidores atingem E = 1,07/2 = 53,73% — cada servidor operou com pouco mais da metade da capacidade ideal, sendo o restante consumido por overhead de comunicação e serialização.`),
        p(`Os 4 servidores são sistematicamente menos eficientes que os 2 para todos os tamanhos testados. A razão é estrutural: a matriz B completa (200 MB em 5000×5000) precisa ser enviada integralmente para cada servidor. Com 4 servidores, o volume de dados transmitidos para B é o dobro em relação a 2 servidores, mas o ganho computacional adicional é pequeno — cada servidor já recebe apenas 25% de A. O custo extra de transferência de rede não é compensado pela redução do trabalho de cálculo por servidor.`),

        h2("Tempo de Execução (escala logarítmica)"),
        grafico(imgTempo, "Gráfico de Tempo de Execução — Serial vs Distribuído"),
        p(`A escala logarítmica é necessária porque os tempos variam mais de 4 ordens de grandeza: de 0,0001 s para 100×100 serial até 5,3 s para 5000×5000 serial. Em escala linear, as curvas das matrizes pequenas seriam visualmente imperceptíveis e seria impossível comparar os comportamentos nos dois extremos.`),
        p(`Para tamanhos pequenos, as curvas distribuídas estão 2 a 3 ordens de grandeza acima da serial. O gargalo é o overhead fixo de TCP: estabelecer conexão, realizar o handshake e executar a serialização/desserialização com pickle custam entre 3 e 10 ms independentemente do tamanho da matriz — custo insignificante para matrizes grandes, mas determinante para as pequenas.`),
        p(`Em 5000×5000, as três curvas convergem e as linhas de 2 e 4 servidores ficam levemente abaixo da serial, confirmando que o benefício computacional do paralelismo finalmente supera o overhead de comunicação. A proximidade entre as duas curvas distribuídas (4,92 s vs 4,98 s, diferença de apenas 1,4%) confirma que o gargalo real nesse tamanho é a transferência da matriz B pela rede, e não o cálculo em si — adicionar mais servidores quase não muda o tempo porque o tempo gasto enviando B já domina.`),
        esp(),

        h2("8.2 Perguntas para guiar a análise"),
        pMix([nb(`1. Em quais tamanhos o paralelismo compensou? `), n(`A partir de qual tamanho o speedup passou de 1? O que explica os resultados abaixo de 1 nos tamanhos menores?`)]),
        esp(),
        pMix([nb(`2. O aumento de 2 para 4 servidores melhorou proporcionalmente? `), n(`Se o speedup não dobrou, o que o limitou? Qual é a fração sequencial do processo pela Lei de Amdahl?`)]),
        esp(),
        pMix([nb(`3. Como variou a eficiência? `), n(`Em quais casos cada servidor foi melhor aproveitado? O que acontece com a eficiência ao passar de 2 para 4 servidores?`)]),
        esp(),
        pMix([nb(`4. O que melhoraria o sistema? `), n(`Compressão dos dados, reutilização de conexões, servidores com múltiplos núcleos — essas mudanças fariam diferença para matrizes pequenas ou só para grandes?`)]),

        h2("8.2 Análise"),
        p(`Durante o desenvolvimento foram identificados e corrigidos dois problemas que afetavam a validade dos resultados. O primeiro foi um bug de performance O(n²) na função receive_message: o padrão data += chunk criava uma cópia do buffer a cada chunk recebido, consumindo gigabytes de memória para matrizes grandes e travando o teste 5000×5000 por mais de uma hora. A correção foi usar uma lista de chunks e b"".join(chunks) ao final, reduzindo para O(n). O segundo problema era o baseline serial: o numpy.dot usa OpenBLAS com múltiplos threads automaticamente, tornando o "serial" já paralelo e injusto como referência. A solução foi forçar OPENBLAS_NUM_THREADS=1 em client.py e server.py, garantindo que serial use 1 núcleo e cada servidor também use 1 núcleo.`),
        p(`Com a comparação justa, os resultados mostram a tendência esperada pela teoria. Para matrizes pequenas (até 100×100), o overhead de comunicação domina completamente: o tempo serial é inferior a 0,0001s enquanto o overhead de TCP e serialização pickle é de ~0,004s, resultando em speedup abaixo de 0,05x. Conforme n cresce, a computação — que é O(n³) — passa a dominar sobre a comunicação — que é O(n²). Para 1000×1000, o speedup com 2 servidores chegou a 0,53x. Para 5000×5000, o limiar foi ultrapassado: serial 5,30s vs 4,92s com 2 servidores e 4,98s com 4 servidores — ambos com speedup acima de 1 (1,07x e 1,08x). É o primeiro tamanho onde distribuir o cálculo é genuinamente mais rápido que executá-lo em um único núcleo.`),
        p(`Um resultado particularmente interessante foi o empate entre 2 e 4 servidores no caso 5000×5000 (4,92s vs 4,98s, diferença inferior a 1,4%). Para tamanhos menores, 4 servidores foi consistentemente mais lento, pois a matriz B — 200 MB para 5000×5000 — é enviada integralmente para cada servidor, dobrando o volume de comunicação. No 5000×5000, os dois efeitos se equilibraram: a economia de cálculo por adicionar mais servidores compensou exatamente o custo de enviar mais cópias de B. Esse equilíbrio exemplifica a Lei de Amdahl: a fração sequencial do processo (envio de B) tende a um patamar fixo que impede ganhos adicionais significativos nesse design.`),

        h2("8.3 Conclusão"),
        p(`Os resultados confirmaram a teoria de computação paralela e distribuída na prática. O speedup progrediu de 0,01x para matrizes 10×10 até 1,07x–1,08x para 5000×5000, seguindo diretamente a relação entre crescimento da computação O(n³) e da comunicação O(n²). O ponto de cruzamento ocorreu entre 1000×1000 (0,53x) e 5000×5000 (acima de 1), exatamente onde a intensidade computacional por byte transferido supera o overhead de comunicação.`),
        p(`Dois problemas encontrados durante o projeto enriqueceram o aprendizado. O bug O(n²) na recepção de dados mostrou como um erro simples de implementação pode tornar um sistema distribuído completamente inviável — o teste 5000×5000 ficou travado por mais de uma hora antes da correção. O problema do baseline multi-thread (OpenBLAS usando todos os núcleos automaticamente) revelou a importância de definir com precisão o que está sendo comparado: sem forçar OPENBLAS_NUM_THREADS=1, o "serial" já era paralelo e a comparação era injusta.`),
        p(`As melhorias mais impactantes para trabalhos futuros seriam: pré-distribuir a matriz B para os servidores uma única vez antes dos testes, eliminando o principal gargalo de comunicação; reutilizar conexões TCP entre rodadas; e para 4 servidores, adotar particionamento em bloco — dividindo tanto A por linhas quanto B por colunas — permitindo que cada servidor receba apenas 1/N de B, tornando o aumento de servidores genuinamente escalável.`),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("caderno_de_testes.docx", buffer);
  console.log("Documento gerado: caderno_de_testes.docx");
}).catch(err => { console.error("Erro:", err); process.exit(1); });
