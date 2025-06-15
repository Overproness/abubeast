import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  description,
  className,
  children,
  gradient = false,
  centered = true,
  size = "default", // "small", "default", "large"
  backgroundPattern = true,
  animatedBlobs = false,
}) {
  const sizeClasses = {
    small: "py-8 lg:py-12",
    default: "py-12 lg:py-20",
    large: "py-16 lg:py-24",
  };

  const titleSizeClasses = {
    small: "text-3xl md:text-4xl lg:text-5xl",
    default: "text-4xl md:text-5xl lg:text-6xl",
    large: "text-5xl md:text-6xl lg:text-7xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        gradient &&
          "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20",
        !gradient && "bg-white dark:bg-gray-900",
        "border-b border-gray-200 dark:border-gray-800",
        className
      )}
    >
      {/* Background Pattern */}
      {backgroundPattern && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50" />
        </div>
      )}

      {/* Animated Background Blobs */}
      {animatedBlobs && (
        <>
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </>
      )}

      <div
        className={cn(
          "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
          sizeClasses[size]
        )}
      >
        <div className={cn("space-y-6", centered && "text-center")}>
          <div className="space-y-4">
            <h1
              className={cn(
                "font-bold leading-tight tracking-tight",
                titleSizeClasses[size],
                "bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent",
                "animate-fade-in-up"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed",
                  centered && "max-w-4xl mx-auto",
                  "animate-fade-in-up animation-delay-200"
                )}
              >
                {subtitle}
              </p>
            )}
            {description && (
              <p
                className={cn(
                  "text-lg text-gray-500 dark:text-gray-400 leading-relaxed",
                  centered && "max-w-5xl mx-auto",
                  "animate-fade-in-up animation-delay-400"
                )}
              >
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="animate-fade-in-up animation-delay-600">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
