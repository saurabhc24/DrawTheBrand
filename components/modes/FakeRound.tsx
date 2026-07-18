import { fakeStyle } from "@/lib/fake";
import type { Round } from "@/lib/types";

/**
 * Mode E: one logo, one binary call — is this the true mark or a doctored one?
 * The distortion (if any) was fixed when the session was built.
 */
export function FakeRound({
  round,
  onPick,
}: {
  round: Round;
  onPick: (saidFake: boolean) => void;
}) {
  return (
    <div className="animate-fade flex flex-1 flex-col">
      <h1 className="text-xl font-extrabold tracking-tight">
        Is this the real {round.brand.name} logo?
      </h1>
      <div className="mx-auto mt-4 w-full max-w-80 overflow-hidden rounded-2xl border border-rule bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={round.brand.assets.logoFull}
          alt={`A logo that may or may not be the real ${round.brand.name} mark`}
          className="aspect-square w-full"
          style={fakeStyle(round.fake)}
        />
      </div>
      <p className="mt-3 text-center text-sm text-ink-muted">
        Look twice. Half of these have been quietly doctored.
      </p>
      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <button
          onClick={() => onPick(false)}
          className="pressable min-h-16 rounded-2xl bg-proof py-4 text-sm font-bold tracking-[0.18em] text-white uppercase"
        >
          Real
        </button>
        <button
          onClick={() => onPick(true)}
          className="pressable min-h-16 rounded-2xl bg-flag py-4 text-sm font-bold tracking-[0.18em] text-white uppercase"
        >
          Fake
        </button>
      </div>
    </div>
  );
}
