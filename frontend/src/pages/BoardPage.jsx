import useIssueStore from "../store/useIssueStore";

const COLUMNS = [
  { key: "Todo", label: "Cần làm", indicator: "todo" },
  { key: "InProgress", label: "Đang làm", indicator: "progress" },
  { key: "Test", label: "Kiểm thử", indicator: "test" },
  { key: "Done", label: "Hoàn thành", indicator: "done" },
];

// Component hiển thị từng Issue card
const IssueCard = ({ issue, onEdit, onDelete }) => {
  const typeClass = issue.type.toLowerCase();

  const getPriorityIcon = (priority) => {
    if (priority === "High") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    }
    if (priority === "Medium") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  };

  // Lấy chữ cái đầu cho avatar
  const getAvatarInitial = () => {
    if (issue.assignee && issue.assignee.name) {
      return issue.assignee.name.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <div className="issue-card" id={`issue-card-${issue._id}`}>
      <div className="issue-card-top">
        <div className={`issue-card-type ${typeClass}`}>
          {issue.type === "Epic" ? "⚡" : issue.type === "Story" ? "📖" : "✅"}{" "}
          {issue.type}
        </div>
        {/* Nút Edit & Delete */}
        <div className="issue-card-actions">
          <button
            className="card-action-btn edit"
            onClick={(e) => { e.stopPropagation(); onEdit(issue); }}
            title="Chỉnh sửa"
            id={`edit-card-${issue._id}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="card-action-btn delete"
            onClick={(e) => { e.stopPropagation(); onDelete(issue); }}
            title="Xóa"
            id={`delete-card-${issue._id}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <div className="issue-card-title">{issue.title}</div>
      <div className="issue-card-footer">
        <div className={`issue-card-priority ${issue.priority.toLowerCase()}`}>
          {getPriorityIcon(issue.priority)}
          {issue.priority}
        </div>
        {issue.assignee && (
          <div className="issue-card-avatar" title={issue.assignee.name}>
            {getAvatarInitial()}
          </div>
        )}
      </div>
    </div>
  );
};

// Component trang Board chính
const BoardPage = ({ onCreateIssue, onEditIssue, onDeleteIssue }) => {
  const issues = useIssueStore((state) => state.issues);
  const loading = useIssueStore((state) => state.loading);

  // Đếm số issue theo status
  const getCountByStatus = (status) => {
    return issues.filter((i) => i.status === status).length;
  };

  // Lấy issues theo status
  const getIssuesByStatus = (status) => {
    return issues.filter((i) => i.status === status);
  };

  return (
    <div className="board-page">
      {/* Header */}
      <div className="board-header">
        <div className="board-breadcrumb">
          Dự án <span>/ Board</span>
        </div>
        <div className="board-header-top">
          <h1 className="board-title">Kanban Board</h1>
          <button
            className="board-header-btn"
            onClick={onCreateIssue}
            id="board-create-issue-btn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo mới
          </button>
        </div>

        {/* Stats */}
        <div className="board-stats">
          {COLUMNS.map((col) => (
            <div className="board-stat" key={col.key}>
              <div className={`board-stat-dot ${col.indicator}`} />
              <span>{col.label}:</span>
              <span className="board-stat-count">{getCountByStatus(col.key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board Columns */}
      <div className="board-columns">
        {COLUMNS.map((col) => {
          const colIssues = getIssuesByStatus(col.key);
          return (
            <div className="board-column" key={col.key} id={`column-${col.key}`}>
              <div className="board-column-header">
                <div className="board-column-title-group">
                  <div className={`board-column-indicator ${col.indicator}`} />
                  <span className="board-column-title">{col.label}</span>
                </div>
                <span className="board-column-count">{colIssues.length}</span>
              </div>

              <div className="board-column-cards">
                {loading ? (
                  <div className="column-empty">
                    <p>Đang tải...</p>
                  </div>
                ) : colIssues.length === 0 ? (
                  <div className="column-empty">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <p>Chưa có Issue nào</p>
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      onEdit={onEditIssue}
                      onDelete={onDeleteIssue}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardPage;
