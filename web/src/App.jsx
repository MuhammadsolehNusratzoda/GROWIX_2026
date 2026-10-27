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
import { tokenStore, setAuthFailureHandler, logout } from './api.js';

export default function App() {
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
  const isAdmin = Boolean(user.roles?.includes('Admin'));

  // Admin: ҳама чиз. Корманд (Pharmacist): фурӯш, рӯйхати фирмаҳо, профил
  const tabs = isAdmin
    ? ['report', 'sales', 'expenses', 'firms', 'products', 'users']
    : ['today', 'sales', 'firms', 'profile'];
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="app has-nav">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">💊</span>
          <div>
            <div className="topbar-title">PharmacyPro</div>
            <div className="topbar-sub">{user.fullName} · {isAdmin ? 'Admin' : 'Корманд'}</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Баромадан</button>
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
