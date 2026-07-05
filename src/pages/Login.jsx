import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Automation Platform</h1>
        <p style={styles.subtitle}>Privater Zugang</p>

        <label style={styles.label}>E-Mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
          autoFocus
        />

        <label style={styles.label}>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0f1117',
    fontFamily: 'system-ui, sans-serif',
  },
  form: {
    background: '#1a1d29',
    padding: '2.5rem',
    borderRadius: '12px',
    width: '340px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
  },
  title: { color: '#fff', fontSize: '1.5rem', marginBottom: '0.25rem' },
  subtitle: { color: '#8b8fa3', fontSize: '0.85rem', marginBottom: '1.5rem' },
  label: { color: '#c5c8d6', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem', marginTop: '1rem' },
  input: {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '8px',
    border: '1px solid #2e3242',
    background: '#0f1117',
    color: '#fff',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    marginTop: '1.5rem',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  error: { color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' },
};
