import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../i18n/index.jsx';
import { LOGO_SRC } from '../logo.js';
import { useState } from 'react';
import { login } from '../api.js';

export default function LoginPage({ onLoggedIn }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
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
      <LanguageSwitcher className="login-lang" />
      <img className="login-logo" src={LOGO_SRC} alt="GROWIX" />
      <h1 className="login-title">GROWIX</h1>
      <p className="login-subtitle">Smart Business Solutions</p>

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
          {t('Парол')}
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
          {loading ? t('Интизор шавед…') : t('Ворид шудан')}
        </button>
      </form>
    </div>
  );
}
