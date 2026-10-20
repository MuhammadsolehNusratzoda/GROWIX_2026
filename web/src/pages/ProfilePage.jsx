import ChangePasswordCard from '../components/ChangePasswordCard.jsx';

export default function ProfilePage({ user, onSessionEnded }) {
  return (
    <>
      <section className="card">
        <h3 className="card-title">👤 Профил</h3>
        <p className="profile-line"><strong>{user.fullName}</strong></p>
        <p className="profile-line muted">{user.email}</p>
        <p className="profile-line muted">Нақш: {user.roles?.join(', ')}</p>
      </section>
      <ChangePasswordCard onSessionEnded={onSessionEnded} />
    </>
  );
}
