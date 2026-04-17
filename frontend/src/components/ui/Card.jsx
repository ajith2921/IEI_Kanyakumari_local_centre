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
        padded ? "p-5 md:p-6" : "",
        className
      )}
    >
      {children}
    </Component>
  );
}
