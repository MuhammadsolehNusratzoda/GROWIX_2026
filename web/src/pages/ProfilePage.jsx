import { useI18n } from '../i18n/index.jsx';
import Icon from '../components/Icon.jsx';
import ChangePasswordCard from '../components/ChangePasswordCard.jsx';

export default function ProfilePage({ user, onSessionEnded }) {
  const { t } = useI18n();
  return (
    <>
      <section className="card">
        <h3 className="card-title"><Icon name="user" tone="blue" />{t('Профил')}</h3>
        <p className="profile-line"><strong>{user.fullName}</strong></p>
        <p className="profile-line muted">{user.email}</p>
        <p className="profile-line muted">{t('Нақш')}: {user.roles?.join(', ')}</p>
      </section>
      <ChangePasswordCard onSessionEnded={onSessionEnded} />
    </>
  );
}
