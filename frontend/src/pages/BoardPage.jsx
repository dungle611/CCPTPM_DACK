import { useState, useMemo, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useIssueStore from "../store/useIssueStore";
import useSprintStore from "../store/useSprintStore";
import useUserStore from "../store/useUserStore";
import { getAvatarInitials, getAvatarColor } from "../utils/helpers";
import IssueTypeIcon from "../components/IssueTypeIcon";

const COLUMNS = [
  { key: "Todo", label: "Cần làm", indicator: "todo" },
  { key: "InProgress", label: "Đang làm", indicator: "progress" },
  { key: "Test", label: "Kiểm thử", indicator: "test" },
  { key: "Done", label: "Hoàn thành", indicator: "done" },
];

// Danh mục filter bên trái panel (giống Jira)
const FILTER_CATEGORIES = [
  { key: "assignee", label: "Assignee" },
  { key: "status", label: "Status" },
  { key: "type", label: "Issue (Epic, Story, Task)" },
  { key: "priority", label: "Priority" },
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
              <IssueTypeIcon type={issue.type} size={14} />
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
              <div className="issue-card-avatar" title={issue.assignee.name} style={{ background: getAvatarColor(issue.assignee.name) }}>
                {getAvatarInitials(issue.assignee.name)}
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
  const users = useUserStore((state) => state.users);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchText, setSearchText] = useState("");

  // --- State cho Filter Panel (Story 4.2) ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState("assignee");
  const [filterSearchText, setFilterSearchText] = useState("");
  // Bộ lọc lưu dạng Set để hỗ trợ multi-select
  const [selectedAssignees, setSelectedAssignees] = useState(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());

  const filterPanelRef = useRef(null);

  // Đóng filter panel khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const activeSprintId = issues.find(i => i.sprint && i.sprint.status === "Active")?.sprint?._id || null;

  // Trích xuất danh sách assignee duy nhất từ issues của Active Sprint
  const sprintAssignees = useMemo(() => {
    const assigneeMap = new Map();
    issues.forEach((issue) => {
      if (issue.sprint && issue.sprint._id === activeSprintId && issue.assignee && issue.assignee._id) {
        if (!assigneeMap.has(issue.assignee._id)) {
          assigneeMap.set(issue.assignee._id, issue.assignee);
        }
      }
    });
    return Array.from(assigneeMap.values());
  }, [issues, activeSprintId]);

  // Đếm tổng số filter đang active
  const totalActiveFilters = selectedAssignees.size + selectedStatuses.size + selectedTypes.size + selectedPriorities.size;

  // Lọc issues theo search text + tất cả bộ lọc
  const filteredIssues = useMemo(() => {
    let result = issues;
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(keyword));
    }
    if (selectedAssignees.size > 0) {
      result = result.filter((i) => i.assignee && selectedAssignees.has(i.assignee._id));
    }
    if (selectedStatuses.size > 0) {
      result = result.filter((i) => selectedStatuses.has(i.status));
    }
    if (selectedTypes.size > 0) {
      result = result.filter((i) => selectedTypes.has(i.type));
    }
    if (selectedPriorities.size > 0) {
      result = result.filter((i) => selectedPriorities.has(i.priority));
    }
    return result;
  }, [issues, searchText, selectedAssignees, selectedStatuses, selectedTypes, selectedPriorities]);

  // Toggle checkbox trong filter
  const handleToggleFilter = (category, value) => {
    const setterMap = {
      assignee: setSelectedAssignees,
      status: setSelectedStatuses,
      type: setSelectedTypes,
      priority: setSelectedPriorities,
    };
    const setter = setterMap[category];
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  // Xóa tất cả filter
  const handleClearAllFilters = () => {
    setSelectedAssignees(new Set());
    setSelectedStatuses(new Set());
    setSelectedTypes(new Set());
    setSelectedPriorities(new Set());
  };

  // Đếm filter active cho từng category (hiển thị badge)
  const getFilterCountForCategory = (catKey) => {
    const map = { assignee: selectedAssignees, status: selectedStatuses, type: selectedTypes, priority: selectedPriorities };
    return map[catKey]?.size || 0;
  };

  // Lấy danh sách options cho mỗi category
  const getFilterOptions = (catKey) => {
    switch (catKey) {
      case "assignee":
        return sprintAssignees.map((a) => ({ id: a._id, label: a.name, icon: null }));
      case "status":
        return COLUMNS.map((c) => ({ id: c.key, label: c.label, icon: null }));
      case "type":
        return [
          { id: "Epic", label: "Epic", icon: <IssueTypeIcon type="Epic" size={16} /> },
          { id: "Story", label: "Story", icon: <IssueTypeIcon type="Story" size={16} /> },
          { id: "Task", label: "Task", icon: <IssueTypeIcon type="Task" size={16} /> },
        ];
      case "priority":
        return [
          { id: "High", label: "High", icon: null },
          { id: "Medium", label: "Medium", icon: null },
          { id: "Low", label: "Low", icon: null },
        ];
      default:
        return [];
    }
  };

  const getSelectedSetForCategory = (catKey) => {
    const map = { assignee: selectedAssignees, status: selectedStatuses, type: selectedTypes, priority: selectedPriorities };
    return map[catKey] || new Set();
  };

  // Đếm số issue theo status (chỉ tính Active Sprint, đã lọc)
  const getCountByStatus = (status) => {
    return filteredIssues.filter((i) => i.status === status && i.sprint && i.sprint._id === activeSprintId).length;
  };

  const getIssuesByStatus = (status) => {
    return filteredIssues.filter((i) => i.status === status && i.sprint && i.sprint._id === activeSprintId);
  };

  // Xử lý kéo thả
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (destination.droppableId === source.droppableId) {
      reorderIssues(source.droppableId, source.index, destination.index);
      return;
    }

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
        if (onShowToast) onShowToast({ type: "success", message: `Đã hoàn thành Sprint thành công!` });
      } catch (error) {
        console.error("Lỗi hoàn thành Sprint:", error);
        if (onShowToast) onShowToast({ type: "error", message: `Lỗi: ${error.message}` });
      }
    }
  };

  // Lấy options đã lọc theo search trong filter panel
  const currentFilterOptions = getFilterOptions(activeFilterCategory);
  const filteredFilterOptions = filterSearchText.trim()
    ? currentFilterOptions.filter((opt) => opt.label.toLowerCase().includes(filterSearchText.trim().toLowerCase()))
    : currentFilterOptions;

  return (
    <div className="board-page">
      {/* Header */}
      <div className="board-header">
        <div className="board-breadcrumb">
          Dự án <span>/ Board</span>
        </div>
        <div className="board-header-top">
          <h1 className="board-title">Board</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeSprintId && (
              <button className="sprint-btn primary" onClick={handleCompleteSprint}>
                Complete Sprint
              </button>
            )}
            <button className="board-header-btn" onClick={onCreateIssue} id="board-create-issue-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo mới
            </button>
          </div>
        </div>


        <div className="board-filter-toolbar">
          <div className="board-search-input-wrapper" id="board-search-wrapper">
            <svg className="board-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="board-search-input"
              id="board-search-input"
              placeholder="Tìm kiếm issue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button className="board-search-clear" id="board-search-clear-btn" onClick={() => setSearchText("")} title="Xóa tìm kiếm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {sprintAssignees.length > 0 && (
            <div className="board-avatar-strip" id="board-avatar-strip">
              {sprintAssignees.map((assignee) => (
                <button
                  key={assignee._id}
                  className={`board-avatar-filter ${selectedAssignees.has(assignee._id) ? "active" : ""}`}
                  id={`avatar-filter-${assignee._id}`}
                  onClick={() => handleToggleFilter("assignee", assignee._id)}
                  title={assignee.name}
                  style={{ background: getAvatarColor(assignee.name) }}
                >
                  <span className="board-avatar-filter-initial">
                    {getAvatarInitials(assignee.name)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="jira-filter-container" ref={filterPanelRef}>
            <button
              className={`jira-filter-btn ${totalActiveFilters > 0 ? "has-filters" : ""} ${isFilterOpen ? "open" : ""}`}
              id="jira-filter-btn"
              onClick={() => { setIsFilterOpen(!isFilterOpen); setFilterSearchText(""); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              Filter
              {totalActiveFilters > 0 && (
                <span className="jira-filter-badge">{totalActiveFilters}</span>
              )}
            </button>

            {/* Filter Dropdown Panel */}
            {isFilterOpen && (
              <div className="jira-filter-panel" id="jira-filter-panel">
                {/* Left: Danh mục */}
                <div className="jira-filter-sidebar">
                  {FILTER_CATEGORIES.map((cat) => {
                    const count = getFilterCountForCategory(cat.key);
                    return (
                      <button
                        key={cat.key}
                        className={`jira-filter-cat-btn ${activeFilterCategory === cat.key ? "active" : ""}`}
                        onClick={() => { setActiveFilterCategory(cat.key); setFilterSearchText(""); }}
                      >
                        <span className="jira-filter-cat-label">{cat.label}</span>
                        {count > 0 && <span className="jira-filter-cat-badge">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Options  */}
                <div className="jira-filter-options">
                  {/* Search trong filter */}
                  <div className="jira-filter-options-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder={`Search ${FILTER_CATEGORIES.find(c => c.key === activeFilterCategory)?.label.toLowerCase()}...`}
                      value={filterSearchText}
                      onChange={(e) => setFilterSearchText(e.target.value)}
                      id="jira-filter-search"
                    />
                  </div>

                  {/* Danh sách checkbox */}
                  <div className="jira-filter-options-list">
                    {filteredFilterOptions.length === 0 ? (
                      <div className="jira-filter-empty">Không tìm thấy kết quả</div>
                    ) : (
                      filteredFilterOptions.map((opt) => {
                        const isChecked = getSelectedSetForCategory(activeFilterCategory).has(opt.id);
                        return (
                          <label key={opt.id} className={`jira-filter-option ${isChecked ? "checked" : ""}`} id={`filter-opt-${opt.id}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleFilter(activeFilterCategory, opt.id)}
                            />
                            <span className="jira-filter-checkbox-custom">
                              {isChecked && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                            <span className="jira-filter-option-icon">{opt.icon}</span>
                            <span className="jira-filter-option-label">{opt.label}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nút xóa tất cả filter */}
          {totalActiveFilters > 0 && (
            <button className="board-clear-all-filters" id="board-clear-all-filters" onClick={handleClearAllFilters}>
              Xóa bộ lọc
            </button>
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

