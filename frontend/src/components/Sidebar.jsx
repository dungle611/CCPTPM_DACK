// Sidebar.jsx - Thanh điều hướng bên trái kiểu Jira
const Sidebar = ({ onCreateIssue, activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>
        <div className="sidebar-project">
          <div className="sidebar-project-name">Dự án CCPTPM</div>
          <div className="sidebar-project-type">Software Project</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Lập kế hoạch</div>

        <button
          className={`sidebar-nav-item ${activePage === "board" ? "active" : ""}`}
          onClick={() => onNavigate("board")}
          id="nav-board"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Board
        </button>

        <button
          className={`sidebar-nav-item ${activePage === "backlog" ? "active" : ""}`}
          onClick={() => onNavigate("backlog")}
          id="nav-backlog"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Backlog
        </button>

        <button
          className={`sidebar-nav-item ${activePage === "timeline" ? "active" : ""}`}
          onClick={() => onNavigate("timeline")}
          id="nav-timeline"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Timeline
        </button>

        <div className="sidebar-nav-label" style={{ marginTop: "20px" }}>Quản lý</div>

        <button
          className={`sidebar-nav-item ${activePage === "issues" ? "active" : ""}`}
          onClick={() => onNavigate("issues")}
          id="nav-issues"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Danh sách
        </button>

        <button
          className={`sidebar-nav-item ${activePage === "members" ? "active" : ""}`}
          onClick={() => onNavigate("members")}
          id="nav-members"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Thành viên
        </button>
      </nav>

      {/* Create Button */}
      <button
        className="sidebar-create-btn"
        onClick={onCreateIssue}
        id="sidebar-create-issue-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Tạo Issue mới
      </button>
    </aside>
  );
};

export default Sidebar;
