import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Keyboard shortcuts for desktop players. Keys are `KeyboardEvent.key`
 * values, lowercased (" " is space). Enter/Space on a focused control are left
 * to the control itself, so a focused button never fires twice.
 */
export function useHotkeys(keys: Record<string, () => void>, enabled = true) {
  // Latest handlers without re-subscribing on every render (the round clock
  // re-renders the screen ten times a second).
  const keysRef = useRef(keys);
  useLayoutEffect(() => {
    keysRef.current = keys;
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat)
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, select, textarea")) return;
      const key = event.key.toLowerCase();
      if ((key === "enter" || key === " ") && target?.closest("button, a"))
        return;
      const action = keysRef.current[key];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [enabled]);
}

/** Map 1–4 and A–D to a list of choices. */
export function choiceKeys<T>(items: T[], pick: (item: T) => void) {
  return Object.fromEntries(
    items.flatMap((item, i) => [
      [String(i + 1), () => pick(item)],
      ["abcd"[i], () => pick(item)],
    ]),
  );
}
