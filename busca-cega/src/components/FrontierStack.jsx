export default function FrontierStack({ frontier }) {
    const items = [...frontier].reverse(); // topo primeiro
    return (
        <div className="card p-4">
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Fronteira · Pilha (LIFO)</h3>
                <span className="text-xs text-slate-500">{frontier.length} nó(s)</span>
            </div>
            <div className="flex flex-col gap-1.5 min-h-[60px]">
                {items.length === 0 && <p className="text-sm text-slate-400 italic">pilha vazia</p>}
                {items.map((n, i) => (
                    <div key={frontier.length - 1 - i}
                        className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-semibold border transition
              ${i === 0
                                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-200'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
                        <span>{n}</span>
                        {i === 0 && <span className="text-[10px] uppercase tracking-wide">topo · próximo pop</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}