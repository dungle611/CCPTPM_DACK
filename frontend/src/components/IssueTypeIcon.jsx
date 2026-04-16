const IssueTypeIcon = ({ type, size = 16 }) => {
  const style = { width: size, height: size, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' };

  switch (type) {
    case "Epic":
      // Jira Epic: tia sét trên nền tím
      return (
        <span className="jira-icon jira-icon-epic" style={style} title="Epic">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <rect width="16" height="16" rx="3" fill="#6554C0" />
            <path d="M9 2.5L4.5 9H7.5L6.5 13.5L11.5 7H8.5L9 2.5Z" fill="white" />
          </svg>
        </span>
      );

    case "Story":
      // Jira Story: bookmark xanh lá
      return (
        <span className="jira-icon jira-icon-story" style={style} title="Story">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <rect width="16" height="16" rx="3" fill="#36B37E" />
            <rect x="5" y="3" width="6" height="10" rx="0.5" fill="white" />
          </svg>
        </span>
      );

    case "Task":
      // Jira Task: checkbox xanh dương  
      return (
        <span className="jira-icon jira-icon-task" style={style} title="Task">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <rect width="16" height="16" rx="3" fill="#4C9AFF" />
            <path d="M6.5 10.5L4.5 8.5L3.5 9.5L6.5 12.5L12.5 6.5L11.5 5.5L6.5 10.5Z" fill="white" />
          </svg>
        </span>
      );

    case "Bug":
      // Jira Bug: vòng tròn đỏ
      return (
        <span className="jira-icon jira-icon-bug" style={style} title="Bug">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <rect width="16" height="16" rx="3" fill="#FF5630" />
            <circle cx="8" cy="8" r="3.5" fill="white" />
          </svg>
        </span>
      );

    default:
      return (
        <span className="jira-icon jira-icon-default" style={style} title={type}>
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <rect width="16" height="16" rx="3" fill="#97A0AF" />
            <circle cx="8" cy="8" r="3" fill="white" />
          </svg>
        </span>
      );
  }
};

export default IssueTypeIcon;
