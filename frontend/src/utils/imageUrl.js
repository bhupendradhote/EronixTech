const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "/images/product-placeholder.png";
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  return `${API_URL}/${imagePath.replace(/^\/+/, "")}`;
};