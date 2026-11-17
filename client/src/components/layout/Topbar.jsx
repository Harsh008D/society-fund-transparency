
import { Bell, Search } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

export default function Topbar({ activePage, currentUser }) {
  return (
    <header className="new-topbar">
      <div className="topbar-heading">
        <p>Workspace / {activePage}</p>
        <h1>{activePage}</h1>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={17} />
          <span>Search records...</span>
        </div>

        <ThemeToggle />

        <button className="notification-button" type="button" aria-label="Notifications">
          <Bell size={19} />
        </button>

        <div className="topbar-user">
          <div className="profile-avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
