# Busca Cega em Grafos: DFS vs DLS

Aplicação web interativa (React + Vite + Tailwind CSS) para visualizar e comparar
a **Busca em Profundidade (DFS)** e a **Busca em Profundidade Limitada (DLS)**.

---

## Parte 1 – Teoria

### 1.1 O que são DFS e DLS?

**DFS (Depth-First Search)** é um algoritmo de busca cega (não informada). Ele
explora um ramo do grafo até o fim antes de voltar (*backtracking*) e tentar
outro ramo.

**DLS (Depth-Limited Search)** é a DFS com um **limite de profundidade L**.
Nós na profundidade L são testados, mas não expandidos. O limite evita
caminhos infinitos, mas introduz o risco de o objetivo estar além de L.

### 1.2 Qual problema resolvem?

Dado um grafo, um **estado inicial** e um **estado objetivo**, encontrar uma
sequência de nós (caminho) que leve do primeiro ao segundo. Ambos ignoram o
custo das arestas ao decidir o que explorar. Por isso são "cegos".

### 1.3 Entradas e saídas

| Entradas | Saídas |
|---|---|
| Grafo (nós e arestas), estado inicial, estado objetivo, limite L (só DLS) | Caminho encontrado, nº de nós explorados, profundidade atingida, estado da fronteira |

### 1.4 Funcionamento passo a passo

```
DFS(grafo, inicio, objetivo):
    fronteira ← pilha com [inicio]
    visitados ← {}
    enquanto fronteira não vazia:
        n ← pop(fronteira)                  # LIFO
        se n ∈ visitados: continue
        visitados ← visitados ∪ {n}
        se n = objetivo: retorna caminho(n)
        para cada vizinho v de n (ordem inversa):
            se v ∉ visitados: push(fronteira, v)
    retorna falha

DLS(grafo, inicio, objetivo, L):
    fronteira ← pilha com [(inicio, prof=0)]
    enquanto fronteira não vazia:
        (n, p) ← pop(fronteira)
        se n = objetivo: retorna caminho(n)
        se p = L: marca CORTE; continue     # não expande
        para cada vizinho v de n não presente no caminho atual:
            push(fronteira, (v, p+1))
    retorna CORTE se houve corte, senão FALHA
```

### 1.5 Árvore de busca

Cada nó da árvore de busca representa um caminho a partir do estado inicial.
A raiz é o estado inicial e os filhos de um nó são seus vizinhos no grafo. Em
grafos com ciclos ou múltiplos caminhos, o mesmo estado pode aparecer várias
vezes na árvore:

- **DFS** usa um conjunto de visitados (busca em grafo) e nunca reexpande um estado.
- **DLS** evita apenas ciclos ao longo do caminho atual (busca em árvore) e o limite L garante a terminação.

### 1.6 Fronteira: pilha (LIFO)

A fronteira guarda os nós descobertos e ainda não expandidos. Como é uma
**pilha**, o último nó inserido é o primeiro a sair. Por isso a busca
"mergulha" nos descendentes mais recentes antes de voltar aos irmãos
antigos. Na interface, o **topo** da pilha é destacado e é o próximo nó
a ser removido (*pop*).

### 1.7 Estratégia de escolha do próximo nó

Sempre o **nó mais profundo** da fronteira, isto é, o último a ser empilhado.
Os vizinhos são empilhados em ordem inversa para que o **primeiro** da lista
de adjacência seja explorado primeiro.

---

## Parte 2 – Exemplo Visual

Grafo médio (arestas direcionadas), de **1** até **10**:

```
            1
          /   \
         2     3
        / \   / \
       6→ 4  5   7
          |  |   |
          8  9   8
          └─10──┘
```

(adjacência: 1:[2,3] 2:[4,6] 3:[5,7] 4:[8] 5:[9] 6:[4] 7:[8] 8:[10] 9:[10])

### DFS (1 → 10)

| Passo | Pop | Ação | Pilha (topo à direita) |
|---|---|---|---|
| 0 | n/d | Início | [1] |
| 1 | 1 | Visita; empilha 3, 2 | [3, 2] |
| 2 | 2 | Visita; empilha 6, 4 | [3, 6, 4] |
| 3 | 4 | Visita; empilha 8 | [3, 6, 8] |
| 4 | 8 | Visita; empilha 10 | [3, 6, 10] |
| 5 | 10 | **Objetivo!** | [3, 6] |

**Caminho:** 1 → 2 → 4 → 8 → 10 · **Nós explorados:** 5 · **Profundidade:** 4 · **Máx. na pilha:** 3

### DLS com L = 2 (1 → 10)

| Passo | Pop (prof.) | Ação | Pilha |
|---|---|---|---|
| 1 | 1 (0) | Expande | [3, 2] |
| 2 | 2 (1) | Expande | [3, 6, 4] |
| 3 | 4 (2) | **Corte** | [3, 6] |
| 4 | 6 (2) | **Corte** | [3] |
| 5 | 3 (1) | Expande | [7, 5] |
| 6 | 5 (2) | **Corte** | [7] |
| 7 | 7 (2) | **Corte** | [] |

**Resultado: CORTE.** O objetivo está na profundidade 4 (> L = 2), então o
DLS esgota a pilha sem encontrá-lo (7 nós explorados). Com **L = 4** ele
encontra o mesmo caminho do DFS.

### Cores na interface

| Cor | Significado |
|---|---|
| Cinza | Não visitado |
| Âmbar | Na fronteira (pilha) |
| Azul | Visitado |
| Índigo (pulsante) | Em exploração |
| Vermelho | Corte (DLS) |
| Verde | Objetivo encontrado / caminho solução |

### Reconstrução do caminho

Quando o objetivo é encontrado, a aplicação não pula direto para o resultado.
Ela gera passos adicionais (`trace`) que desenham o caminho solução **aresta
por aresta**, do nó inicial ao objetivo. Esses passos também funcionam com
Play, Próximo passo e Passo anterior. Eles não alteram o número de nós
explorados nem a profundidade, porque não exploram nada novo.

---

## Parte 3 – Guia de Implementação e Execução

### Estrutura

```
busca-cega/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.jsx      # SVG do grafo, animações e legenda
│   │   ├── ControlPanel.jsx     # play/pause/step/reset, sliders, selects
│   │   ├── FrontierStack.jsx    # visualizador da pilha
│   │   ├── MetricsPanel.jsx     # caminho, nós explorados, profundidade, tempo, custo
│   │   └── ComparisonTable.jsx  # tabela DFS vs DLS
│   ├── algorithms/
│   │   ├── dfs.js               # DFS iterativo + snapshots de cada passo
│   │   └── dls.js               # DLS iterativo + snapshots de cada passo
│   ├── data/graphPresets.js     # grafos Pequeno, Médio (3D) e Grande
│   ├── styles/index.css
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
└── README.md
```

A lógica dos algoritmos (`algorithms/`) é independente da interface. Cada
função retorna `{ steps, result }`: `steps` é a lista de *snapshots* (fronteira,
visitados, nó atual, caminho, contadores) e `result` traz o resumo final. A UI
apenas reproduz os `steps`, o que permite o botão "Passo anterior".

### Dependências

React 18+, Vite, Tailwind CSS 3.4, PostCSS e Autoprefixer. Requer Node.js 18 ou superior.

### Como executar

Clonando o repositório:

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO/busca-cega   # ajuste conforme a raiz do repositório
npm install
npm run dev
```

Abra o endereço exibido (normalmente `http://localhost:5173`).

Para build de produção: `npm run build` e `npm run preview`.

### Uso

1. Escolha o **grafo**, o **algoritmo**, o **nó inicial** e o **nó objetivo**.
2. No DLS, ajuste o **limite L** (0 a 10).
3. Use Play/Pause, Passo anterior/Próximo passo e o slider de velocidade (200–2000 ms).
4. Acompanhe a pilha, o caminho, o nº de nós explorados e a profundidade.
5. A aba **Comparativo** mostra a tabela DFS vs DLS para a configuração atual.

> **Nota:** as coordenadas 3D do grafo médio em `src/data/graphPresets.js`
> são de exemplo. Substitua-as pelas do dataset da aula para obter o custo
> euclidiano correto. Sem `coord`, o custo é 1 por aresta.

---

## Parte 4 – Comparação e Análise de Resultados

*b* = fator de ramificação, *m* = profundidade máxima da árvore, *L* = limite, *d* = profundidade da solução.

| Critério | DFS | DLS |
|---|---|---|
| **Estratégia** | Expande o nó mais profundo | DFS com corte na profundidade L |
| **Fronteira** | Pilha (LIFO) | Pilha (LIFO) |
| **Completa?** | Não em geral. Sim em espaços finitos com controle de visitados | Não. Só é completa se L ≥ d |
| **Ótima?** | Não (retorna o primeiro caminho encontrado) | Não |
| **Tempo** | O(bᵐ) | O(bᴸ) |
| **Espaço** | O(b·m) | O(b·L) |
| **Memória** | Linear na profundidade (muito baixa) | Linear em L (baixa e limitada) |
| **Custo** | Não considera custos de aresta | Não considera custos de aresta |
| **Limitações** | Pode se perder em ramos muito profundos ou infinitos e encontrar soluções longas | Exige escolher L: se L < d, falha por corte; se L ≫ d, desperdiça esforço |

### Análise

- **Caminho encontrado:** nenhum dos dois garante o caminho mais curto ou de menor custo. O resultado depende da ordem das arestas na lista de adjacência.
- **Nós explorados:** o DLS pode explorar menos nós que o DFS quando o objetivo é raso, ou terminar em corte sem solução quando L é pequeno (ver exemplo da Parte 2).
- **Memória:** medida na aplicação como o máximo de nós simultâneos na fronteira. Ambos usam pouca memória em comparação com a BFS, que guarda toda a fronteira em largura.
- **Tempo de execução:** medido com `performance.now()` apenas na geração da busca. Os valores são muito pequenos e variam entre execuções, então use-os de forma relativa, não como benchmark rigoroso.
- **Quando usar:** DFS quando há pouca memória e as soluções são profundas. DLS quando existe uma estimativa da profundidade da solução ou o espaço de estados é infinito. Para soluções ótimas, considere BFS, UCS ou busca iterativa em profundidade (IDS).

## Referências

- Russell, S.; Norvig, P. *Artificial Intelligence: A Modern Approach*. Cap. 3 (Solving Problems by Searching).
