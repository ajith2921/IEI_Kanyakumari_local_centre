function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-base text-slate-600 hover:bg-slate-100",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const resolvedType = Component === "button" ? props.type || "button" : undefined;

  return (
    <Component
      {...props}
      type={resolvedType}
      className={joinClasses(
        "focus-ring",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {children}
    </Component>
  );
}
