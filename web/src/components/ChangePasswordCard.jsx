import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import { useState } from 'react';
import { changePassword, errorText } from '../api.js';
import Message from './Message.jsx';

export default function ChangePasswordCard({ onSessionEnded }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (form.next !== form.confirm) {
      setMessage({ type: 'error', text: t('Пароли нав ва тасдиқи он яксон нестанд') });
      return;
    }
    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      setMessage({ type: 'ok', text: t('Парол иваз шуд. Дубора ворид шавед…') });
      // Сервер ҳамаи session-ҳоро мебандад, пас ба саҳифаи login бармегардем
      setTimeout(() => onSessionEnded(), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3 className="card-title"><Icon name="key" tone="yellow" />{t('Иваз кардани парол')}</h3>

      <label className="field">
        {t('Пароли ҳозира')}
        <input name="currentPassword" type="password" autoComplete="current-password"
          value={form.current} onChange={setField('current')} required />
      </label>
      <label className="field">
        {t('Пароли нав')}
        <input name="newPassword" type="password" autoComplete="new-password" minLength="8"
          value={form.next} onChange={setField('next')} required />
      </label>
      <label className="field">
        {t('Пароли навро такрор кунед')}
        <input name="confirmPassword" type="password" autoComplete="new-password"
          value={form.confirm} onChange={setField('confirm')} required />
      </label>
      <p className="hint">{t('Камаш 8 аломат, ҳадди аққал як рақам ва як ҳарфи калон (масалан Growix2026).')}</p>

      <Message message={message} />
      <button className="btn" type="submit" disabled={saving}>
        {saving ? t('Интизор шавед…') : t('Парол иваз шавад')}
      </button>
    </form>
  );
}
