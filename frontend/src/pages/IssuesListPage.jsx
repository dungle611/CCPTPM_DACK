import { useState } from "react";
import useIssueStore from "../store/useIssueStore";
import IssueDetailModal from "../components/IssueDetailModal";

const IssuesListPage = ({ onCreateIssue }) => {
  const issues = useIssueStore((state) => state.issues);
  const loading = useIssueStore((state) => state.loading);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Lọc danh sách
  const filteredIssues = issues.filter((issue) => {
    if (filterType && issue.type !== filterType) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterPriority && issue.priority !== filterPriority) return false;
    return true;
  });

  // Sắp xếp
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let valA, valB;
    if (sortField === "title") {
      valA = a.title.toLowerCase();
      valB = b.title.toLowerCase();
    } else if (sortField === "type") {
      valA = a.type;
      valB = b.type;
    } else if (sortField === "status") {
      const statusOrder = { Todo: 0, InProgress: 1, Test: 2, Done: 3 };
      valA = statusOrder[a.status];
      valB = statusOrder[b.status];
    } else if (sortField === "priority") {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      valA = priorityOrder[a.priority];
      valB = priorityOrder[b.priority];
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Todo": return "Cần làm";
      case "InProgress": return "Đang làm";
      case "Test": return "Kiểm thử";
      case "Done": return "Hoàn thành";
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Todo": return "status-todo";
      case "InProgress": return "status-progress";
      case "Test": return "status-test";
      case "Done": return "status-done";
      default: return "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="issues-list-page">
      {/* Header */}
      <div className="board-header">
        <div className="board-breadcrumb">
          Dự án <span>/ Issues</span>
        </div>
        <div className="board-header-top">
          <h1 className="board-title">Danh sách Issue</h1>
          <button
            className="board-header-btn"
            onClick={onCreateIssue}
            id="issues-list-create-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo mới
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="issues-filters">
          <div className="filter-group">
            <label className="filter-label">Loại:</label>
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              id="filter-type"
            >
              <option value="">Tất cả</option>
              <option value="Epic">⚡ Epic</option>
              <option value="Story">📖 Story</option>
              <option value="Task">✅ Task</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Trạng thái:</label>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="filter-status"
            >
              <option value="">Tất cả</option>
              <option value="Todo">📋 Cần làm</option>
              <option value="InProgress">🔄 Đang làm</option>
              <option value="Test">🧪 Kiểm thử</option>
              <option value="Done">✅ Hoàn thành</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ưu tiên:</label>
            <select
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              id="filter-priority"
            >
              <option value="">Tất cả</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div className="filter-result-count">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {sortedIssues.length} issue{sortedIssues.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="issues-table-container">
        {loading ? (
          <div className="issues-loading">
            <div className="loading-spinner" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : sortedIssues.length === 0 ? (
          <div className="issues-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p className="issues-empty-title">Chưa có Issue nào</p>
            <p className="issues-empty-desc">Bắt đầu bằng cách tạo Issue đầu tiên</p>
            <button className="btn btn-primary" onClick={onCreateIssue}>
              Tạo Issue mới
            </button>
          </div>
        ) : (
          <table className="issues-table" id="issues-table">
            <thead>
              <tr>
                <th className="th-type" onClick={() => handleSort("type")}>
                  Loại <span className="sort-icon">{getSortIcon("type")}</span>
                </th>
                <th className="th-title" onClick={() => handleSort("title")}>
                  Tiêu đề <span className="sort-icon">{getSortIcon("title")}</span>
                </th>
                <th className="th-status" onClick={() => handleSort("status")}>
                  Trạng thái <span className="sort-icon">{getSortIcon("status")}</span>
                </th>
                <th className="th-priority" onClick={() => handleSort("priority")}>
                  Ưu tiên <span className="sort-icon">{getSortIcon("priority")}</span>
                </th>
                <th className="th-assignee">Người thực hiện</th>
                <th className="th-date" onClick={() => handleSort("createdAt")}>
                  Ngày tạo <span className="sort-icon">{getSortIcon("createdAt")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedIssues.map((issue) => (
                <tr
                  key={issue._id}
                  className="issue-row"
                  onClick={() => setSelectedIssue(issue)}
                  id={`issue-row-${issue._id}`}
                >
                  <td>
                    <span className={`table-type-badge ${issue.type.toLowerCase()}`}>
                      {issue.type === "Epic" ? "⚡" : issue.type === "Story" ? "📖" : "✅"}{" "}
                      {issue.type}
                    </span>
                  </td>
                  <td>
                    <span className="table-title">{issue.title}</span>
                  </td>
                  <td>
                    <span className={`table-status-badge ${getStatusClass(issue.status)}`}>
                      {getStatusLabel(issue.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`table-priority ${issue.priority.toLowerCase()}`}>
                      {issue.priority === "High" ? "🔴" : issue.priority === "Medium" ? "🟡" : "🟢"}{" "}
                      {issue.priority}
                    </span>
                  </td>
                  <td>
                    {issue.assignee ? (
                      <span className="table-assignee">
                        <span className="table-avatar">
                          {issue.assignee.name?.charAt(0).toUpperCase()}
                        </span>
                        {issue.assignee.name}
                      </span>
                    ) : (
                      <span className="table-unassigned">—</span>
                    )}
                  </td>
                  <td>
                    <span className="table-date">{formatDate(issue.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Chi tiết Issue */}
      <IssueDetailModal
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
};

export default IssuesListPage;
