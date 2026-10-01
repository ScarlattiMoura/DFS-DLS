import { pathCost } from '../data/graphPresets';

/**
 * DLS iterativo. Nós na profundidade L são testados, mas NÃO expandidos (cutoff).
 * Evita ciclos apenas ao longo do caminho atual (como na árvore de busca).
 * status: 'success' | 'cutoff' (existe corte, pode haver solução mais fundo) | 'failure'.
 * Após achar o objetivo, gera passos 'trace' que reconstroem o caminho.
 */
export function dls(graph, start, goal, limit) {
    const t0 = performance.now();
    const steps = [];
    const stack = [{ node: start, path: [start] }];
    const visited = new Set(); // só para colorir a UI
    let explored = 0, maxDepth = 0, maxFrontier = 1, found = null, cutoffHit = false;

    const snap = (type, msg, extra = {}) =>
        steps.push({
            type, msg,
            frontier: stack.map((s) => s.node),
            visited: [...visited],
            explored, maxDepth,
            current: null, path: [], edge: null, solution: [],
            ...extra,
        });

    snap('init', `Pilha inicial: [${start}] · L = ${limit}`);

    while (stack.length) {
        const { node, path } = stack.pop();
        const depth = path.length - 1;
        const edge = depth > 0 ? [path[depth - 1], node] : null;

        visited.add(node);
        explored++;
        maxDepth = Math.max(maxDepth, depth);

        if (node === goal) {
            found = path;
            snap('goal', `Objetivo ${goal} encontrado na profundidade ${depth}!`, { current: node, path, edge });
            break;
        }

        if (depth >= limit) {
            cutoffHit = true;
            snap('cutoff', `Nó ${node} (prof. ${depth} = L): corte, não expande`, { current: node, path, edge });
            continue;
        }

        const next = (graph.adj[node] || []).filter((n) => !path.includes(n));
        for (let i = next.length - 1; i >= 0; i--)
            stack.push({ node: next[i], path: [...path, next[i]] });
        maxFrontier = Math.max(maxFrontier, stack.length);

        snap('visit', `Visita ${node} (prof. ${depth}); empilha [${next.join(', ') || '—'}]`, { current: node, path, edge });
    }

    const status = found ? 'success' : cutoffHit ? 'cutoff' : 'failure';
    const result = {
        algorithm: 'DLS', status,
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
    const doneMsg = {
        success: 'Busca concluída: solução encontrada',
        cutoff: `Busca concluída: CORTE — o limite L = ${limit} não alcançou o objetivo`,
        failure: 'Busca concluída: falha',
    }[status];
    snap('done', doneMsg, { solution: found || [], path: found || [] });
    return { steps, result };
}