const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
        {children}
    </label>
);

const input =
    'rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100';
const btn =
    'rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition';

export default function ControlPanel({
    presets, presetId, onPreset, graph, algo, setAlgo, start, setStart, goal, setGoal,
    limit, setLimit, speed, setSpeed, playing, onTogglePlay, onPrev, onNext, onReset, canPrev, canNext,
}) {
    const ids = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
    return (
        <div className="card p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="Grafo de teste">
                    <select className={input} value={presetId} onChange={(e) => onPreset(e.target.value)}>
                        {Object.values(presets).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </Field>
                <Field label="Algoritmo">
                    <select className={input} value={algo} onChange={(e) => setAlgo(e.target.value)}>
                        <option value="DFS">DFS</option>
                        <option value="DLS">DLS</option>
                    </select>
                </Field>
                <Field label="Nó inicial">
                    <select className={input} value={start} onChange={(e) => setStart(Number(e.target.value))}>
                        {ids.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                </Field>
                <Field label="Nó objetivo">
                    <select className={input} value={goal} onChange={(e) => setGoal(Number(e.target.value))}>
                        {ids.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                </Field>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Field label={`Limite de profundidade L (DLS): ${limit}`}>
                    <input type="range" min="0" max="10" value={limit} disabled={algo !== 'DLS'}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="accent-emerald-500 disabled:opacity-40" />
                </Field>
                <Field label={`Intervalo da animação: ${speed} ms (menor = mais rápido)`}>
                    <input type="range" min="200" max="2000" step="100" value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))} className="accent-indigo-500" />
                </Field>
            </div>

            <div className="flex flex-wrap gap-2">
                <button className={btn} onClick={onPrev} disabled={!canPrev}>⏮ Passo anterior</button>
                <button
                    className={`${btn} !bg-indigo-600 !text-white !border-indigo-600 hover:!bg-indigo-500`}
                    onClick={onTogglePlay}>
                    {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className={btn} onClick={onNext} disabled={!canNext}>Próximo passo ⏭</button>
                <button className={btn} onClick={onReset}>↺ Reset</button>
            </div>
        </div>
    );
}