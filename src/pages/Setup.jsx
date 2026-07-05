import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Setup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    if (password.length < 12) {
      setError('Das Passwort muss mindestens 12 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/auth/setup', { email, password });
      localStorage.setItem('auth_token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ersteinrichtung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Willkommen 👋</h1>
        <p style={styles.subtitle}>
          Das ist die erste Anmeldung — leg jetzt deinen einzigen Zugang für dieses
          System fest. Das kann später nicht noch einmal gemacht werden.
        </p>

        <label style={styles.label}>Deine E-Mail-Adresse</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
          autoFocus
        />

        <label style={styles.label}>Neues Passwort (mind. 12 Zeichen)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          minLength={12}
        />

        <label style={styles.label}>Passwort bestätigen</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          style={styles.input}
          required
          minLength={12}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Wird eingerichtet...' : 'Zugang einrichten'}
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
    padding: '1rem',
  },
  form: {
    background: '#1a1d29',
    padding: '2.5rem',
    borderRadius: '12px',
    width: '380px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
  },
  title: { color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' },
  subtitle: { color: '#8b8fa3', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 },
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
