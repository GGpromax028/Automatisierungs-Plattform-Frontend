import { Handle, Position } from 'reactflow';

const NODE_STYLES = {
  trigger: { bg: '#1e3a5f', border: '#3b82f6', icon: '⚡' },
  http_request: { bg: '#1e3a2e', border: '#22c55e', icon: '🌐' },
  code: { bg: '#3a1e3a', border: '#a855f7', icon: '{ }' },
  claude_ai: { bg: '#3a2e1e', border: '#f59e0b', icon: '✦' },
  condition: { bg: '#3a1e1e', border: '#ef4444', icon: '⑂' },
  default: { bg: '#242838', border: '#4b5162', icon: '●' },
};

export default function WorkflowNode({ data, isConnectable }) {
  const style = NODE_STYLES[data.nodeType] || NODE_STYLES.default;

  return (
    <div
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        minWidth: '180px',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.85rem',
      }}
    >
      {data.category !== 'trigger' && (
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{style.icon}</span>
        <strong>{data.label}</strong>
      </div>
      <div style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '0.2rem' }}>{data.nodeType}</div>

      {data.nodeType === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%', background: '#22c55e' }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%', background: '#ef4444' }}
            isConnectable={isConnectable}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      )}
    </div>
  );
}
