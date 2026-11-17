
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    ChartNoAxesCombined,
    Building2,
    Mail,
    Leaf,
    LogOut
  } from 'lucide-react';
  
  const icons = {
    Dashboard: LayoutDashboard,
    Funds: Wallet,
    Expenses: Receipt,
    Reports: ChartNoAxesCombined,
    Society: Building2,
    'Manage Invitations': Mail,
  };
  
  export default function Sidebar({
    activePage,
    setActivePage,
    currentUser,
    handleLogout,
    menuItems,
  }) {
    return (
      <aside className="new-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Leaf size={21} /></div>
          <div>
            <h2>Society<span>Fund</span></h2>
            <p>FINANCIAL PORTAL</p>
          </div>
        </div>
  
        <p className="sidebar-label">WORKSPACE</p>
  
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = icons[item.name] || LayoutDashboard;
  
            return (
              <button
                key={item.name}
                className={`sidebar-link ${
                  activePage === item.name ? 'selected' : ''
                }`}
                onClick={() => setActivePage(item.name)}
                type="button"
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
  
        <div className="sidebar-bottom">
          <div className="profile-avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <strong>{currentUser?.name || 'User'}</strong>
            <span>
              {currentUser?.role === 'admin' ? 'Society Admin' : 'Resident'}
            </span>
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title="Logout"
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    );
  }
  