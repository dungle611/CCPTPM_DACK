import { useState } from "react";
import useProjectStore from "../store/useProjectStore";
import useAuthStore from "../store/useAuthStore";
import AddMemberModal from "../components/AddMemberModal";
import { getAvatarInitials } from "../utils/helpers";

const MembersPage = ({ onShowToast }) => {
  const { currentProject, addMember, updateMemberRole, removeMember } = useProjectStore();
  const { user: currentUser } = useAuthStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const members = currentProject?.members || [];
  const projectId = currentProject?._id;

  // Vai trò của user hiện tại trong dự án này
  const currentMember = members.find(
    (m) => String(m.user?._id || m.user) === String(currentUser?._id)
  );
  const currentRole = currentMember?.role || "";
  const canManage = currentRole === "Owner" || currentRole === "Admin";

  // Lọc thành viên theo tìm kiếm
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (m.user?.name || "").toLowerCase();
    const email = (m.user?.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  // Thêm thành viên
  const handleAddMember = async (email, role) => {
    await addMember(projectId, email, role);
    onShowToast({ type: "success", message: "Đã thêm thành viên thành công! 🎉" });
  };

  // Đổi vai trò
  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(projectId, memberId, newRole);
      onShowToast({ type: "success", message: "Đã cập nhật vai trò thành công!" });
    } catch (error) {
      onShowToast({
        type: "error",
        message: error?.response?.data?.message || "Lỗi khi cập nhật vai trò",
      });
    }
  };

  // Xóa thành viên
  const handleRemoveMember = async (member) => {
    const memberName = member.user?.name || member.user?.email || "thành viên";
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi dự án?`)) return;

    try {
      await removeMember(projectId, member.user?._id || member.user);
      onShowToast({ type: "success", message: `Đã xóa "${memberName}" khỏi dự án! 🗑️` });
    } catch (error) {
      onShowToast({
        type: "error",
        message: error?.response?.data?.message || "Lỗi khi xóa thành viên",
      });
    }
  };

  // Lấy màu nền cho role badge
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Owner": return "role-badge role-owner";
      case "Admin": return "role-badge role-admin";
      default: return "role-badge role-member";
    }
  };

  return (
    <div className="members-page" id="members-page">
      {/* Header */}
      <div className="members-header">
        <div className="members-header-top">
          <div>
            <div className="board-breadcrumb">
              Dự án / <span>{currentProject?.name || "..."}</span>
            </div>
            <h1 className="members-title">Thành viên dự án</h1>
            <p className="members-subtitle">
              Quản lý thành viên và vai trò trong dự án của bạn
            </p>
          </div>
          {canManage && (
            <button
              className="board-header-btn"
              onClick={() => setIsAddModalOpen(true)}
              id="add-member-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Thêm thành viên
            </button>
          )}
        </div>

        {/* Search & Stats */}
        <div className="members-toolbar">
          <div className="members-search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="members-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="members-search-input"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="members-search-input"
            />
            {searchQuery && (
              <button className="members-search-clear" onClick={() => setSearchQuery("")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <div className="members-count">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {filteredMembers.length} / {members.length} thành viên
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="members-table-container">
        {filteredMembers.length > 0 ? (
          <table className="members-table" id="members-table">
            <thead>
              <tr>
                <th className="th-member-name">Thành viên</th>
                <th className="th-member-email">Email</th>
                <th className="th-member-role">Vai trò</th>
                <th className="th-member-joined">Ngày tham gia</th>
                {canManage && <th className="th-member-actions">Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const memberUser = member.user || {};
                const memberId = memberUser._id || member.user;
                const isOwner = member.role === "Owner";
                const isSelf = String(memberId) === String(currentUser?._id);
                // Admin không được đổi role/xóa Owner hoặc Admin khác
                const canEditThisMember = canManage && !isOwner && !(currentRole === "Admin" && member.role === "Admin");

                return (
                  <tr key={memberId} className="member-row" id={`member-row-${memberId}`}>
                    {/* Thành viên */}
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          <span>{getAvatarInitials(memberUser.name)}</span>
                        </div>
                        <div className="member-name-group">
                          <span className="member-name">
                            {memberUser.name || "Không tên"}
                            {isSelf && <span className="member-you-badge">Bạn</span>}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className="member-email">{memberUser.email || "—"}</span>
                    </td>

                    {/* Vai trò */}
                    <td>
                      {canEditThisMember ? (
                        <select
                          className="member-role-select"
                          value={member.role}
                          onChange={(e) => handleRoleChange(memberId, e.target.value)}
                          id={`role-select-${memberId}`}
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        <span className={getRoleBadgeClass(member.role)}>
                          {member.role === "Owner" && "👑 "}
                          {member.role === "Admin" && "🛡️ "}
                          {member.role}
                        </span>
                      )}
                    </td>

                    {/* Ngày tham gia */}
                    <td>
                      <span className="member-date">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </span>
                    </td>

                    {/* Hành động */}
                    {canManage && (
                      <td>
                        {canEditThisMember && !isSelf ? (
                          <button
                            className="member-remove-btn"
                            onClick={() => handleRemoveMember(member)}
                            title="Xóa khỏi dự án"
                            id={`remove-member-${memberId}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="18" y1="11" x2="23" y2="11" />
                            </svg>
                            Xóa
                          </button>
                        ) : isOwner ? (
                          <span className="member-action-note">Chủ sở hữu</span>
                        ) : isSelf ? (
                          <span className="member-action-note">—</span>
                        ) : (
                          <span className="member-action-note">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="members-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div className="issues-empty-title">
              {searchQuery ? "Không tìm thấy thành viên" : "Chưa có thành viên nào"}
            </div>
            <p className="issues-empty-desc">
              {searchQuery
                ? "Hãy thử tìm kiếm với từ khóa khác."
                : "Bắt đầu bằng cách thêm thành viên vào dự án."}
            </p>
          </div>
        )}
      </div>

      {/* Modal Thêm Thành Viên */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
};

export default MembersPage;
