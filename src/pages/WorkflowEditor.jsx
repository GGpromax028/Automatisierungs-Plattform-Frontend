import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import WorkflowNode from '../components/WorkflowNode';
import NodePalette from '../components/NodePalette';
import NodeConfigPanel from '../components/NodeConfigPanel';
import apiClient from '../api/client';

const nodeTypes = { workflowNode: WorkflowNode };
let idCounter = 1;
const generateId = () => `node_${Date.now()}_${idCounter++}`;

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [workflowName, setWorkflowName] = useState('Neuer Workflow');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const workflowIdRef = useRef(isNew ? null : id);

  useEffect(() => {
    if (!isNew) loadWorkflow();
  }, [id]);

  async function loadWorkflow() {
    const { data } = await apiClient.get(`/workflows/${id}`);
    setWorkflowName(data.workflow.name);
    const def = data.workflow.definition || { nodes: [], edges: [] };
    setNodes(def.nodes.map(toReactFlowNode));
    setEdges(def.edges);
  }

  function toReactFlowNode(n) {
    return {
      id: n.id,
      type: 'workflowNode',
      position: n.position || { x: 250, y: 150 },
      data: { label: n.name, nodeType: n.type, category: n.category, config: n.config },
    };
  }

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params }, eds)),
    [setEdges]
  );

  function handleAddNode(nodeDef) {
    const category = nodeDef.category === 'trigger' ? 'trigger' : nodeDef.category === 'logic' ? 'logic' : 'action';
    const actualType = nodeDef.type.includes('trigger')
      ? nodeDef.type === 'webhook_trigger' ? 'webhook' : nodeDef.type === 'cron_trigger' ? 'cron' : 'manual'
      : nodeDef.type;

    const newNode = {
      id: generateId(),
      type: 'workflowNode',
      position: { x: 100 + nodes.length * 60, y: 100 + nodes.length * 40 },
      data: {
        label: nodeDef.label,
        nodeType: category === 'trigger' ? actualType : nodeDef.type,
        category,
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  function handleUpdateNode(nodeId, updates) {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n))
    );
    setSelectedNode(null);
  }

  function handleDeleteNode(nodeId) {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }

  function buildDefinition() {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.data.label,
        type: n.data.nodeType,
        category: n.data.category,
        config: n.data.config || {},
        position: n.position,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
      })),
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const definition = buildDefinition();
      if (isNew) {
        const { data } = await apiClient.post('/workflows', { name: workflowName, definition });
        workflowIdRef.current = data.workflow.id;
        navigate(`/workflows/${data.workflow.id}`, { replace: true });
      } else {
        await apiClient.put(`/workflows/${id}`, { name: workflowName, definition });
      }
      setStatusMessage({ type: 'success', text: 'Gespeichert.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Speichern fehlgeschlagen: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRun() {
    if (isNew) {
      setStatusMessage({ type: 'error', text: 'Bitte zuerst speichern.' });
      return;
    }
    setIsRunning(true);
    try {
      await apiClient.post(`/workflows/${id}/run`, { payload: {} });
      setStatusMessage({ type: 'success', text: 'Workflow gestartet — siehe Ausführungs-Historie.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Start fehlgeschlagen: ' + err.message });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={styles.nameInput}
        />
        <div style={styles.topBarActions}>
          {statusMessage && (
            <span style={{ color: statusMessage.type === 'error' ? '#f87171' : '#4ade80', fontSize: '0.8rem' }}>
              {statusMessage.text}
            </span>
          )}
          <button onClick={handleRun} disabled={isRunning} style={styles.runBtn}>
            {isRunning ? 'Startet...' : '▶ Ausführen'}
          </button>
          <button onClick={handleSave} disabled={isSaving} style={styles.saveBtn}>
            {isSaving ? 'Speichert...' : 'Speichern'}
          </button>
          <button onClick={() => navigate('/')} style={styles.backBtn}>Zurück</button>
        </div>
      </div>

      <div style={styles.body}>
        <NodePalette onAddNode={handleAddNode} />

        <div style={styles.canvas}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#2e3242" gap={20} />
            <Controls />
            <MiniMap style={{ background: '#1a1d29' }} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1117' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #2e3242',
  },
  nameInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 600,
    outline: 'none',
  },
  topBarActions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  runBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  saveBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #2e3242',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  canvas: { flex: 1, position: 'relative' },
};
