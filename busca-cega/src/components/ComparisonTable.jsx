const STATUS = { success: 'Solução encontrada', cutoff: 'Corte (sem solução até L)', failure: 'Falha' };

const STATIC_ROWS = [
    ['Estratégia', 'Expande sempre o nó mais profundo da fronteira', 'DFS com corte: não expande nós na profundidade L'],
    ['Estrutura da fronteira', 'Pilha (LIFO)', 'Pilha (LIFO)'],
    ['Completo?', 'Só em espaços finitos com controle de visitados/ciclos', 'Só se L ≥ profundidade da solução (d)'],
    ['Ótimo?', 'Não', 'Não'],
    ['Complexidade de tempo', 'O(bᵐ)', 'O(bᴸ)'],
    ['Complexidade de espaço', 'O(b·m)', 'O(b·L)'],
];

const Row = ({ r, accent }) => (
    <tr className={`border-t border-slate-200 dark:border-slate-700 ${accent ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : ''}`}>
        <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">{r[0]}</td>
        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r[1]}</td>
        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r[2]}</td>
    </tr>
);

export default function ComparisonTable({ runs, limit, graphName, start, goal }) {
    const d = runs.DFS.result, l = runs.DLS.result;
    const dyn = [
        ['Resultado', STATUS[d.status], STATUS[l.status]],
        ['Nós explorados', d.explored, l.explored],
        ['Memória (máx. nós na fronteira)', d.maxFrontier, l.maxFrontier],
        ['Profundidade atingida', d.maxDepth, l.maxDepth],
        ['Tempo de execução (ms)', d.timeMs.toFixed(3), l.timeMs.toFixed(3)],
        ['Tamanho da solução (nós)', d.path.length || '—', l.path.length || '—'],
        ['Custo da solução', d.cost === null ? '—' : +d.cost.toFixed(2), l.cost === null ? '—' : +l.cost.toFixed(2)],
    ];
    return (
        <div className="card p-4 overflow-x-auto">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Comparativo DFS vs DLS</h2>
            <p className="text-xs text-slate-500 mb-3">
                {graphName} · {start} → {goal} · L = {limit} (ajuste o limite na aba Visualização)
            </p>
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="text-xs uppercase text-slate-500 dark:text-slate-400">
                        <th className="py-2 px-3">Critério</th>
                        <th className="py-2 px-3">DFS</th>
                        <th className="py-2 px-3">DLS</th>
                    </tr>
                </thead>
                <tbody>
                    {STATIC_ROWS.map((r) => <Row key={r[0]} r={r} />)}
                    {dyn.map((r) => <Row key={r[0]} r={r} accent />)}
                </tbody>
            </table>
        </div>
    );
}