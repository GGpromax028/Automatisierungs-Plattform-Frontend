import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    setIsLoading(true);
    const { data } = await apiClient.get('/workflows');
    setWorkflows(data.workflows);
    setIsLoading(false);
  }

  async function toggleActive(workflow) {
    await apiClient.put(`/workflows/${workflow.id}`, { is_active: !workflow.is_active });
    loadWorkflows();
  }

  async function deleteWorkflow(workflowId) {
    if (!confirm('Workflow wirklich löschen?')) return;
    await apiClient.delete(`/workflows/${workflowId}`);
    loadWorkflows();
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Deine Workflows</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/workflows/new')} style={styles.newBtn}>
            + Neuer Workflow
          </button>
          <button onClick={logout} style={styles.logoutBtn}>Abmelden</button>
        </div>
      </div>

      {isLoading ? (
        <p style={styles.muted}>Lädt...</p>
      ) : workflows.length === 0 ? (
        <p style={styles.muted}>Noch keine Workflows. Erstelle deinen ersten!</p>
      ) : (
        <div style={styles.grid}>
          {workflows.map((wf) => (
            <div key={wf.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{wf.name}</h3>
                <span style={{ ...styles.badge, background: wf.is_active ? '#166534' : '#4b5162' }}>
                  {wf.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              <p style={styles.cardDesc}>{wf.description || 'Keine Beschreibung'}</p>
              <div style={styles.cardActions}>
                <button onClick={() => navigate(`/workflows/${wf.id}`)} style={styles.editBtn}>
                  Bearbeiten
                </button>
                <button onClick={() => toggleActive(wf)} style={styles.toggleBtn}>
                  {wf.is_active ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button onClick={() => deleteWorkflow(wf.id)} style={styles.deleteBtn}>
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', background: '#0f1117', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { color: '#fff', margin: 0 },
  newBtn: { padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  logoutBtn: { padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #2e3242', background: 'transparent', color: '#9ca3af', cursor: 'pointer' },
  muted: { color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: '#1a1d29', border: '1px solid #2e3242', borderRadius: '10px', padding: '1.25rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', margin: 0, fontSize: '1rem' },
  badge: { color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px' },
  cardDesc: { color: '#9ca3af', fontSize: '0.85rem', minHeight: '2.5rem' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  editBtn: { flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#2e3242', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
  toggleBtn: { flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #2e3242', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' },
};
