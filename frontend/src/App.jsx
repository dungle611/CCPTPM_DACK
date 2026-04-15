import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BoardPage from "./pages/BoardPage";
import BacklogPage from "./pages/BacklogPage";
import TimelinePage from "./pages/TimelinePage";
import IssuesListPage from "./pages/IssuesListPage";
import CreateIssueModal from "./components/CreateIssueModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import useIssueStore from "./store/useIssueStore";
import useUserStore from "./store/useUserStore";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("board");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [deletingIssue, setDeletingIssue] = useState(null);
  const [toast, setToast] = useState(null);
  const fetchIssues = useIssueStore((state) => state.fetchIssues);
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const removeIssue = useIssueStore((state) => state.removeIssue);

  // Lấy dữ liệu ban đầu khi app load
  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mở modal tạo mới
  const handleCreate = () => {
    setEditingIssue(null);
    setIsCreateModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setIsCreateModalOpen(true);
  };

  // Mở modal xác nhận xóa
  const handleDeleteRequest = (issue) => {
    setDeletingIssue(issue);
  };

  // Xử lý xóa Issue
  const handleDeleteConfirm = async (id) => {
    try {
      await removeIssue(id);
      setToast({ type: "success", message: "Đã xóa Issue thành công! 🗑️" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Có lỗi xảy ra khi xóa Issue!",
      });
      throw error;
    }
  };

  // Đóng modal tạo/sửa
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingIssue(null);
  };

  // Render trang hiện tại
  const renderPage = () => {
    switch (activePage) {
      case "issues":
        return (
          <IssuesListPage
            onCreateIssue={handleCreate}
            onEditIssue={handleEdit}
            onDeleteIssue={handleDeleteRequest}
            onShowToast={setToast}
          />
        );
      case "backlog":
        return (
          <BacklogPage
            onCreateIssue={handleCreate}
            onEditIssue={handleEdit}
            onDeleteIssue={handleDeleteRequest}
            onShowToast={setToast}
          />
        );
      case "timeline":
        return (
          <TimelinePage
            onCreateIssue={handleCreate}
            onEditIssue={handleEdit}
            onDeleteIssue={handleDeleteRequest}
            onShowToast={setToast}
          />
        );
      case "board":
      default:
        return (
          <BoardPage
            onCreateIssue={handleCreate}
            onEditIssue={handleEdit}
            onDeleteIssue={handleDeleteRequest}
            onShowToast={setToast}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        onCreateIssue={handleCreate}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Toast thông báo (cho delete) */}
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

      {/* Modal Tạo / Chỉnh sửa Issue */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        editIssue={editingIssue}
      />

      {/* Modal Xác nhận Xóa */}
      <DeleteConfirmModal
        isOpen={!!deletingIssue}
        onClose={() => setDeletingIssue(null)}
        onConfirm={handleDeleteConfirm}
        issue={deletingIssue}
      />
    </div>
  );
}

export default App;
