import { useState, useMemo, useEffect, useRef } from "react";
import useIssueStore from "../store/useIssueStore";
import useSprintStore from "../store/useSprintStore";
import useUserStore from "../store/useUserStore";

// Helpers tính toán ngày
const DAY_WIDTH = 40; // px mỗi ngày

const daysBetween = (a, b) => {
  const msPerDay = 86400000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
};

const formatMonth = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
};

const getStatusBadge = (status) => {
  const map = {
    Todo: { label: "TO DO", cls: "todo" },
    InProgress: { label: "IN PROGRESS", cls: "inprogress" },
    Test: { label: "TEST", cls: "test" },
    Done: { label: "DONE", cls: "done" },
  };
  return map[status] || map.Todo;
};

const getTypeIcon = (type) => {
  if (type === "Epic") return "⚡";
  if (type === "Story") return "📖";
  return "✅";
};

const TimelinePage = ({ onCreateIssue, onEditIssue, onDeleteIssue, onShowToast }) => {
  const issues = useIssueStore((state) => state.issues);
  const addIssue = useIssueStore((state) => state.addIssue);
  const sprints = useSprintStore((state) => state.sprints);
  const fetchSprints = useSprintStore((state) => state.fetchSprints);
  const users = useUserStore((state) => state.users);

  const [expandedEpics, setExpandedEpics] = useState(new Set());
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [inlineTitle, setInlineTitle] = useState("");
  const inlineInputRef = useRef(null);

  // Ghost bar state (hover trên gantt row)
  const [ghostBar, setGhostBar] = useState(null); // { issueId, left }
  const updateIssue = useIssueStore((state) => state.updateIssue);

  // Drag resize state
  const [dragState, setDragState] = useState(null);
  // { issueId, edge: 'left'|'right', origStart, origEnd, currentStart, currentEnd }

  // Lấy Epics và children
  const epics = useMemo(() => issues.filter((i) => i.type === "Epic"), [issues]);

  const getChildren = (epicId) => {
    return issues.filter((i) => {
      const pid = i.parentId?._id || i.parentId;
      return pid === epicId;
    });
  };

  // Tính phạm vi timeline (earliest -> latest)
  const timelineRange = useMemo(() => {
    let minDate = new Date();
    let maxDate = new Date();

    // Từ Sprints
    sprints.forEach((s) => {
      if (s.startDate && new Date(s.startDate) < minDate) minDate = new Date(s.startDate);
      if (s.endDate && new Date(s.endDate) > maxDate) maxDate = new Date(s.endDate);
    });

    // Từ Epic dates
    epics.forEach((e) => {
      if (e.startDate && new Date(e.startDate) < minDate) minDate = new Date(e.startDate);
      if (e.dueDate && new Date(e.dueDate) > maxDate) maxDate = new Date(e.dueDate);
    });

    // Thêm padding 7 ngày mỗi bên
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    return { start: new Date(minDate), end: new Date(maxDate) };
  }, [sprints, epics]);

  // Global mouse listeners for drag resize
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e) => {
      const ganttEl = document.querySelector('.timeline-gantt');
      if (!ganttEl) return;
      const rect = ganttEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + ganttEl.parentElement.scrollLeft;
      const dayIndex = Math.floor(mouseX / DAY_WIDTH);
      const hoveredDate = new Date(timelineRange.start);
      hoveredDate.setDate(hoveredDate.getDate() + dayIndex);

      setDragState((prev) => {
        if (!prev) return prev;
        if (prev.edge === 'left') {
          // Điều chỉnh startDate, không vượt qua endDate
          if (hoveredDate >= prev.currentEnd) return prev;
          return { ...prev, currentStart: hoveredDate };
        } else {
          // Điều chỉnh dueDate, không vượt qua startDate
          const newEnd = new Date(hoveredDate);
          newEnd.setDate(newEnd.getDate() + 1); // Snap to end of day
          if (newEnd <= prev.currentStart) return prev;
          return { ...prev, currentEnd: newEnd };
        }
      });
    };

    const handleMouseUp = async () => {
      if (dragState) {
        try {
          await updateIssue(dragState.issueId, {
            startDate: dragState.currentStart.toISOString(),
            dueDate: dragState.currentEnd.toISOString(),
          });
        } catch (err) {
          if (onShowToast) onShowToast({ type: 'error', message: 'Lỗi khi cập nhật ngày!' });
        }
      }
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, timelineRange, updateIssue, onShowToast]);

  // Hàm bắt đầu kéo
  const handleResizeStart = (e, issue, edge) => {
    e.stopPropagation();
    e.preventDefault();
    setDragState({
      issueId: issue._id,
      edge,
      origStart: new Date(issue.startDate),
      origEnd: new Date(issue.dueDate),
      currentStart: new Date(issue.startDate),
      currentEnd: new Date(issue.dueDate),
    });
  };

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  // Tính progress cho Epic (Done / total children)
  const getEpicProgress = (epicId) => {
    const children = getChildren(epicId);
    if (children.length === 0) return 0;
    const done = children.filter((c) => c.status === "Done").length;
    return Math.round((done / children.length) * 100);
  };

  // Toggle mở rộng
  const toggleEpic = (epicId) => {
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) next.delete(epicId);
      else next.add(epicId);
      return next;
    });
  };

  // Inline create Epic
  const handleStartInlineCreate = () => {
    setIsInlineCreating(true);
    setInlineTitle("");
    setTimeout(() => inlineInputRef.current?.focus(), 50);
  };

  const handleInlineSubmit = async () => {
    if (!inlineTitle.trim()) {
      setIsInlineCreating(false);
      return;
    }
    try {
      await addIssue({ title: inlineTitle.trim(), type: "Epic" });
      setInlineTitle("");
      if (onShowToast) onShowToast({ type: "success", message: "Tạo Epic thành công! ⚡" });
    } catch (err) {
      if (onShowToast) onShowToast({ type: "error", message: "Lỗi khi tạo Epic!" });
    }
    setIsInlineCreating(false);
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInlineSubmit();
    } else if (e.key === "Escape") {
      setIsInlineCreating(false);
    }
  };


  const totalDays = daysBetween(timelineRange.start, timelineRange.end);

  // Tạo mảng ngày để render header
  const dateColumns = useMemo(() => {
    const cols = [];
    const current = new Date(timelineRange.start);
    for (let i = 0; i < totalDays; i++) {
      cols.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return cols;
  }, [timelineRange, totalDays]);

  // Nhóm ngày theo tháng
  const monthGroups = useMemo(() => {
    const groups = [];
    let currentMonth = "";
    dateColumns.forEach((d, i) => {
      const monthKey = formatMonth(d);
      if (monthKey !== currentMonth) {
        groups.push({ label: monthKey, startIndex: i, count: 1 });
        currentMonth = monthKey;
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [dateColumns]);

  // Tính vị trí bar cho issue/sprint
  const getBarStyle = (start, end) => {
    if (!start || !end) return null;
    const startDay = daysBetween(timelineRange.start, start);
    const duration = daysBetween(start, end);
    if (duration <= 0) return null;
    return {
      left: `${startDay * DAY_WIDTH}px`,
      width: `${Math.max(duration, 1) * DAY_WIDTH}px`,
    };
  };

  // Hàng ngày hôm nay
  const todayOffset = daysBetween(timelineRange.start, new Date());

  // Tạo danh sách rows để render (Epic + children nếu đang expand)
  const rows = useMemo(() => {
    const result = [];
    epics.forEach((epic) => {
      result.push({ type: "epic", issue: epic, depth: 0 });
      if (expandedEpics.has(epic._id)) {
        const children = getChildren(epic._id);
        children.forEach((child) => {
          result.push({ type: "child", issue: child, depth: 1 });
        });
      }
    });
    return result;
  }, [epics, expandedEpics, issues]);

  return (
    <div className="timeline-page">
      {/* Header */}
      <div className="timeline-header">
        <div className="board-breadcrumb">
          Dự án <span>/ Timeline</span>
        </div>
        <div className="board-header-top">
          <h1 className="board-title">Timeline</h1>
          <button className="board-header-btn" onClick={onCreateIssue} id="timeline-create-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo mới
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="timeline-container">
        {/* ===== Left: Work List ===== */}
        <div className="timeline-work-list">
          {/* Work List Header */}
          <div className="timeline-work-header">
            <span>Work</span>
          </div>

          {/* Sprint row placeholder */}
          <div className="timeline-work-row sprint-row">
            <span className="timeline-sprint-label">Sprints</span>
          </div>

          {/* Issue Rows */}
          {rows.map((row) => {
            const { issue, depth } = row;
            const isEpic = row.type === "epic";
            const isExpanded = expandedEpics.has(issue._id);
            const childCount = isEpic ? getChildren(issue._id).length : 0;
            const progress = isEpic ? getEpicProgress(issue._id) : 0;
            const badge = getStatusBadge(issue.status);

            return (
              <div
                key={issue._id}
                className={`timeline-work-row ${isEpic ? "epic-row" : "child-row"}`}
                style={{ paddingLeft: `${16 + depth * 28}px` }}
                id={`tl-work-${issue._id}`}
              >
                {/* Toggle cho Epic */}
                {isEpic ? (
                  <button className="tl-toggle-btn" onClick={() => toggleEpic(issue._id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : (
                  <span className="tl-toggle-spacer" />
                )}

                {/* Type icon */}
                <span className={`tl-type-icon ${issue.type.toLowerCase()}`}>
                  {getTypeIcon(issue.type)}
                </span>

                {/* Title */}
                <span className="tl-issue-title" title={issue.title}>
                  {issue.title}
                </span>

                {/* Progress bar cho Epic */}
                {isEpic && childCount > 0 && (
                  <div className="tl-epic-progress">
                    <div className="tl-epic-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}

                {/* Status badge */}
                <span className={`tl-status-badge ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}

          {/* Create Epic - inline input (giống Jira) */}
          {isInlineCreating ? (
            <div className="tl-inline-create" id="tl-inline-create">
              <span className="tl-type-icon epic">⚡</span>
              <input
                ref={inlineInputRef}
                type="text"
                className="tl-inline-input"
                placeholder="What needs to be done?"
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onKeyDown={handleInlineKeyDown}
                onBlur={handleInlineSubmit}
                id="tl-inline-input"
              />
              <span className="tl-inline-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
          ) : (
            <button className="tl-create-epic-btn" onClick={handleStartInlineCreate} id="tl-create-epic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Epic
            </button>
          )}
        </div>

        {/* ===== Right: Gantt Chart ===== */}
        <div className="timeline-gantt-wrapper">
          <div className="timeline-gantt" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
            {/* Month header */}
            <div className="gantt-month-header">
              {monthGroups.map((mg, i) => (
                <div
                  key={i}
                  className="gantt-month-cell"
                  style={{ width: `${mg.count * DAY_WIDTH}px` }}
                >
                  {mg.label}
                </div>
              ))}
            </div>

            {/* Day header */}
            <div className="gantt-day-header">
              {dateColumns.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`gantt-day-cell ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""}`}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Sprint Track */}
            <div className="gantt-row sprint-track">
              <div className="gantt-row-bg">
                {dateColumns.map((d, i) => (
                  <div key={i} className={`gantt-grid-cell ${d.getDay() === 0 || d.getDay() === 6 ? "weekend" : ""}`} style={{ width: `${DAY_WIDTH}px` }} />
                ))}
              </div>
              {sprints.map((sprint) => {
                const barStyle = getBarStyle(sprint.startDate, sprint.endDate);
                if (!barStyle) return null;
                return (
                  <div
                    key={sprint._id}
                    className={`gantt-sprint-pill ${sprint.status === "Active" ? "active" : sprint.status === "Closed" ? "closed" : ""}`}
                    style={barStyle}
                    title={`${sprint.name} (${sprint.status})`}
                  >
                    {sprint.name}
                  </div>
                );
              })}
            </div>

            {/* Issue Rows */}
            {rows.map((row) => {
              const { issue } = row;
              const isEpic = row.type === "epic";

              // Tính bar: Epic dùng startDate/dueDate, child dùng sprint dates
              let barStyle = null;
              if (isEpic) {
                barStyle = getBarStyle(issue.startDate, issue.dueDate);
              } else {
                // Child: lấy ngày từ Sprint
                const sprint = issue.sprint;
                if (sprint && sprint.startDate && sprint.endDate) {
                  barStyle = getBarStyle(sprint.startDate, sprint.endDate);
                }
              }

              // Nếu đang drag bar này, dùng dragState để tính lại vị trí (live preview)
              let finalBarStyle = barStyle;
              if (barStyle && dragState && dragState.issueId === issue._id) {
                finalBarStyle = getBarStyle(dragState.currentStart, dragState.currentEnd) || barStyle;
              }

              return (
                <div
                  key={issue._id}
                  className={`gantt-row ${isEpic ? "epic" : "child"}`}
                  onMouseMove={(e) => {
                    if (barStyle || !isEpic) return; // Chỉ show ghost khi Epic chưa có bar
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    setGhostBar({ issueId: issue._id, left: offsetX });
                  }}
                  onMouseLeave={() => {
                    if (ghostBar?.issueId === issue._id) setGhostBar(null);
                  }}
                  onClick={async (e) => {
                    if (barStyle || !isEpic) return; // Chỉ cho phép click khi chưa có bar
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const dayIndex = Math.floor(offsetX / DAY_WIDTH);
                    const clickedDate = new Date(timelineRange.start);
                    clickedDate.setDate(clickedDate.getDate() + dayIndex);
                    const endDate = new Date(clickedDate);
                    endDate.setDate(endDate.getDate() + 7);
                    try {
                      await updateIssue(issue._id, {
                        startDate: clickedDate.toISOString(),
                        dueDate: endDate.toISOString(),
                      });
                      setGhostBar(null);
                      if (onShowToast) onShowToast({ type: "success", message: `\u0110\u00e3 set Timeline cho "${issue.title}" \u2705` });
                    } catch (err) {
                      if (onShowToast) onShowToast({ type: "error", message: "L\u1ed7i khi c\u1eadp nh\u1eadt ng\u00e0y!" });
                    }
                  }}
                  style={{ cursor: !barStyle && isEpic ? "pointer" : "default" }}
                >
                  {/* Grid background */}
                  <div className="gantt-row-bg">
                    {dateColumns.map((d, i) => (
                      <div key={i} className={`gantt-grid-cell ${d.getDay() === 0 || d.getDay() === 6 ? "weekend" : ""}`} style={{ width: `${DAY_WIDTH}px` }} />
                    ))}
                  </div>

                  {/* Ghost bar khi hover */}
                  {!barStyle && isEpic && ghostBar?.issueId === issue._id && (
                    <div
                      className="gantt-bar ghost-bar"
                      style={{
                        left: `${Math.floor(ghostBar.left / DAY_WIDTH) * DAY_WIDTH}px`,
                        width: `${7 * DAY_WIDTH}px`,
                      }}
                    >
                      <span className="gantt-bar-label">{issue.title}</span>
                    </div>
                  )}

                  {/* Bar thật */}
                  {finalBarStyle && (
                    <div
                      className={`gantt-bar ${isEpic ? "epic-bar" : "child-bar"} ${dragState?.issueId === issue._id ? "dragging" : ""}`}
                      style={finalBarStyle}
                      title={issue.title}
                      onClick={(e) => { e.stopPropagation(); onEditIssue(issue); }}
                    >
                      {/* Left drag handle */}
                      {isEpic && issue.startDate && (
                        <div
                          className="gantt-bar-handle left"
                          onMouseDown={(e) => handleResizeStart(e, issue, 'left')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <span className="gantt-bar-label">{issue.title}</span>
                      {/* Right drag handle */}
                      {isEpic && issue.dueDate && (
                        <div
                          className="gantt-bar-handle right"
                          onMouseDown={(e) => handleResizeStart(e, issue, 'right')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div
                className="gantt-today-line"
                style={{ left: `${todayOffset * DAY_WIDTH + DAY_WIDTH / 2}px` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
