/** A printer's registration target. Inherits color from text. */
export function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`reg-mark shrink-0 ${className}`}
    >
      <circle
        cx="8"
        cy="8"
        r="4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M8 0v16M0 8h16" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
