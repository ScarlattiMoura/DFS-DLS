import React, { useState, useEffect, useMemo } from 'react';

// Coordenadas ajustadas para um layout horizontal inspirado na imagem do slide
const NODES = [
  { id: 1, x: 150, y: 300 },
  { id: 2, x: 320, y: 180 },
  { id: 3, x: 320, y: 420 },
  { id: 6, x: 500, y: 80 },
  { id: 4, x: 500, y: 220 },
  { id: 5, x: 500, y: 380 },
  { id: 7, x: 500, y: 520 },
  { id: 8, x: 680, y: 250 },
  { id: 9, x: 680, y: 420 },
  { id: 10, x: 820, y: 335 },
];

const ADJ = {
  1: [2, 3],
  2: [4, 6],
  3: [5, 7],
  4: [8],
  5: [9],
  6: [4],
  7: [8],
  8: [10],
  9: [10],
  10: []
};

const EDGES = [
  [1, 2], [1, 3], [2, 4], [2, 6], [3, 5], [3, 7], 
  [4, 8], [5, 9], [6, 4], [7, 8], [8, 10], [9, 10]
];

const generateDFSSteps = () => {
  const steps = [];
  const visited = new Set();
  const path = [];

  const dfs = (node, fromNode) => {
    if (visited.has(node)) return;
    
    if (fromNode) steps.push({ type: 'traverse', edge: [fromNode, node] });
    
    visited.add(node);
    path.push(node);
    steps.push({ type: 'visit', node, path: [...path] });

    for (const neighbor of ADJ[node]) {
      dfs(neighbor, node);
    }
    
    steps.push({ type: 'complete', node });
    path.pop(); // Atualiza o caminho ao recuar (backtrack)
    if (path.length > 0) {
      steps.push({ type: 'backtrack', node: path[path.length - 1], path: [...path] });
    }
  };

  dfs(1, null);
  steps.push({ type: 'done' });
  return steps;
};

const generateDLSSteps = (limit = 2) => {
  const steps = [];
  const visited = new Set();
  const path = [];

  const dls = (node, depth, fromNode) => {
    if (depth > limit) return;
    if (visited.has(node)) return;

    if (fromNode) steps.push({ type: 'traverse', edge: [fromNode, node] });

    visited.add(node);
    path.push(node);
    steps.push({ type: 'visit', node, path: [...path], depth });

    for (const neighbor of ADJ[node]) {
      dls(neighbor, depth + 1, node);
    }

    steps.push({ type: 'complete', node });
    path.pop();
    if (path.length > 0) {
      steps.push({ type: 'backtrack', node: path[path.length - 1], path: [...path] });
    }
  };

  dls(1, 0, null);
  steps.push({ type: 'done' });
  return steps;
};

export default function GraphVisualizer() {
  const [activeAlgo, setActiveAlgo] = useState('DFS');
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Lógica para saber exatamente qual o estado de cada nó/aresta no passo atual
  const frame = useMemo(() => {
    let vis = new Set();
    let curPath = [];
    let actNode = null;

    for (let i = 0; i <= stepIdx; i++) {
      const step = steps[i];
      if (!step) continue;
      
      if (step.type === 'visit') {
        vis.add(step.node);
        curPath = step.path;
        actNode = step.node;
      } else if (step.type === 'backtrack') {
        curPath = step.path;
        actNode = step.node;
      } else if (step.type === 'done') {
        setIsPlaying(false);
        actNode = null;
      }
    }
    return { vis, curPath, actNode };
  }, [steps, stepIdx]);

  // Motor de animação
  useEffect(() => {
    let interval;
    if (isPlaying && stepIdx < steps.length - 1) {
      interval = setInterval(() => {
        setStepIdx(prev => prev + 1);
      }, 700); // Velocidade da animação (700ms)
    }
    return () => clearInterval(interval);
  }, [isPlaying, stepIdx, steps.length]);

  const handleStartDFS = () => {
    setSteps(generateDFSSteps());
    setStepIdx(-1);
    setActiveAlgo('DFS');
    setIsPlaying(true);
  };

  const handleStartDLS = () => {
    setSteps(generateDLSSteps(2));
    setStepIdx(-1);
    setActiveAlgo('DLS');
    setIsPlaying(true);
  };

  const handleReset = () => {
    setSteps([]);
    setStepIdx(-1);
    setIsPlaying(false);
  };

  // Verifica se uma aresta faz parte do caminho atualmente ativo
  const isEdgeInPath = (u, v) => {
    for (let i = 0; i < frame.curPath.length - 1; i++) {
      if ((frame.curPath[i] === u && frame.curPath[i+1] === v) || 
          (frame.curPath[i] === v && frame.curPath[i+1] === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0f18] text-white font-sans relative overflow-hidden">
      
      {/* Botões modernizados, mas discretos para não estragar o visual do slide */}
      <div className="absolute top-6 right-8 flex gap-4 z-50">
        <button 
          onClick={handleStartDFS}
          className={`px-5 py-2 rounded font-bold transition-all duration-300 shadow-lg ${activeAlgo === 'DFS' ? 'bg-[#38bdf8] text-[#0a0f18]' : 'border border-slate-600 text-slate-300 hover:bg-[#38bdf8]/20'}`}
        >
          Iniciar DFS
        </button>
        <button 
          onClick={handleStartDLS}
          className={`px-5 py-2 rounded font-bold transition-all duration-300 shadow-lg ${activeAlgo === 'DLS' ? 'bg-[#38bdf8] text-[#0a0f18]' : 'border border-slate-600 text-slate-300 hover:bg-[#38bdf8]/20'}`}
        >
          Iniciar DLS
        </button>
        <button 
          onClick={handleReset}
          className="px-5 py-2 rounded font-bold border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all duration-300"
        >
          Reset
        </button>
      </div>

      {/* Título */}
      <div className="pt-16 pl-20">
        <h1 className="text-4xl font-bold text-white mb-4">
          Como a {activeAlgo} percorre o grafo?
        </h1>
        <div className="w-24 h-1 bg-[#38bdf8]"></div>
      </div>

      {/* Área do Grafo SVG */}
      <div className="flex-1 flex flex-col items-center justify-center relative -mt-6">
        <svg viewBox="0 0 1000 550" className="w-full max-w-5xl h-[450px]">
          
          {/* Arestas */}
          {EDGES.map(([u, v]) => {
            const n1 = NODES.find(n => n.id === u);
            const n2 = NODES.find(n => n.id === v);
            const inPath = isEdgeInPath(u, v);

            return (
              <line 
                key={`${u}-${v}`}
                x1={n1.x} y1={n1.y} 
                x2={n2.x} y2={n2.y}
                stroke={inPath ? "#38bdf8" : "#1e293b"} 
                strokeWidth={inPath ? 4 : 2}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* Nós */}
          {NODES.map((node) => {
            let bgColor = "#0a0f18";
            let strokeColor = "#ffffff";
            let textColor = "#ffffff";
            let isStartOrEnd = false;

            if (node.id === 1) {
              bgColor = "#38bdf8"; strokeColor = "#38bdf8"; isStartOrEnd = true;
            } else if (node.id === 10) {
              bgColor = "#4ade80"; strokeColor = "#4ade80"; isStartOrEnd = true;
            } else if (frame.vis.has(node.id)) {
              strokeColor = "#38bdf8"; // Muda a borda para ciano quando visitado
            }

            const isActive = frame.actNode === node.id;

            return (
              <g key={node.id} className="transition-all duration-300">
                {/* Efeito de Halo/Pulse no nó ativo da animação */}
                {isActive && (
                  <circle cx={node.x} cy={node.y} r="35" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  className="transition-colors duration-300"
                />
                
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  fontWeight="bold"
                  fill={textColor}
                  className="select-none"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Rodapé - Caixa de Exemplo e Lógica animada */}
        <div className="flex flex-col items-center mt-6">
          <div className="border-2 border-[#164e63] bg-[#082f49]/40 rounded-md px-12 py-3 mb-6 min-w-[300px] text-center transition-all duration-300">
            <span className="text-[#38bdf8] font-bold tracking-widest text-sm">
              EXEMPLO: {frame.curPath.length > 0 ? frame.curPath.join(" → ") : "1"}
            </span>
          </div>
          <p className="text-white font-bold text-lg text-center max-w-2xl">
            {activeAlgo === 'DFS' 
              ? "A lógica é: aprofundar → não pode avançar → voltar → tentar outro ramo."
              : "A lógica é: aprofundar até ao limite definido → voltar → tentar outro ramo."}
          </p>
        </div>
      </div>
    </div>
  );
}
