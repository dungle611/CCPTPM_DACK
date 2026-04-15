import { useState, useEffect, useRef } from "react";
import useIssueStore from "../store/useIssueStore";
import useUserStore from "../store/useUserStore";
import useProjectStore from "../store/useProjectStore";

// Modal dùng chung cho cả Tạo mới và Chỉnh sửa Issue
const CreateIssueModal = ({ isOpen, onClose, editIssue = null }) => {
  const addIssue = useIssueStore((state) => state.addIssue);
  const updateIssue = useIssueStore((state) => state.updateIssue);
  const issues = useIssueStore((state) => state.issues);
  const users = useUserStore((state) => state.users);

  const isEditMode = !!editIssue;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Task",
    status: "Todo",
    priority: "Medium",
    assignee: "",
    parentId: "",
    startDate: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const titleInputRef = useRef(null);

  // Focus vào ô tiêu đề khi modal mở
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load dữ liệu Issue khi mở ở chế độ Edit, reset khi đóng
  useEffect(() => {
    if (isOpen && editIssue) {
      setFormData({
        title: editIssue.title || "",
        description: editIssue.description || "",
        type: editIssue.type || "Task",
        status: editIssue.status || "Todo",
        priority: editIssue.priority || "Medium",
        assignee: editIssue.assignee?._id || editIssue.assignee || "",
        parentId: editIssue.parentId?._id || editIssue.parentId || "",
        startDate: editIssue.startDate ? editIssue.startDate.slice(0, 10) : "",
        dueDate: editIssue.dueDate ? editIssue.dueDate.slice(0, 10) : "",
      });
    } else if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        type: "Task",
        status: "Todo",
        priority: "Medium",
        assignee: "",
        parentId: "",
        startDate: "",
        dueDate: "",
      });
    }
  }, [isOpen, editIssue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({ type: "error", message: "Vui lòng nhập tiêu đề Issue!" });
      titleInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi đi
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
      };

      if (formData.assignee) {
        submitData.assignee = formData.assignee;
      } else {
        submitData.assignee = null;
      }
      if (formData.parentId) {
        submitData.parentId = formData.parentId;
      } else {
        submitData.parentId = null;
      }

      // Gửi startDate / dueDate (dùng cho Timeline)
      if (formData.startDate) {
        submitData.startDate = formData.startDate;
      } else {
        submitData.startDate = null;
      }
      if (formData.dueDate) {
        submitData.dueDate = formData.dueDate;
      } else {
        submitData.dueDate = null;
      }

      if (isEditMode) {
        await updateIssue(editIssue._id, submitData);
        setToast({ type: "success", message: "Cập nhật Issue thành công! ✏️" });
      } else {
        // Gắn Project ID hiện tại
        const currentProject = useProjectStore.getState().currentProject;
        if (currentProject) {
          submitData.project = currentProject._id;
        } else {
          throw new Error("Không xác định được dự án hiện tại!");
        }

        await addIssue(submitData);
        setToast({ type: "success", message: "Tạo Issue thành công! 🎉" });
      }

      // Đóng modal sau khi thành công
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || error?.response?.data?.message || `Có lỗi xảy ra khi ${isEditMode ? "cập nhật" : "tạo"} Issue!`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách parent issues
  const getParentOptions = () => {
    const currentId = editIssue?._id;
    if (formData.type === "Story") {
      return issues.filter((i) => i.type === "Epic" && i._id !== currentId);
    }
    if (formData.type === "Task") {
      return issues.filter((i) => (i.type === "Story" || i.type === "Epic") && i._id !== currentId);
    }
    return [];
  };

  if (!isOpen) return null;

  const parentOptions = getParentOptions();

  return (
    <>
      {/* Toast thông báo */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="modal-overlay" onClick={onClose} id="create-issue-modal">
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <div className={`modal-title-icon ${isEditMode ? "edit-mode" : ""}`}>
                {isEditMode ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </div>
              {isEditMode ? "Chỉnh sửa Issue" : "Tạo Issue mới"}
            </div>
            <button className="modal-close-btn" onClick={onClose} id="modal-close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body - Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Chọn loại Issue */}
              <div className="form-group">
                <label className="form-label">
                  Loại Issue <span className="required">*</span>
                </label>
                <div className="type-selector">
                  {["Epic", "Story", "Task"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`type-option ${formData.type === type ? "selected" : ""} ${type.toLowerCase()}`}
                      onClick={() => handleTypeSelect(type)}
                      id={`type-option-${type.toLowerCase()}`}
                    >
                      <div className={`type-option-icon ${type.toLowerCase()}`}>
                        {type === "Epic" ? "⚡" : type === "Story" ? "📖" : "✅"}
                      </div>
                      <span className="type-option-label">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiêu đề */}
              <div className="form-group">
                <label className="form-label" htmlFor="issue-title">
                  Tiêu đề <span className="required">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  id="issue-title"
                  name="title"
                  className="form-input"
                  placeholder="Nhập tiêu đề Issue..."
                  value={formData.title}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              {/* Mô tả */}
              <div className="form-group">
                <label className="form-label" htmlFor="issue-description">
                  Mô tả
                </label>
                <textarea
                  id="issue-description"
                  name="description"
                  className="form-textarea"
                  placeholder="Nhập mô tả chi tiết cho Issue..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Trạng thái & Độ ưu tiên */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="issue-status">
                    Trạng thái
                  </label>
                  <select
                    id="issue-status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Todo">📋 Todo</option>
                    <option value="InProgress">🔄 In Progress</option>
                    <option value="Test">🧪 Test</option>
                    <option value="Done">✅ Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="issue-priority">
                    Độ ưu tiên
                  </label>
                  <select
                    id="issue-priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
              </div>

              {/* Người thực hiện */}
              <div className="form-group">
                <label className="form-label" htmlFor="issue-assignee">
                  Người thực hiện
                </label>
                <select
                  id="issue-assignee"
                  name="assignee"
                  className="form-select"
                  value={formData.assignee}
                  onChange={handleChange}
                >
                  <option value="">-- Chưa giao --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Issue - chỉ hiện khi type là Story hoặc Task */}
              {parentOptions.length > 0 && (
                <div className="form-group">
                  <label className="form-label" htmlFor="issue-parent">
                    Thuộc về (Parent Issue)
                  </label>
                  <select
                    id="issue-parent"
                    name="parentId"
                    className="form-select"
                    value={formData.parentId}
                    onChange={handleChange}
                  >
                    <option value="">-- Không có --</option>
                    {parentOptions.map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        [{issue.type}] {issue.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ngày bắt đầu & Ngày kết thúc (cho Epic - phục vụ Timeline) */}
              {formData.type === "Epic" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="issue-start-date">
                      📅 Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      id="issue-start-date"
                      name="startDate"
                      className="form-input"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="issue-due-date">
                      📅 Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      id="issue-due-date"
                      name="dueDate"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={onClose}
                id="modal-cancel-btn"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.title.trim()}
                id="modal-submit-btn"
              >
                {loading
                  ? (isEditMode ? "Đang lưu..." : "Đang tạo...")
                  : (isEditMode ? "Lưu thay đổi" : "Tạo Issue")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateIssueModal;
