/**
 * Provides fallback image URLs and handles image loading errors
 */

/**
 * Get a placeholder image URL if the actual image doesn't exist
 * @param {string} imagePath - The path to the actual image
 * @param {string} text - The text to display on the placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} URL to placeholder image
 */
export function getPlaceholderImage(
  imagePath,
  text,
  width = 300,
  height = 300
) {
  // In production, return the actual image path
  if (process.env.NODE_ENV === "production") {
    return imagePath;
  }

  // In development, use local SVG placeholders
  const svgPath = imagePath.replace(/\.(png|jpg|jpeg|gif)$/, ".svg");
  return svgPath;
}

/**
 * Error handler for image loading failures
 * @param {Event} event - The error event object
 */
export function handleImageError(event) {
  const element = event.target;
  const alt = element.alt || "Image";
  const width = element.width || 300;
  const height = element.height || 300;

  // Get original src for error logging
  const originalSrc = element.src;

  // Create a simple colored box with text as data URL fallback
  // This ensures we can always show something even when external services are unavailable
  const color = "#3B82F6"; // Blue background
  const textColor = "#FFFFFF"; // White text

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(
        Math.min(width, height) / 10
      )}px" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${alt}
      </text>
    </svg>
  `;

  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;charset=utf8,${encodeURIComponent(
    svgContent
  )}`;

  // Set the placeholder as data URL
  element.src = dataUrl;

  // Remove onerror to prevent loops
  element.onerror = null;

  // Log the error (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `Image error for ${originalSrc}. Using placeholder for "${alt}"`
    );
  }
}
