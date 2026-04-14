import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BoardPage from "./pages/BoardPage";
import CreateIssueModal from "./components/CreateIssueModal";
import useIssueStore from "./store/useIssueStore";
import useUserStore from "./store/useUserStore";
import "./App.css";

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fetchIssues = useIssueStore((state) => state.fetchIssues);
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  // Lấy dữ liệu ban đầu khi app load
  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, [fetchIssues, fetchUsers]);

  return (
    <div className="app-layout">
      <Sidebar onCreateIssue={() => setIsCreateModalOpen(true)} />
      <main className="main-content">
        <BoardPage onCreateIssue={() => setIsCreateModalOpen(true)} />
      </main>

      {/* Modal Tạo Issue */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default App;
