// Sidebar.jsx - Thanh điều hướng bên trái kiểu Jira
import useAuthStore from "../store/useAuthStore";
import { getAvatarInitials, getAvatarColor } from "../utils/helpers";

const Sidebar = ({ onCreateIssue, activePage, onNavigate, projectName, projectKey, onBackToProjects }) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar">
      {/* Logo + Nút quay lại */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>
        <div className="sidebar-project">
          <div className="sidebar-project-name">{projectName || "Dự án"}</div>
        </div>
      </div>

      {/* Nút quay lại danh sách dự án */}
      <button className="sidebar-back-btn" onClick={onBackToProjects} id="sidebar-back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Danh sách dự án
      </button>

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

      {/* User Info + Logout */}
      <div className="sidebar-user-section">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar" style={{ background: getAvatarColor(user?.name) }}>
            <span>{getAvatarInitials(user?.name)}</span>
          </div>
          <span className="sidebar-user-name">{user?.name}</span>
        </div>
        <button className="sidebar-logout-btn" onClick={() => {
          if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?")) {
            logout();
          }
        }} title="Đăng xuất">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
