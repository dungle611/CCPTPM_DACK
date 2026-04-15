import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import useProjectStore from "../store/useProjectStore";
import CreateProjectModal from "../components/CreateProjectModal";

const StartPage = ({ onSelectProject }) => {
  const { user, logout } = useAuthStore();
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="start-page">
      {/* Top Bar */}
      <header className="start-topbar">
        <div className="start-topbar-left">
          <div className="start-topbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
            <span>TaskFlow</span>
          </div>
        </div>
        <div className="start-topbar-right">
          <div className="start-user-info">
            <div className="start-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <span className="start-user-name">{user?.name}</span>
          </div>
          <button className="start-logout-btn" onClick={logout} id="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Welcome Section */}
      <main className="start-main">
        <div className="start-welcome-section">
          <h1 className="start-welcome-title">
            {getTimeGreeting()}, <span className="start-welcome-name">{user?.name}</span> 👋
          </h1>
          <p className="start-welcome-subtitle">
            Chọn dự án để tiếp tục hoặc tạo mới một dự án
          </p>
        </div>

        {/* Recent Projects */}
        <div className="start-projects-section">
          <div className="start-projects-header">
            <h2 className="start-projects-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Dự án của bạn
            </h2>
            <button
              className="start-create-project-btn"
              onClick={() => setIsCreateModalOpen(true)}
              id="start-create-project-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo dự án mới
            </button>
          </div>

          {isLoading ? (
            <div className="start-loading">
              <div className="auth-spinner" />
              <span>Đang tải dự án...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="start-empty">
              <div className="start-empty-icon">📋</div>
              <h3>Chưa có dự án nào</h3>
              <p>Bắt đầu bằng cách tạo dự án đầu tiên của bạn</p>
              <button
                className="start-create-project-btn large"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tạo dự án đầu tiên
              </button>
            </div>
          ) : (
            <div className="start-projects-grid">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="start-project-card"
                  onClick={() => onSelectProject(project._id)}
                  id={`project-card-${project._id}`}
                >
                  <div className="start-project-card-avatar">
                    {project.avatar ? (
                      <img src={project.avatar} alt={project.key} />
                    ) : (
                      <span>{project.key?.substring(0, 2)}</span>
                    )}
                  </div>
                  <div className="start-project-card-info">
                    <h3 className="start-project-card-name">{project.name}</h3>
                    <div className="start-project-card-meta">
                      <span className="start-project-card-key">{project.key}</span>
                      <span className="start-project-card-type">Software Project</span>
                    </div>
                  </div>
                  <button className="start-project-card-go">
                    Mở →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(project) => {
          setIsCreateModalOpen(false);
          onSelectProject(project._id);
        }}
      />
    </div>
  );
};

export default StartPage;
