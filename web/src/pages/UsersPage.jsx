import { useI18n } from '../i18n/index.jsx';
import Icon from '../components/Icon.jsx';
import { useState } from 'react';
import { registerUser, errorText } from '../api.js';
import Message from '../components/Message.jsx';
import RecordRow from '../components/RecordRow.jsx';
import ChangePasswordCard from '../components/ChangePasswordCard.jsx';

const ROLE_LABELS = { Pharmacist: 'Фурӯшанда', Admin: 'Admin (маъмур)' };

export default function UsersPage({ onSessionEnded }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'Pharmacist' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [created, setCreated] = useState([]);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const user = await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setCreated((list) => [user, ...list]);
      setMessage({ type: 'ok', text: t('«{name}» илова шуд', { name: user.fullName }) });
      setForm({ fullName: '', email: '', password: '', role: form.role });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <h3 className="card-title"><Icon name="users" tone="blue" />{t('Корманди нав')}</h3>

        <label className="field">
          {t('Ному насаб')}
          <input name="fullName" type="text" maxLength="100" value={form.fullName}
            onChange={setField('fullName')} required />
        </label>
        <label className="field">
          {t('Email (барои воридшавӣ)')}
          <input name="email" type="email" autoComplete="off" value={form.email}
            onChange={setField('email')} required />
        </label>
        <label className="field">
          {t('Парол')}
          <input name="password" type="text" autoComplete="off" minLength="8" value={form.password}
            onChange={setField('password')} required />
        </label>
        <p className="hint">{t('Камаш 8 аломат, як рақам ва як ҳарфи калон (масалан Growix2026). Корманд баъдтар онро худаш иваз карда метавонад.')}</p>
        <label className="field">
          {t('Нақш')}
          <select name="role" value={form.role} onChange={setField('role')}>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </select>
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? t('Сабт мешавад…') : t('Корманд илова шавад')}
        </button>
      </form>

      {created.length > 0 && (
        <section className="card">
          <h3 className="card-title">{t('Дар ин сессия илова шуданд')}</h3>
          <ul className="records">
            {created.map((u) => (
              <RecordRow key={u.id} title={u.fullName} subtitle={`${u.email} · ${u.roles.join(', ')}`} />
            ))}
          </ul>
        </section>
      )}

      <ChangePasswordCard onSessionEnded={onSessionEnded} />
    </>
  );
}
