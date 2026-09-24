export const encodePlaylistName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

export const decodePlaylistName = (name: string): string => {
  if (!name) return "";
  return name
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
