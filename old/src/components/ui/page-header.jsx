import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { GradientOrb, GradientText } from "./glass";

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  badgeIcon,
  className,
  children,
  centered = true,
  size = "default", // "small", "default", "large"
}) {
  const sizeClasses = {
    small: "py-16 pt-24",
    default: "py-20 pt-28",
    large: "py-24 pt-32",
  };

  const titleSizeClasses = {
    small: "text-3xl md:text-4xl",
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl",
  };

  return (
    <div
      className={cn("relative overflow-hidden", sizeClasses[size], className)}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Gradient Orbs */}
      <GradientOrb
        color="blue"
        className="w-[500px] h-[500px] -top-40 -right-40 opacity-20"
      />
      <GradientOrb
        color="violet"
        className="w-[400px] h-[400px] -bottom-20 -left-20 opacity-15"
      />

      {/* Content */}
      <div className={cn("relative z-10 section-container")}>
        <div
          className={cn(
            "space-y-6 max-w-4xl",
            centered && "text-center mx-auto"
          )}
        >
          {/* Badge */}
          {badge && (
            <Badge variant="gradient" className="animate-fade-in">
              {badgeIcon}
              {badge}
            </Badge>
          )}

          {/* Title */}
          <h1
            className={cn(
              "font-bold leading-tight tracking-tight animate-fade-in-up",
              titleSizeClasses[size]
            )}
          >
            <GradientText>{title}</GradientText>
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={cn(
                "text-xl md:text-2xl text-muted-foreground leading-relaxed animate-fade-in-up",
                centered && "max-w-3xl mx-auto",
                "animation-delay-200"
              )}
            >
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p
              className={cn(
                "text-lg text-muted-foreground/80 leading-relaxed animate-fade-in-up",
                centered && "max-w-4xl mx-auto",
                "animation-delay-300"
              )}
            >
              {description}
            </p>
          )}

          {/* Children (CTA buttons, etc.) */}
          {children && (
            <div className="pt-4 animate-fade-in-up animation-delay-400">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
