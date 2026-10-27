import { useI18n } from './i18n/index.jsx';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import TodayPage from './pages/TodayPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import FirmsPage from './pages/FirmsPage.jsx';
import FirmsViewPage from './pages/FirmsViewPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BottomNav from './components/BottomNav.jsx';
import { LOGO_SRC } from './logo.js';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import { tokenStore, setAuthFailureHandler, logout } from './api.js';

export default function App() {
  const { t } = useI18n();
  const [user, setUser] = useState(() => (tokenStore.access ? tokenStore.user : null));

  // Агар session тамом шавад, ба саҳифаи login бармегардем
  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  // Баъди иваз шудани парол сервер токенҳоро мебандад
  function handleSessionEnded() {
    tokenStore.clear();
    setUser(null);
  }

  if (!user) return <LoginPage onLoggedIn={setUser} />;
  return <MainApp key={user.id} user={user} onLogout={handleLogout} onSessionEnded={handleSessionEnded} />;
}

function MainApp({ user, onLogout, onSessionEnded }) {
  const { t } = useI18n();
  const isAdmin = Boolean(user.roles?.includes('Admin'));

  // Admin: ҳама чиз. Корманд (фурӯшанда): фурӯш, рӯйхати фирмаҳо, профил
  const tabs = isAdmin
    ? ['report', 'sales', 'expenses', 'firms', 'products', 'users']
    : ['today', 'sales', 'firms', 'profile'];
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="app has-nav">
      <header className="topbar">
        <div className="topbar-brand">
          <img className="topbar-logo" src={LOGO_SRC} alt="GROWIX" />
          <div>
            <div className="topbar-title">GROWIX</div>
            <div className="topbar-sub">{user.fullName} · {isAdmin ? 'Admin' : t('Фурӯшанда')}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <LanguageSwitcher />
          <button className="btn-ghost" onClick={onLogout}>{t('Баромадан')}</button>
        </div>
      </header>

      {tab === 'report' && <ReportPage />}
      {tab === 'today' && <TodayPage />}
      {tab === 'sales' && <SalesPage isAdmin={isAdmin} />}
      {tab === 'expenses' && <ExpensesPage />}
      {tab === 'firms' && (isAdmin ? <FirmsPage /> : <FirmsViewPage />)}
      {tab === 'products' && <ProductsPage />}
      {tab === 'users' && <UsersPage onSessionEnded={onSessionEnded} />}
      {tab === 'profile' && <ProfilePage user={user} onSessionEnded={onSessionEnded} />}

      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}
