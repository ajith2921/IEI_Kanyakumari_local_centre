function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-base border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shadow-none",
};

const sizeClasses = {
  sm: "!h-11 !px-5 !text-sm",
  md: "",
  lg: "!h-11 !px-5 !text-sm",
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
        sizeClasses[size] || "",
        className
      )}
    >
      {children}
    </Component>
  );
}
