import React, { useState, useEffect, useMemo } from 'react';

// Coordenadas dos nós para um layout bonito em formato de árvore
const NODES = [
  { id: 1, x: 450, y: 50 },
  { id: 2, x: 250, y: 150 },
  { id: 3, x: 650, y: 150 },
  { id: 6, x: 150, y: 280 },
  { id: 4, x: 350, y: 280 },
  { id: 5, x: 550, y: 280 },
  { id: 7, x: 750, y: 280 },
  { id: 8, x: 450, y: 380 },
  { id: 9, x: 650, y: 380 },
  { id: 10, x: 550, y: 480 },
];

// Lista de adjacência (Arestas Direcionadas para visualização clara)
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

// Arestas originais exigidas
const EDGES = [
  [1, 2], [1, 3], [2, 4], [2, 6], [3, 5], [3, 7], 
  [4, 8], [5, 9], [6, 4], [7, 8], [8, 10], [9, 10]
];

// Função que gera a sequência de passos para a Busca em Profundidade (DFS)
const generateDFSSteps = () => {
  const steps = [];
  const visited = new Set();
  const path = [];

  const dfs = (node, fromNode) => {
    if (visited.has(node)) {
      if (fromNode) steps.push({ type: 'try_edge', edge: [fromNode, node] });
      return;
    }
    
    if (fromNode) steps.push({ type: 'traverse', edge: [fromNode, node] });
    
    visited.add(node);
    path.push(node);
    steps.push({ type: 'visit', node, path: [...path] });

    for (const neighbor of ADJ[node]) {
      dfs(neighbor, node);
    }
    
    steps.push({ type: 'complete', node });
  };

  dfs(1, null);
  steps.push({ type: 'done' });
  return steps;
};

// Função que gera a sequência de passos para Busca Limitada (DLS)
const generateDLSSteps = (limit = 2) => {
  const steps = [];
  const visited = new Set();
  const path = [];

  const dls = (node, depth, fromNode) => {
    if (depth > limit) {
      if (fromNode) steps.push({ type: 'limit_reached', edge: [fromNode, node], node });
      return;
    }

    if (visited.has(node)) {
      if (fromNode) steps.push({ type: 'try_edge', edge: [fromNode, node] });
      return;
    }

    if (fromNode) steps.push({ type: 'traverse', edge: [fromNode, node] });

    visited.add(node);
    path.push(node);
    steps.push({ type: 'visit', node, path: [...path], depth });

    for (const neighbor of ADJ[node]) {
      dls(neighbor, depth + 1, node);
    }

    steps.push({ type: 'complete', node });
  };

  dls(1, 0, null);
  steps.push({ type: 'done' });
  return steps;
};

// Calcula a interseção exata da aresta com as bordas do círculo para a seta não invadir o nó
const getEdgeCoords = (n1, n2, radius = 24) => {
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  const angle = Math.atan2(dy, dx);
  return {
    x1: n1.x + Math.cos(angle) * radius,
    y1: n1.y + Math.sin(angle) * radius,
    x2: n2.x - Math.cos(angle) * (radius + 6), // espaço para a ponta da seta
    y2: n2.y - Math.sin(angle) * (radius + 6)
  };
};

const getNodeById = (id) => NODES.find(n => n.id === id);

// Ícone SVG Play Inline
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// Ícone SVG Reset Inline
const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
  </svg>
);

export default function GraphVisualizer() {
  const [activeAlgo, setActiveAlgo] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Computa o estado visual da tela dinamicamente baseado no passo atual (stepIdx)
  const frame = useMemo(() => {
    let vis = new Set();
    let comp = new Set();
    let actNode = null;
    let actEdge = null;
    let travEdges = new Set();
    let curPath = [];

    for (let i = 0; i <= stepIdx; i++) {
      const step = steps[i];
      if (!step) continue;
      
      actEdge = null; // Reseta highlight de aresta, a menos que seja uma travessia
      
      if (step.type === 'visit') {
        vis.add(step.node);
        actNode = step.node;
        curPath = step.path;
      } else if (step.type === 'traverse') {
        actEdge = `${step.edge[0]}-${step.edge[1]}`;
        travEdges.add(actEdge);
      } else if (step.type === 'complete') {
        comp.add(step.node);
        actNode = null;
      } else if (step.type === 'try_edge' || step.type === 'limit_reached') {
        actEdge = `${step.edge[0]}-${step.edge[1]}`;
      } else if (step.type === 'done') {
        setIsPlaying(false);
      }
    }
    return { vis, comp, actNode, actEdge, travEdges, curPath };
  }, [steps, stepIdx]);

  // Efeito para rodar o "player" da animação
  useEffect(() => {
    let interval;
    if (isPlaying && stepIdx < steps.length - 1) {
      interval = setInterval(() => {
        setStepIdx(prev => prev + 1);
      }, 900); // 900ms por passo de animação
    } else if (stepIdx >= steps.length - 1) {
      setIsPlaying(false);
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
    setSteps(generateDLSSteps(2)); // Limite 2 exigido na requisição
    setStepIdx(-1);
    setActiveAlgo('DLS');
    setIsPlaying(true);
  };

  const handleReset = () => {
    setSteps([]);
    setStepIdx(-1);
    setActiveAlgo(null);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 font-sans">
      
      {/* Header */}
      <div className="bg-white px-8 py-4 shadow-sm border-b border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Comparação Busca Cega</h1>
          <p className="text-sm text-slate-500">Visualização Interativa: DFS vs DLS (Limite 2)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleStartDFS}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-95"
          >
            <PlayIcon /> Iniciar DFS
          </button>
          <button 
            onClick={handleStartDLS}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-95"
          >
            <PlayIcon /> Iniciar DLS
          </button>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
          >
            <ResetIcon /> Resetar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden p-6 justify-center">
        
        {/* Graph Canvas */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden">
          
          <svg viewBox="0 0 900 550" className="w-full h-full max-h-[750px]">
            <defs>
              <marker id="arrow-default" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
              </marker>
              <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
              <marker id="arrow-traversed" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Arestas (Edges) */}
            {EDGES.map(([u, v]) => {
              const n1 = getNodeById(u);
              const n2 = getNodeById(v);
              const coords = getEdgeCoords(n1, n2, 22); // Radius do circulo é 22
              const edgeKey = `${u}-${v}`;
              
              let edgeColor = "#cbd5e1"; // Base gray
              let markerId = "url(#arrow-default)";
              let strokeW = 3;

              if (frame.actEdge === edgeKey) {
                edgeColor = "#f59e0b"; // Yellow-orange for active action
                markerId = "url(#arrow-active)";
                strokeW = 4;
              } else if (frame.travEdges.has(edgeKey)) {
                edgeColor = "#3b82f6"; // Blue for traversed
                markerId = "url(#arrow-traversed)";
              }

              return (
                <line 
                  key={edgeKey}
                  x1={coords.x1} y1={coords.y1} 
                  x2={coords.x2} y2={coords.y2}
                  stroke={edgeColor} 
                  strokeWidth={strokeW}
                  markerEnd={markerId}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nós (Nodes) */}
            {NODES.map((node) => {
              let bgColor = "#ffffff";
              let strokeColor = "#cbd5e1";
              let textColor = "#475569";
              let strokeW = 2;

              if (frame.actNode === node.id) {
                bgColor = "#fef08a"; // Amarelo foco
                strokeColor = "#eab308";
                textColor = "#854d0e";
                strokeW = 4;
              } else if (frame.comp.has(node.id)) {
                bgColor = "#dcfce7"; // Verde completo
                strokeColor = "#22c55e";
                textColor = "#166534";
              } else if (frame.vis.has(node.id)) {
                bgColor = "#eff6ff"; // Azul em andamento
                strokeColor = "#3b82f6";
                textColor = "#1e40af";
                strokeW = 3;
              }

              return (
                <g key={node.id} className="transition-all duration-300">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    filter="url(#shadow)"
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="18"
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
          
          {/* Indicador DLS Profundidade (Visual Guide) */}
          {activeAlgo === 'DLS' && (
            <div className="absolute top-8 left-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-semibold shadow-sm">
              Limite Restrito a Profundidade 2
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
