import { OptionButtons } from "../OptionButtons";
import type { Round } from "@/lib/types";

/**
 * Mode C: a zoomed-in sliver of the full logo. The crop window was fixed when
 * the session was built, so it never shifts between renders.
 */
export function CropRound({
  round,
  onPick,
}: {
  round: Round;
  onPick: (brandId: string) => void;
}) {
  const { scale, fx, fy } = round.crop!;
  // Position the focal point at the viewport center, clamped so the image
  // always covers the whole window.
  const offset = (f: number) => Math.max((1 - scale) * 100, Math.min(0, (0.5 - f * scale) * 100));

  return (
    <div className="animate-fade flex flex-1 flex-col">
      <h1 className="text-xl font-extrabold tracking-tight">Whose logo is this a piece of?</h1>
      <div className="relative mx-auto mt-4 aspect-square w-full max-w-72 overflow-hidden rounded-lg border border-rule bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={round.brand.assets.logoFull}
          alt="A zoomed-in piece of a logo"
          className="absolute max-w-none"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            left: `${offset(fx)}%`,
            top: `${offset(fy)}%`,
          }}
        />
      </div>
      <div className="mt-auto pt-6">
        <OptionButtons options={round.options!} onPick={onPick} />
      </div>
    </div>
  );
}
