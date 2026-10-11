/** Hairline icons, 16-unit grid, stroked in currentColor. */
function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d={d} />
    </svg>
  );
}

export const CheckIcon = (p: { className?: string }) => (
  <Icon d="M3 8.5l3.2 3L13 4.5" {...p} />
);
export const CrossIcon = (p: { className?: string }) => (
  <Icon d="M3.5 3.5l9 9M12.5 3.5l-9 9" {...p} />
);
export const ArrowIcon = (p: { className?: string }) => (
  <Icon d="M2.5 8h11M9 3.5L13.5 8 9 12.5" {...p} />
);
export const ShareIcon = (p: { className?: string }) => (
  <Icon
    d="M8 10V2M5 4.8L8 2l3 2.8M3 8.5V13a1 1 0 001 1h8a1 1 0 001-1V8.5"
    {...p}
  />
);
export const ReplayIcon = (p: { className?: string }) => (
  <Icon d="M2.8 7.5A5.3 5.3 0 1 1 4.4 12M2.5 3.5v4h4" {...p} />
);
export const UndoIcon = (p: { className?: string }) => (
  <Icon d="M5.5 3L2.5 6l3 3M2.5 6h7a4 4 0 010 8H7" {...p} />
);
