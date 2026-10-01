import { edgesOf, getNode } from '../data/graphPresets';

const R = 24;

const edgeCoords = (a, b) => {
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    return {
        x1: a.x + Math.cos(ang) * R, y1: a.y + Math.sin(ang) * R,
        x2: b.x - Math.cos(ang) * (R + 6), y2: b.y - Math.sin(ang) * (R + 6),
    };
};

const NODE_STYLE = {
    idle: 'fill-slate-500 stroke-slate-400',
    frontier: 'fill-amber-500 stroke-amber-300',
    visited: 'fill-sky-500 stroke-sky-300',
    current: 'fill-indigo-600 stroke-indigo-300',
    cutoff: 'fill-rose-500 stroke-rose-300',
    goal: 'fill-emerald-600 stroke-emerald-300',
    solution: 'fill-emerald-500 stroke-emerald-200',
};

const LEGEND = [
    ['idle', 'Não visitado'], ['frontier', 'Na fronteira (pilha)'], ['visited', 'Visitado'],
    ['current', 'Em exploração'], ['cutoff', 'Corte (DLS)'], ['goal', 'Objetivo encontrado'],
    ['solution', 'Caminho solução'],
];

const MARKERS = { idle: '#94a3b8', tree: '#0ea5e9', active: '#6366f1', solution: '#10b981' };

export default function GraphCanvas({ graph, step, treeEdges, cutoff, solution, start, goal }) {
    const frontier = new Set(step.frontier);
    const visited = new Set(step.visited);
    const solEdges = new Set(solution.slice(1).map((n, i) => `${solution[i]}-${n}`));
    const activeKey = step.edge ? step.edge.join('-') : null;

    const statusOf = (id) => {
        if (solution.includes(id)) return 'solution';
        if (step.type === 'goal' && step.current === id) return 'goal';
        if (step.current === id) return 'current';
        if (cutoff.has(id)) return 'cutoff';
        if (frontier.has(id)) return 'frontier';
        if (visited.has(id)) return 'visited';
        return 'idle';
    };

    return (
        <div className="card p-3">
            <svg viewBox="0 0 900 550" className="w-full max-h-[560px]">
                <defs>
                    {Object.entries(MARKERS).map(([k, c]) => (
                        <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5"
                            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M0 0 L10 5 L0 10 z" fill={c} />
                        </marker>
                    ))}
                </defs>

                {edgesOf(graph).map(([a, b]) => {
                    const key = `${a}-${b}`;
                    const { x1, y1, x2, y2 } = edgeCoords(getNode(graph, a), getNode(graph, b));
                    let kind = 'idle', w = 2, cls = 'stroke-slate-300 dark:stroke-slate-600';
                    if (treeEdges.has(key)) { kind = 'tree'; w = 2.5; cls = 'stroke-sky-500'; }
                    if (key === activeKey) { kind = 'active'; w = 3.5; cls = 'stroke-indigo-500 edge-active'; }
                    if (solEdges.has(key)) { kind = 'solution'; w = 4.5; cls = 'stroke-emerald-500'; }
                    return (
                        <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w}
                            className={`${cls} transition-all duration-500`} markerEnd={`url(#arrow-${kind})`} />
                    );
                })}

                {graph.nodes.map((n) => {
                    const st = statusOf(n.id);
                    return (
                        <g key={n.id}>
                            {st === 'current' && (
                                <circle cx={n.x} cy={n.y} r={R + 7}
                                    className="fill-none stroke-indigo-400 animate-pulse" strokeWidth="2" />
                            )}
                            <circle cx={n.x} cy={n.y} r={R} strokeWidth="3"
                                className={`${NODE_STYLE[st]} transition-colors duration-500`} />
                            <text x={n.x} y={n.y + 5} textAnchor="middle"
                                className="fill-white font-bold text-[15px] select-none">{n.id}</text>
                            {(n.id === start || n.id === goal) && (
                                <text x={n.x} y={n.y + R + 16} textAnchor="middle"
                                    className="fill-slate-500 dark:fill-slate-400 text-[11px] font-medium">
                                    {n.id === start && n.id === goal ? 'início = objetivo' : n.id === start ? 'início' : 'objetivo'}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                {LEGEND.map(([k, label]) => (
                    <span key={k} className="flex items-center gap-1.5">
                        <svg width="12" height="12">
                            <circle cx="6" cy="6" r="5" className={NODE_STYLE[k]} strokeWidth="1.5" />
                        </svg>
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}