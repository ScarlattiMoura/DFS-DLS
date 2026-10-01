const STATUS = {
    success: ['Objetivo encontrado', 'text-emerald-600 dark:text-emerald-400'],
    cutoff: ['Corte (limite insuficiente)', 'text-rose-600 dark:text-rose-400'],
    failure: ['Falha (inalcançável)', 'text-rose-600 dark:text-rose-400'],
};

const Stat = ({ label, value }) => (
    <div className="rounded-lg bg-slate-100/80 dark:bg-slate-800/80 p-2.5">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
);

export default function MetricsPanel({ step, result, finished }) {
    const [label, color] = STATUS[result.status];
    const pathText = (p) => (p.length ? p.join(' → ') : '—');
    return (
        <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Resultados · {result.algorithm}
            </h3>
            <p className={`text-sm font-medium ${finished ? color : 'text-slate-500'}`}>
                {finished ? label : 'Em execução…'}
            </p>
            <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {finished ? 'Caminho encontrado' : 'Caminho atual'}
                </div>
                <div className="font-mono text-sm break-words text-slate-800 dark:text-slate-100">
                    {finished ? pathText(result.path) : pathText(step.path)}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Stat label="Nós explorados" value={step.explored} />
                <Stat label="Profundidade atingida" value={step.maxDepth} />
                {finished && <Stat label="Tempo (ms)" value={result.timeMs.toFixed(3)} />}
                {finished && <Stat label="Custo da solução" value={result.cost === null ? '—' : +result.cost.toFixed(2)} />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[2rem]">{step.msg}</p>
        </div>
    );
}