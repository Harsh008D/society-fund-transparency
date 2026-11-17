
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({
  children,
  activePage,
  setActivePage,
  currentUser,
  handleLogout,
  menuItems,
}) {
  return (
    <div className="new-app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        handleLogout={handleLogout}
        menuItems={menuItems}
      />

      <main className="new-main-content">
        <Topbar
          activePage={activePage}
          currentUser={currentUser}
        />
        <div className="new-page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
