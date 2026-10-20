import { useState } from 'react';
import { login } from '../api.js';

export default function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useState('admin@pharmacypro.tj');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app login">
      <div className="login-logo">💊</div>
      <h1 className="login-title">PharmacyPro</h1>
      <p className="login-subtitle">Ҳисоботи молиявии дорухона</p>

      <form className="card login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Парол
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <div className="state state-error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Интизор шавед…' : 'Ворид шудан'}
        </button>
      </form>
    </div>
  );
}
