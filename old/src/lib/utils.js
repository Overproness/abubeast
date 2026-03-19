import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with conditional logic and optimizes Tailwind classes
 * @param  {...any} inputs - Class names or conditional class expressions
 * @returns {string} - Combined and optimized class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Re-export utility functions from other files for convenience
// You can add more re-exports here as needed
