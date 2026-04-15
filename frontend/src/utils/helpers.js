export const getAvatarInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};
