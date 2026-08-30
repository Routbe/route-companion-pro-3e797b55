import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VISIT_EFFECTS, runVisitEffect, type VisitEffect } from "@/lib/visit-effects";

/**
 * "Pagina Bezoek Effect" — icoonkaarten plus een testknop die het effect direct
 * over de studio afspeelt, zodat de keuze meteen te beoordelen is.
 */
export function VisitEffectPicker({
  value,
  onChange,
}: {
  value: VisitEffect;
  onChange: (next: VisitEffect) => void;
}) {
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const test = () => {
    stopRef.current?.();
    stopRef.current = runVisitEffect(value, { force: true });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="input-label">Pagina Bezoek Effect</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={value === "none"}
          onClick={test}
        >
          <Play className="h-3.5 w-3.5" aria-hidden /> Test effect
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VISIT_EFFECTS.map((e) => (
          <button
            key={e.id}
            type="button"
            aria-pressed={value === e.id}
            onClick={() => onChange(e.id)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-xl border p-2.5 text-left transition-colors hover:bg-muted/50",
              value === e.id ? "border-foreground/40 bg-muted/40" : "border-border",
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              {e.icon}
            </span>
            <span className="text-[11px] font-medium leading-tight">{e.label}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">{e.hint}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Wordt één keer bij het openen van je profiel afgespeeld en automatisch overgeslagen bij
        “verminderde beweging”.
      </p>
    </div>
  );
}
