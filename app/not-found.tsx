import Link from "next/link";

// Process plates, drifting just out of register.
const PLATES = [
  { color: "#00AEEF", mx: "-6px", my: "3px" },
  { color: "#EC008C", mx: "5px", my: "-4px" },
  { color: "#FFE600", mx: "2px", my: "6px" },
];

export default function NotFound() {
  return (
    <main className="not-found app-sheet mx-auto flex h-dvh w-full max-w-md flex-col items-center justify-center overflow-hidden px-6 text-center">
      <p className="not-found-eyebrow text-ink-muted font-mono text-[11px] tracking-[0.16em] uppercase">
        Error 404 · Misprint
      </p>
      <div
        className="misprint relative mt-4 text-[128px] leading-none font-black tracking-[-0.05em] font-stretch-expanded"
        role="img"
        aria-label="404"
      >
        {PLATES.map((p) => (
          <span
            key={p.color}
            aria-hidden
            className="misprint-plate absolute inset-0 animate-[misregister_5s_ease-in-out_infinite] mix-blend-multiply"
            style={
              {
                color: p.color,
                "--mx": p.mx,
                "--my": p.my,
              } as React.CSSProperties
            }
          >
            404
          </span>
        ))}
        <span aria-hidden className="misprint-key relative mix-blend-multiply">
          404
        </span>
      </div>
      <h1 className="not-found-title mt-6 text-xl font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        This page never made it to press.
      </h1>
      <p className="not-found-note text-ink-muted mt-1.5 text-sm">
        The plates slipped — or the page never existed.
      </p>
      <Link
        href="/"
        className="not-found-home pressable bg-ink text-paper mt-8 rounded-full px-6 py-3.5 font-bold"
      >
        Back to the start
      </Link>
    </main>
  );
}
