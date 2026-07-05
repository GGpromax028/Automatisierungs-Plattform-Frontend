import { useState, useEffect } from 'react';

/**
 * Zeigt Konfigurationsfelder passend zum jeweiligen Node-Typ.
 * Bewusst als einfaches JSON-Config-Feld gehalten, damit ALLE
 * bisherigen und zukünftigen Node-Typen ohne UI-Änderung nutzbar sind.
 */
export default function NodeConfigPanel({ node, onUpdate, onClose, onDelete }) {
  const [label, setLabel] = useState(node.data.label);
  const [configText, setConfigText] = useState(JSON.stringify(node.data.config || {}, null, 2));
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    setLabel(node.data.label);
    setConfigText(JSON.stringify(node.data.config || {}, null, 2));
  }, [node.id]);

  function handleSave() {
    try {
      const parsedConfig = JSON.parse(configText);
      setJsonError(null);
      onUpdate(node.id, { label, config: parsedConfig });
    } catch (err) {
      setJsonError('Ungültiges JSON: ' + err.message);
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Node konfigurieren</h3>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      <label style={styles.label}>Name</label>
      <input value={label} onChange={(e) => setLabel(e.target.value)} style={styles.input} />

      <label style={styles.label}>Typ</label>
      <div style={styles.typeBadge}>{node.data.nodeType}</div>

      <label style={styles.label}>
        Konfiguration (JSON)
        <span style={styles.hint}> — nutze {'{{input.feld}}'} für Daten aus vorherigem Node</span>
      </label>
      <textarea
        value={configText}
        onChange={(e) => setConfigText(e.target.value)}
        style={styles.textarea}
        rows={14}
        spellCheck={false}
      />
      {jsonError && <p style={styles.error}>{jsonError}</p>}

      <div style={styles.actions}>
        <button onClick={handleSave} style={styles.saveBtn}>Speichern</button>
        <button onClick={() => onDelete(node.id)} style={styles.deleteBtn}>Node löschen</button>
      </div>

      <ConfigHelp nodeType={node.data.nodeType} />
    </div>
  );
}

function ConfigHelp({ nodeType }) {
  const examples = {
    http_request: `{
  "method": "POST",
  "url": "https://api.example.com/endpoint",
  "headers": { "Content-Type": "application/json" },
  "body": { "name": "{{input.name}}" }
}`,
    code: `{
  "code": "return { doubled: input.value * 2 };"
}`,
    claude_ai: `{
  "prompt": "Fasse zusammen: {{input.text}}",
  "model": "claude-sonnet-4-6",
  "maxTokens": 500
}`,
    condition: `{
  "field": "statusCode",
  "operator": "equals",
  "value": "200"
}`,
  };

  const example = examples[nodeType];
  if (!example) return null;

  return (
    <div style={styles.helpBox}>
      <p style={styles.helpTitle}>Beispiel-Konfiguration:</p>
      <pre style={styles.helpCode}>{example}</pre>
    </div>
  );
}

const styles = {
  panel: {
    width: '340px',
    background: '#1a1d29',
    borderLeft: '1px solid #2e3242',
    padding: '1.25rem',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    overflowY: 'auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1rem' },
  closeBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem' },
  label: { display: 'block', color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem', marginBottom: '0.3rem' },
  hint: { color: '#6b7280', fontWeight: 400 },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #2e3242',
    background: '#0f1117',
    color: '#fff',
    boxSizing: 'border-box',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    background: '#2e3242',
    fontSize: '0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #2e3242',
    background: '#0f1117',
    color: '#a5f3fc',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  error: { color: '#f87171', fontSize: '0.8rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  saveBtn: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
  },
  helpBox: { marginTop: '1.5rem', padding: '0.75rem', background: '#0f1117', borderRadius: '8px' },
  helpTitle: { fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.5rem 0' },
  helpCode: { fontSize: '0.7rem', color: '#a5f3fc', margin: 0, whiteSpace: 'pre-wrap' },
};
