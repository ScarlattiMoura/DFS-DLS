import { pathCost } from '../data/graphPresets';

/**
 * DFS iterativo (busca em grafo, com conjunto de visitados).
 * Fronteira = pilha LIFO. Vizinhos são empilhados em ordem inversa para que
 * o primeiro da lista de adjacência seja o primeiro a ser expandido.
 * Após achar o objetivo, gera passos 'trace' que reconstroem o caminho.
 * Retorna { steps, result }.
 */
export function dfs(graph, start, goal) {
    const t0 = performance.now();
    const steps = [];
    const stack = [{ node: start, path: [start] }];
    const visited = new Set();
    let explored = 0, maxDepth = 0, maxFrontier = 1, found = null;

    const snap = (type, msg, extra = {}) =>
        steps.push({
            type, msg,
            frontier: stack.map((s) => s.node),
            visited: [...visited],
            explored, maxDepth,
            current: null, path: [], edge: null, solution: [],
            ...extra,
        });

    snap('init', `Pilha inicial: [${start}]`);

    while (stack.length) {
        const { node, path } = stack.pop();
        const edge = path.length > 1 ? [path[path.length - 2], node] : null;

        if (visited.has(node)) {
            snap('skip', `Nó ${node} já visitado — descartado`, { edge });
            continue;
        }

        visited.add(node);
        explored++;
        maxDepth = Math.max(maxDepth, path.length - 1);

        if (node === goal) {
            found = path;
            snap('goal', `Objetivo ${goal} encontrado!`, { current: node, path, edge });
            break;
        }

        const next = (graph.adj[node] || []).filter((n) => !visited.has(n));
        for (let i = next.length - 1; i >= 0; i--)
            stack.push({ node: next[i], path: [...path, next[i]] });
        maxFrontier = Math.max(maxFrontier, stack.length);

        snap('visit', `Visita ${node}; empilha [${next.join(', ') || '—'}]`, { current: node, path, edge });
    }

    const result = {
        algorithm: 'DFS',
        status: found ? 'success' : 'failure',
        path: found || [],
        explored, maxDepth, maxFrontier,
        cost: found ? pathCost(graph, found) : null,
        timeMs: performance.now() - t0,
    };

    if (found) {
        for (let i = 1; i < found.length; i++) {
            const prefix = found.slice(0, i + 1);
            snap('trace', `Reconstruindo caminho: ${prefix.join(' → ')}`, {
                current: found[i], path: prefix, solution: prefix,
            });
        }
    }
    snap(
        'done',
        found ? 'Busca concluída: solução encontrada' : 'Busca concluída: objetivo inalcançável',
        { solution: found || [], path: found || [] }
    );
    return { steps, result };
}