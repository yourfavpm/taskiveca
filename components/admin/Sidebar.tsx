'use client'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  userEmail?: string
  adminRole?: string
  onLogout: () => void
}

export default function Sidebar({ activeTab, setActiveTab, userEmail, adminRole, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'crm', label: 'CRM / Pipeline', icon: '🤝' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'consultations', label: 'Consultations', icon: '💬' },
    { id: 'casestudies', label: 'Case Studies', icon: '📁' },
    { id: 'testimonials', label: 'Testimonials', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  if (adminRole === 'super_admin') {
      menuItems.push({ id: 'team', label: 'Team', icon: '👥' })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">Taskive Admin</div>
        <div className="user-email">{userEmail}</div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          Log Out
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          background: #111111;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 100;
          border-right: 1px solid #333;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #222;
        }

        .brand {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .user-email {
          font-size: 12px;
          color: #666;
        }

        .nav-menu {
          padding: 24px 12px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          background: #222;
          color: #fff;
        }

        .nav-item.active {
          background: #2563EB;
          color: #fff;
        }

        .icon {
          font-size: 16px;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid #222;
        }

        .logout-btn {
          width: 100%;
          padding: 10px;
          background: #1a1a1a;
          color: #888;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #333;
          color: #fff;
        }
      `}</style>
    </aside>
  )
}
