import { useState, useEffect } from "react";

// Modal thêm thành viên vào dự án bằng Email
const AddMemberModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form khi mở/đóng modal
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setRole("Member");
      setLoading(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(email.trim(), role);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi thêm thành viên");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="add-member-modal">
      <div className="modal-container add-member-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            Thêm thành viên
          </div>
          <button className="modal-close-btn" onClick={onClose} id="add-member-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Nhập email người dùng..."
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoFocus
                id="add-member-email-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                id="add-member-role-select"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {error && (
              <div className="add-member-error" id="add-member-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
              id="add-member-cancel-btn"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email.trim()}
              id="add-member-submit-btn"
            >
              {loading ? "Đang thêm..." : "Thêm thành viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
