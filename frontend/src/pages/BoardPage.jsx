import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useIssueStore from "../store/useIssueStore";
import useSprintStore from "../store/useSprintStore";

const COLUMNS = [
  { key: "Todo", label: "Cần làm", indicator: "todo" },
  { key: "InProgress", label: "Đang làm", indicator: "progress" },
  { key: "Test", label: "Kiểm thử", indicator: "test" },
  { key: "Done", label: "Hoàn thành", indicator: "done" },
];

// Component hiển thị từng Issue card
const IssueCard = ({ issue, onEdit, onDelete, index }) => {
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
    <Draggable draggableId={issue._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`issue-card ${snapshot.isDragging ? "is-dragging" : ""}`}
          id={`issue-card-${issue._id}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
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
      )}
    </Draggable>
  );
};

// Component trang Board chính
const BoardPage = ({ onCreateIssue, onEditIssue, onDeleteIssue, onShowToast }) => {
  const issues = useIssueStore((state) => state.issues);
  const loading = useIssueStore((state) => state.loading);
  const moveIssue = useIssueStore((state) => state.moveIssue);
  const reorderIssues = useIssueStore((state) => state.reorderIssues);
  const updateSprint = useSprintStore((state) => state.updateSprint);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchText, setSearchText] = useState("");


  const activeSprintId = issues.find(i => i.sprint && i.sprint.status === "Active")?.sprint?._id || null;

  // Lọc issues theo từ khóa tìm kiếm (filter by title)
  const filteredIssues = useMemo(() => {
    if (!searchText.trim()) return issues;
    const keyword = searchText.trim().toLowerCase();
    return issues.filter((i) => i.title.toLowerCase().includes(keyword));
  }, [issues, searchText]);

  // Đếm số issue theo status (chỉ tính Active Sprint, đã lọc theo search)
  const getCountByStatus = (status) => {
    return filteredIssues.filter((i) => i.status === status && i.sprint && i.sprint._id === activeSprintId).length;
  };

  // Lấy issues theo status (chỉ tính Active Sprint, đã lọc theo search)
  const getIssuesByStatus = (status) => {
    return filteredIssues.filter((i) => i.status === status && i.sprint && i.sprint._id === activeSprintId);
  };

  // Xử lý sự kiện khi kéo thả xong
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Nếu thả ra ngoài vùng hợp lệ
    if (!destination) return;

    // Nếu thả lại đúng vị trí cũ → không làm gì
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // **Trường hợp 1: Kéo trong cùng 1 cột (đổi thứ tự)**
    if (destination.droppableId === source.droppableId) {
      reorderIssues(source.droppableId, source.index, destination.index);
      return;
    }

    // **Trường hợp 2: Kéo sang cột khác (đổi status)**
    const newStatus = destination.droppableId;
    setUpdatingId(draggableId);
    try {
      await moveIssue(draggableId, newStatus);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteSprint = async () => {
    if (activeSprintId && window.confirm("Bạn có chắc chắn muốn hoàn thành Sprint này?")) {
      try {
        await updateSprint(activeSprintId, { status: "Closed" });
        if (onShowToast) {
          onShowToast({ type: "success", message: `Đã hoàn thành Sprint thành công!` });
        }
      } catch (error) {
        console.error("Lỗi hoàn thành Sprint:", error);
        if (onShowToast) {
          onShowToast({ type: "error", message: `Lỗi: ${error.message}` });
        }
      }
    }
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
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeSprintId && (
              <button
                className="sprint-btn primary"
                onClick={handleCompleteSprint}
              >
                Complete Sprint
              </button>
            )}
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
        </div>

        {/* Search Input Box - Story 4.1 */}
        <div className="board-search-bar">
          <div className="board-search-input-wrapper" id="board-search-wrapper">
            <svg className="board-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="board-search-input"
              id="board-search-input"
              placeholder="Tìm kiếm issue theo tiêu đề..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                className="board-search-clear"
                id="board-search-clear-btn"
                onClick={() => setSearchText("")}
                title="Xóa tìm kiếm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {searchText && (
            <span className="board-search-result-count">
              Tìm thấy {filteredIssues.filter(i => i.sprint && i.sprint._id === activeSprintId).length} kết quả
            </span>
          )}
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

      {!activeSprintId ? (
        <div className="no-active-sprint">
          <h2>Chuẩn bị bắt tay vào việc!</h2>
          <p>Hiện chưa có Sprint nào đang chạy (Active). Vui lòng chuyển sang thẻ Backlog để lên kế hoạch và Start một Sprint.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
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

                  {/* Droppable: Vùng thả cho mỗi cột */}
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        className={`board-column-cards ${snapshot.isDraggingOver ? "drag-over" : ""}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {loading ? (
                          <div className="column-empty">
                            <p>Đang tải...</p>
                          </div>
                        ) : colIssues.length === 0 && !snapshot.isDraggingOver ? (
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
                          colIssues.map((issue, index) => (
                            <IssueCard
                              key={issue._id}
                              issue={issue}
                              index={index}
                              onEdit={onEditIssue}
                              onDelete={onDeleteIssue}
                            />
                          ))
                        )}
                        {/* Placeholder giữ chỗ khi kéo */}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default BoardPage;
