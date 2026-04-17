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
    <label className={joinClasses("block space-y-2 text-sm font-medium text-slate-700", containerClassName)}>
      <span>{label}</span>
      {control}
    </label>
  );
}
