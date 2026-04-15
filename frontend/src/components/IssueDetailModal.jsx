import { useState } from "react";
import useIssueStore from "../store/useIssueStore";
import useProjectStore from "../store/useProjectStore";
import useUserStore from "../store/useUserStore";
import useSprintStore from "../store/useSprintStore";
import { getAvatarInitials } from "../utils/helpers";

const IssueDetailModal = ({ issue, isOpen, onClose }) => {
  if (!isOpen || !issue) return null;

  const typeClass = issue.type.toLowerCase();

  // Format ngày giờ
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#ef4444";
      case "Medium": return "#f59e0b";
      case "Low": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Todo": return "📋 Cần làm";
      case "InProgress": return "🔄 Đang làm";
      case "Test": return "🧪 Kiểm thử";
      case "Done": return "✅ Hoàn thành";
      default: return status;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="issue-detail-modal">
      <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className={`detail-type-badge ${typeClass}`}>
              {issue.type === "Epic" ? "⚡" : issue.type === "Story" ? "📖" : "✅"}
              {issue.type}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="detail-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Tiêu đề */}
          <h2 className="detail-title">{issue.title}</h2>

          {/* Mô tả */}
          <div className="detail-section">
            <div className="detail-section-label">Mô tả</div>
            <div className="detail-description">
              {issue.description || "Không có mô tả."}
            </div>
          </div>

          {/* Thông tin chi tiết - 2 cột */}
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-info-label">Trạng thái</span>
              <span className="detail-status-badge">{getStatusLabel(issue.status)}</span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Độ ưu tiên</span>
              <span className="detail-priority-badge" style={{ color: getPriorityColor(issue.priority) }}>
                {issue.priority === "High" ? "🔴" : issue.priority === "Medium" ? "🟡" : "🟢"}{" "}
                {issue.priority}
              </span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Người thực hiện</span>
              <span className="detail-info-value">
                {issue.assignee ? (
                  <span className="detail-assignee">
                    <span className="detail-avatar-small" title={issue.assignee?.name}>
                      {getAvatarInitials(issue.assignee.name)}
                    </span>
                    {issue.assignee.name}
                  </span>
                ) : (
                  <span className="detail-unassigned">Chưa giao</span>
                )}
              </span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Parent Issue</span>
              <span className="detail-info-value">
                {issue.parentId ? (
                  <span>[{issue.parentId.type}] {issue.parentId.title}</span>
                ) : (
                  <span className="detail-unassigned">Không có</span>
                )}
              </span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Ngày tạo</span>
              <span className="detail-info-value">{formatDate(issue.createdAt)}</span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Cập nhật lần cuối</span>
              <span className="detail-info-value">{formatDate(issue.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
