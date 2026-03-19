import { cn } from "@/lib/utils";

function GlassCard({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(hover ? "glass-card-hover" : "glass-card", className)}
      {...props}
    />
  );
}

function BentoGrid({ className, ...props }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
      {...props}
    />
  );
}

function BentoItem({ className, size = "default", ...props }) {
  const sizes = {
    default: "",
    large: "md:col-span-2 md:row-span-2",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
  };

  return (
    <GlassCard hover className={cn("p-6", sizes[size], className)} {...props} />
  );
}

function FeatureIcon({ className, size2 = 12, children, ...props }) {
  return (
    <div
      className={cn(
        `w-${size2} h-${size2} rounded-xl flex items-center justify-center`,
        "bg-gradient-to-br from-primary/20 to-violet-400/20",
        className
      )}
      {...props}
    >
      <div className="text-primary">{children}</div>
    </div>
  );
}

function StatsCard({ value, label, icon, className, ...props }) {
  return (
    <GlassCard hover className={cn("p-6 text-center", className)} {...props}>
      {icon && (
        <div className="flex justify-center mb-3">
          <FeatureIcon>{icon}</FeatureIcon>
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold gradient-text">
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </GlassCard>
  );
}

function GradientText({ className, children, ...props }) {
  return (
    <span className={cn("gradient-text", className)} {...props}>
      {children}
    </span>
  );
}

function NeonText({ className, children, ...props }) {
  return (
    <span className={cn("neon-text", className)} {...props}>
      {children}
    </span>
  );
}

function GradientOrb({ color = "primary", className, ...props }) {
  const colors = {
    primary: "gradient-orb-primary",
    violet: "gradient-orb-violet",
  };

  return (
    <div
      className={cn(
        colors[color],
        "animate-blob absolute pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

export {
  BentoGrid,
  BentoItem,
  FeatureIcon,
  GlassCard,
  GradientOrb,
  GradientText,
  NeonText,
  StatsCard,
};
