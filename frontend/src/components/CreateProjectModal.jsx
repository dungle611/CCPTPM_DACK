import { useState } from "react";
import useProjectStore from "../store/useProjectStore";

const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { createNewProject, isLoading } = useProjectStore();

  // Tự động sinh Key từ tên dự án
  const handleNameChange = (value) => {
    setName(value);
    // Auto-generate key: lấy chữ cái đầu mỗi từ, viết hoa, tối đa 5 ký tự
    const autoKey = value
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 5);
    setKey(autoKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !key.trim()) {
      setError("Vui lòng nhập đầy đủ Tên và Mã dự án");
      return;
    }

    try {
      const created = await createNewProject({ name, key, description });
      setName("");
      setKey("");
      setDescription("");
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo dự án");
    }
  };

  const handleClose = () => {
    setName("");
    setKey("");
    setDescription("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container create-project-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            Tạo dự án mới
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Error */}
            {error && (
              <div className="auth-error" style={{ marginBottom: "20px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="project-name">
                Tên dự án <span className="required">*</span>
              </label>
              <input
                id="project-name"
                className="form-input"
                type="text"
                placeholder="VD: Đồ án CCPTPM"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-key">
                Mã dự án (Key) <span className="required">*</span>
              </label>
              <input
                id="project-key"
                className="form-input"
                type="text"
                placeholder="VD: CCPTPM"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
              <span className="modal-field-hint" style={{ fontSize: "12px", color: "#6b778c", marginTop: "6px", display: "block" }}>
                Mã viết tắt, tối đa 10 ký tự. Dùng để đánh mã Issue (VD: CCPTPM-1)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-desc">Mô tả (Tùy chọn)</label>
              <textarea
                id="project-desc"
                className="form-textarea"
                placeholder="Mô tả ngắn gọn về dự án..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="auth-spinner" style={{ width: "16px", height: "16px" }} />
                  Đang tạo...
                </div>
              ) : (
                "Tạo dự án"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
