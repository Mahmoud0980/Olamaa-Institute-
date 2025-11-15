export default function Skeleton({
  width = "100%",
  height = "16px",
  className = "",
}) {
  return (
    <div
      className={`
        bg-gray-200 rounded-md animate-pulse
        ${className}
      `}
      style={{ width, height }}
    />
  );
}
