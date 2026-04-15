import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useIssueStore from "../store/useIssueStore";
import useSprintStore from "../store/useSprintStore";
import { getAvatarInitials } from "../utils/helpers";

// Component hiển thị Issue theo dạng dòng (Row) trong Backlog
const BacklogIssueRow = ({ issue, index, onEdit, onDelete }) => {
  const typeClass = issue.type.toLowerCase();

  const getPriorityIcon = (priority) => {
    if (priority === "High") {
      return (
        <svg viewBox="0 0 24 24" fit="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    }
    if (priority === "Medium") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  };

  return (
    <Draggable draggableId={issue._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`backlog-issue-row ${snapshot.isDragging ? "is-dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(issue)}
        >
          <div className="backlog-issue-left">
            <div className={`issue-card-type inline ${typeClass}`}>
              {issue.type === "Epic" ? "⚡" : issue.type === "Story" ? "📖" : "✅"}
            </div>
            <span className="backlog-issue-key">{issue._id.substring(issue._id.length - 4).toUpperCase()}</span>
            <span className="backlog-issue-title">{issue.title}</span>
          </div>
          <div className="backlog-issue-right">
            <div className={`issue-card-priority ${issue.priority.toLowerCase()}`}>
              {getPriorityIcon(issue.priority)}
            </div>
            {issue.assignee && (
              <div className="backlog-issue-avatar" title={issue.assignee.name}>
                {getAvatarInitials(issue.assignee.name)}
              </div>
            )}
            <span className={`backlog-issue-status tag-${issue.status.toLowerCase()}`}>
              {issue.status === "Todo" ? "Cần làm" : issue.status === "InProgress" ? "Đang làm" : issue.status === "Test" ? "Kiểm thử" : "Hoàn thành"}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Component trang Backlog
const BacklogPage = ({ onCreateIssue, onEditIssue, onDeleteIssue, onShowToast }) => {
  const { issues, assignSprint, reorderIssues, addIssue } = useIssueStore();
  const { sprints, fetchSprints, addSprint, updateSprint, getActiveSprint } = useSprintStore();

  const [quickCreateText, setQuickCreateText] = useState("");
  const [activeQuickCreateTarget, setActiveQuickCreateTarget] = useState(null); // 'backlog' or sprintId

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const activeSprintInfo = getActiveSprint();

  // Nhóm Issue: Lấy danh sách các thẻ của Sprint X
  const getIssuesForSprint = (sprintId) => {
    return issues.filter((i) => i.sprint && (i.sprint._id === sprintId || i.sprint === sprintId));
  };

  // Group Backlog: Lấy danh sách thẻ KHÔNG CÓ Sprint
  const getBacklogIssues = () => {
    return issues.filter((i) => !i.sprint || i.sprint === "null");
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Kéo trong cùng 1 rổ (sprint -> sprint, backlog -> backlog)
    if (destination.droppableId === source.droppableId) {
      // destination.droppableId ở đây là sprintId hoặc chuỗi "backlog"
      reorderIssues(source.droppableId, source.index, destination.index, false);
      return;
    }

    // Kéo khác rổ (VD Backlog -> Sprint 1)
    try {
      await assignSprint(draggableId, destination.droppableId);
    } catch (error) {
      console.error("Lỗi gán sprint:", error);
    }
  };

  const handleStartSprint = async (sprint) => {
    if (activeSprintInfo) {
      alert("Đã có một Sprint đang chạy. Hãy hoàn thành nó trước!");
      return;
    }
    await updateSprint(sprint._id, { status: "Active" });
    if (onShowToast) onShowToast({ type: "success", message: `Đã bắt đầu ${sprint.name}!` });
  };

  const handleCompleteSprint = async (sprint) => {
    if (window.confirm(`Bạn có chắc muốn đóng ${sprint.name}?`)) {
      await updateSprint(sprint._id, { status: "Closed" });
      if (onShowToast) onShowToast({ type: "success", message: `Đã hoàn thành ${sprint.name} tuyệt vời!` });
    }
  };

  const handleQuickCreate = async (e, sprintId) => {
    if (e.key === 'Enter' && quickCreateText.trim()) {
      const isBacklog = sprintId === "backlog";
      const newIssue = {
        title: quickCreateText.trim(),
        type: "Task",
        priority: "Medium",
        status: "Todo",
        sprint: isBacklog ? null : sprintId
      };

      try {
        await addIssue(newIssue);
        setQuickCreateText("");
        setActiveQuickCreateTarget(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="backlog-page">
      <div className="board-header">
        <div className="board-breadcrumb">Dự án <span>/ Backlog</span></div>
        <div className="board-header-top">
          <h1 className="board-title">Backlog Khởi tạo dự án</h1>
          <button className="board-header-btn" onClick={() => addSprint()}>
            Tạo Sprint
          </button>
        </div>
      </div>

      <div className="backlog-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Lặp qua các Sprints */}
          {sprints.filter(s => s.status !== "Closed").map(sprint => {
            const sprintIssues = getIssuesForSprint(sprint._id);

            return (
              <div key={sprint._id} className="sprint-box">
                <div className="sprint-header">
                  <div>
                    <h3 className="sprint-title">{sprint.name} {sprint.status === "Active" && <span className="active-badge">ACTIVE</span>}</h3>
                    <p className="sprint-meta">{sprintIssues.length} issues</p>
                  </div>
                  <div>
                    {sprint.status === "Future" ? (
                      <button className="sprint-btn secondary" onClick={() => handleStartSprint(sprint)} disabled={sprintIssues.length === 0}>
                        Start Sprint
                      </button>
                    ) : sprint.status === "Active" ? (
                      <button className="sprint-btn primary" onClick={() => handleCompleteSprint(sprint)}>
                        Complete Sprint
                      </button>
                    ) : null}
                  </div>
                </div>

                <Droppable droppableId={sprint._id}>
                  {(provided, snapshot) => (
                    <div
                      className={`sprint-droppable ${snapshot.isDraggingOver ? "drag-over" : ""} ${sprintIssues.length === 0 ? "empty" : ""}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {sprintIssues.length === 0 && !snapshot.isDraggingOver && (
                        <div className="sprint-empty-msg">Thả các issue vào đây để lên kế hoạch cho sprint.</div>
                      )}

                      {sprintIssues.map((issue, index) => (
                        <BacklogIssueRow
                          key={issue._id}
                          issue={issue}
                          index={index}
                          onEdit={onEditIssue}
                        />
                      ))}
                      {provided.placeholder}

                      {/* Quick Create cho Sprint */}
                      {activeQuickCreateTarget === sprint._id ? (
                        <input
                          type="text"
                          autoFocus
                          className="quick-create-input"
                          placeholder="Kế hoạch gì cần làm... (nhấn Enter)"
                          value={quickCreateText}
                          onChange={(e) => setQuickCreateText(e.target.value)}
                          onKeyDown={(e) => handleQuickCreate(e, sprint._id)}
                          onBlur={() => setActiveQuickCreateTarget(null)}
                        />
                      ) : (
                        <div className="quick-create-btn" onClick={() => setActiveQuickCreateTarget(sprint._id)}>
                          <span>+</span> Tạo issue
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}

          {/* KHU VỰC BACKLOG DƯỚI CÙNG */}
          <div className="sprint-box backlog-bottom-box">
            <div className="sprint-header backlog-header">
              <h3 className="sprint-title">Backlog</h3>
              <p className="sprint-meta">{getBacklogIssues().length} issues</p>
            </div>

            <Droppable droppableId="backlog">
              {(provided, snapshot) => (
                <div
                  className={`sprint-droppable backlog-droppable ${snapshot.isDraggingOver ? "drag-over" : ""} ${getBacklogIssues().length === 0 ? "empty" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {getBacklogIssues().length === 0 && !snapshot.isDraggingOver && (
                    <div className="sprint-empty-msg">Tất cả issue đã nằm trong sprint.</div>
                  )}

                  {getBacklogIssues().map((issue, index) => (
                    <BacklogIssueRow
                      key={issue._id}
                      issue={issue}
                      index={index}
                      onEdit={onEditIssue}
                    />
                  ))}
                  {provided.placeholder}

                  {/* Quick Create cho Backlog */}
                  {activeQuickCreateTarget === "backlog" ? (
                    <input
                      type="text"
                      autoFocus
                      className="quick-create-input"
                      placeholder="Có ý tưởng gì... (nhấn Enter)"
                      value={quickCreateText}
                      onChange={(e) => setQuickCreateText(e.target.value)}
                      onKeyDown={(e) => handleQuickCreate(e, "backlog")}
                      onBlur={() => setActiveQuickCreateTarget(null)}
                    />
                  ) : (
                    <div className="quick-create-btn" onClick={() => setActiveQuickCreateTarget("backlog")}>
                      <span>+</span> Tạo issue
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

        </DragDropContext>
      </div>
    </div>
  );
};

export default BacklogPage;
