function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export default function Input({
  as = "input",
  label,
  className = "",
  containerClassName = "",
  children,
  ...props
}) {
  const Component = as;

  const control = (
    <Component {...props} className={joinClasses("input-base", className)}>
      {children}
    </Component>
  );

  if (!label) {
    return control;
  }

  return (
    <label className={joinClasses("block space-y-1.5 text-sm font-medium text-gray-600", containerClassName)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      {control}
    </label>
  );
}
