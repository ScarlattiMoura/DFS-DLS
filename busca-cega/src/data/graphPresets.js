const make = (id, name, nodes, adj, defaultStart, defaultGoal) => ({
    id, name, nodes, adj, defaultStart, defaultGoal,
});

export const getNode = (graph, id) => graph.nodes.find((n) => n.id === id);

export const edgesOf = (graph) =>
    Object.entries(graph.adj).flatMap(([a, list]) => list.map((b) => [Number(a), b]));

export const edgeCost = (graph, a, b) => {
    const A = getNode(graph, a)?.coord;
    const B = getNode(graph, b)?.coord;
    return A && B ? Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) : 1;
};

export const pathCost = (graph, path) =>
    path.slice(1).reduce((sum, n, i) => sum + edgeCost(graph, path[i], n), 0);

const small = make(
    'small',
    'Pequeno · Árvore (7 nós)',
    [
        { id: 1, x: 450, y: 70 },
        { id: 2, x: 250, y: 220 }, { id: 3, x: 650, y: 220 },
        { id: 4, x: 150, y: 380 }, { id: 5, x: 350, y: 380 },
        { id: 6, x: 550, y: 380 }, { id: 7, x: 750, y: 380 },
    ],
    { 1: [2, 3], 2: [4, 5], 3: [6, 7], 4: [], 5: [], 6: [], 7: [] },
    1,
    7
);

// Coordenadas 3D de EXEMPLO: troque pelas do dataset da aula.
const medium = make(
    'medium',
    'Médio · 3D (10 nós)',
    [
        { id: 1, x: 450, y: 50, coord: [0, 0, 0] },
        { id: 2, x: 250, y: 150, coord: [2, 1, 1] },
        { id: 3, x: 650, y: 150, coord: [3, 2, 0] },
        { id: 6, x: 150, y: 280, coord: [4, 1, 2] },
        { id: 4, x: 350, y: 280, coord: [3, 3, 1] },
        { id: 5, x: 550, y: 280, coord: [5, 2, 2] },
        { id: 7, x: 750, y: 280, coord: [6, 4, 1] },
        { id: 8, x: 450, y: 380, coord: [6, 5, 3] },
        { id: 9, x: 650, y: 380, coord: [7, 3, 3] },
        { id: 10, x: 550, y: 480, coord: [9, 6, 4] },
    ],
    { 1: [2, 3], 2: [4, 6], 3: [5, 7], 4: [8], 5: [9], 6: [4], 7: [8], 8: [10], 9: [10], 10: [] },
    1,
    10
);

const large = make(
    'large',
    'Grande · Múltiplos caminhos (16 nós)',
    [
        { id: 1, x: 450, y: 50 },
        { id: 2, x: 200, y: 140 }, { id: 3, x: 450, y: 140 }, { id: 4, x: 700, y: 140 },
        { id: 5, x: 100, y: 250 }, { id: 6, x: 300, y: 250 }, { id: 7, x: 500, y: 250 }, { id: 8, x: 700, y: 250 },
        { id: 9, x: 200, y: 360 }, { id: 10, x: 400, y: 360 }, { id: 11, x: 600, y: 360 }, { id: 12, x: 800, y: 360 },
        { id: 13, x: 300, y: 470 }, { id: 14, x: 500, y: 470 }, { id: 15, x: 700, y: 470 }, { id: 16, x: 840, y: 470 },
    ],
    {
        1: [2, 3, 4], 2: [5, 6], 3: [6, 7], 4: [7, 8],
        5: [9], 6: [9, 10], 7: [10, 11], 8: [11, 12],
        9: [13], 10: [13, 14], 11: [14, 15], 12: [15, 16],
        13: [], 14: [6], 15: [], 16: [],
    },
    1,
    16
);

export const PRESETS = { small, medium, large };