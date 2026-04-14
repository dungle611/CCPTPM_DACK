import { useState, useEffect } from "react";

// Modal xác nhận xóa Issue
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, issue }) => {
  const [loading, setLoading] = useState(false);

  // Reset loading khi đóng modal
  useEffect(() => {
    if (!isOpen) setLoading(false);
  }, [isOpen]);

  if (!isOpen || !issue) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(issue._id);
      onClose();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="delete-confirm-modal">
      <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header delete-header">
          <div className="modal-title">
            <div className="modal-title-icon delete-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            Xóa Issue
          </div>
          <button className="modal-close-btn" onClick={onClose} id="delete-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="delete-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="delete-warning-icon">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="delete-warning-text">
              <p className="delete-warning-title">Bạn có chắc chắn muốn xóa Issue này?</p>
              <p className="delete-warning-desc">Hành động này không thể hoàn tác.</p>
            </div>
          </div>

          <div className="delete-issue-preview">
            <span className={`table-type-badge ${issue.type.toLowerCase()}`}>
              {issue.type === "Epic" ? "⚡" : issue.type === "Story" ? "📖" : "✅"}{" "}
              {issue.type}
            </span>
            <span className="delete-issue-title">{issue.title}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onClose}
            disabled={loading}
            id="delete-cancel-btn"
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={loading}
            id="delete-confirm-btn"
          >
            {loading ? "Đang xóa..." : "Xóa Issue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
