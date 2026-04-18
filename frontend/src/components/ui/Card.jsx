function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export default function Card({
  as: Component = "article",
  className = "",
  interactive = false,
  padded = true,
  children,
  ...props
}) {
  return (
    <Component
      {...props}
      className={joinClasses(
        "card-base",
        interactive ? "interactive-card" : "",
        padded ? "p-6 md:p-8" : "",
        className
      )}
    >
      {children}
    </Component>
  );
}
