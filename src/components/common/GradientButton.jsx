export default function GradientButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  leftIcon = null,
  rightIcon = null,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-[#6D003E] to-[#D40078]
        text-white px-6 py-2 rounded-lg text-sm shadow-md
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:brightness-110 active:scale-95 flex items-center  gap-2
        ${className}
      `}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
}
