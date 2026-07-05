const AVAILABLE_NODES = [
  { type: 'webhook_trigger', category: 'trigger', label: 'Webhook-Trigger', group: 'Trigger' },
  { type: 'manual_trigger', category: 'trigger', label: 'Manueller Trigger', group: 'Trigger' },
  { type: 'cron_trigger', category: 'trigger', label: 'Zeitplan-Trigger', group: 'Trigger' },
  { type: 'http_request', category: 'action', label: 'HTTP-Anfrage', group: 'Aktionen' },
  { type: 'code', category: 'action', label: 'Code ausführen', group: 'Aktionen' },
  { type: 'claude_ai', category: 'action', label: 'Claude KI', group: 'Aktionen' },
  { type: 'condition', category: 'logic', label: 'Bedingung (Wenn/Dann)', group: 'Logik' },
];

export default function NodePalette({ onAddNode }) {
  const grouped = AVAILABLE_NODES.reduce((acc, node) => {
    acc[node.group] = acc[node.group] || [];
    acc[node.group].push(node);
    return acc;
  }, {});

  return (
    <div style={styles.palette}>
      <h3 style={styles.title}>Nodes</h3>
      {Object.entries(grouped).map(([group, nodes]) => (
        <div key={group} style={{ marginBottom: '1.25rem' }}>
          <p style={styles.groupLabel}>{group}</p>
          {nodes.map((node) => (
            <button
              key={node.type}
              onClick={() => onAddNode(node)}
              style={styles.nodeButton}
            >
              {node.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  palette: {
    width: '220px',
    background: '#1a1d29',
    borderRight: '1px solid #2e3242',
    padding: '1.25rem 1rem',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    overflowY: 'auto',
  },
  title: { fontSize: '0.9rem', marginBottom: '1rem' },
  groupLabel: { fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' },
  nodeButton: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.55rem 0.7rem',
    marginBottom: '0.4rem',
    borderRadius: '6px',
    border: '1px solid #2e3242',
    background: '#242838',
    color: '#e5e7eb',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};
