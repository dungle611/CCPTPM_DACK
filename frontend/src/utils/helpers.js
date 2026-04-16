export const getAvatarInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Bảng màu avatar đa sắc chuẩn Jira
const AVATAR_COLORS = [
  "linear-gradient(135deg, #0052CC, #4C9AFF)",  // Xanh dương Jira
  "linear-gradient(135deg, #6554C0, #8777D9)",  // Tím (Epic)
  "linear-gradient(135deg, #00875A, #36B37E)",  // Xanh lá đậm
  "linear-gradient(135deg, #FF5630, #FF8F73)",  // Đỏ cam
  "linear-gradient(135deg, #FF991F, #FFC400)",  // Vàng cam
  "linear-gradient(135deg, #00B8D9, #79E2F2)",  // Xanh ngọc
  "linear-gradient(135deg, #5243AA, #8777D9)",  // Tím đậm
  "linear-gradient(135deg, #0065FF, #2684FF)",  // Xanh đậm
];


export const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
