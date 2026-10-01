import { useEffect, useMemo, useState } from 'react';
import { PRESETS } from './data/graphPresets';
import { dfs } from './algorithms/dfs';
import { dls } from './algorithms/dls';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import FrontierStack from './components/FrontierStack';
import MetricsPanel from './components/MetricsPanel';
import ComparisonTable from './components/ComparisonTable';

export default function App() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState('viz');
  const [presetId, setPresetId] = useState('medium');
  const graph = PRESETS[presetId];
  const [algo, setAlgo] = useState('DFS');
  const [start, setStart] = useState(graph.defaultStart);
  const [goal, setGoal] = useState(graph.defaultGoal);
  const [limit, setLimit] = useState(2);
  const [speed, setSpeed] = useState(900);
  const [rawIdx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const changePreset = (id) => {
    setPresetId(id);
    setStart(PRESETS[id].defaultStart);
    setGoal(PRESETS[id].defaultGoal);
  };

  // Ambos são calculados sempre: a aba de comparação precisa dos dois.
  const runs = useMemo(
    () => ({ DFS: dfs(graph, start, goal), DLS: dls(graph, start, goal, limit) }),
    [graph, start, goal, limit]
  );
  const run = runs[algo];
  const last = run.steps.length - 1;
  const idx = Math.min(rawIdx, last); // nunca passa do último passo

  useEffect(() => { setIdx(0); setPlaying(false); }, [algo, graph, start, goal, limit]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx(idx + 1), speed);
    return () => clearTimeout(t);
  }, [playing, idx, speed, last]);

  const frame = useMemo(() => {
    const treeEdges = new Set(), cutoff = new Set();
    for (let i = 0; i <= idx; i++) {
      const s = run.steps[i];
      if (!s) continue;
      if (s.edge && ['visit', 'goal', 'cutoff'].includes(s.type)) treeEdges.add(s.edge.join('-'));
      if (s.type === 'cutoff') cutoff.add(s.current);
    }
    const step = run.steps[idx];
    return { step, treeEdges, cutoff, finished: idx === last, solution: step.solution || [] };
  }, [run, idx, last]);

  const togglePlay = () => {
    if (!playing && idx >= last) setIdx(0);
    setPlaying((p) => !p);
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 font-sans">
        <header className="max-w-7xl mx-auto px-6 pt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Busca Cega · DFS vs DLS</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Visualização interativa em grafos</p>
          </div>
          <div className="flex gap-2">
            {[['viz', 'Visualização'], ['cmp', 'Comparativo']].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === k
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}`}>
                {label}
              </button>
            ))}
            <button onClick={() => setDark((d) => !d)}
              className="rounded-lg px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">
              {dark ? '☀ Claro' : '☾ Escuro'}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          {tab === 'viz' ? (
            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              <div className="space-y-5">
                <ControlPanel
                  presets={PRESETS} presetId={presetId} onPreset={changePreset} graph={graph}
                  algo={algo} setAlgo={setAlgo} start={start} setStart={setStart} goal={goal} setGoal={setGoal}
                  limit={limit} setLimit={setLimit} speed={speed} setSpeed={setSpeed}
                  playing={playing} onTogglePlay={togglePlay}
                  onPrev={() => { setPlaying(false); setIdx(Math.max(0, idx - 1)); }}
                  onNext={() => { setPlaying(false); setIdx(Math.min(last, idx + 1)); }}
                  onReset={() => { setPlaying(false); setIdx(0); }}
                  canPrev={idx > 0} canNext={idx < last}
                />
                <GraphCanvas graph={graph} start={start} goal={goal} step={frame.step}
                  treeEdges={frame.treeEdges} cutoff={frame.cutoff} solution={frame.solution} />
              </div>
              <div className="space-y-5">
                <FrontierStack frontier={frame.step.frontier} />
                <MetricsPanel step={frame.step} result={run.result} finished={frame.finished} />
                <p className="text-xs text-slate-500 dark:text-slate-400 px-1">Passo {idx} de {last}</p>
              </div>
            </div>
          ) : (
            <ComparisonTable runs={runs} limit={limit} graphName={graph.name} start={start} goal={goal} />
          )}
        </main>
      </div>
    </div>
  );
}