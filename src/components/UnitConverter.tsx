import * as React from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  convert,
  UNIT_LABELS,
  VOLUME_UNITS,
  WEIGHT_UNITS,
  type Unit,
} from "@/lib/unit-conversion";

interface Props {
  defaultUnit?: string;
  defaultAmount?: number;
}

const ALL_UNITS = [...VOLUME_UNITS, ...WEIGHT_UNITS];

function formatResult(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const s = n.toPrecision(6);
  return parseFloat(s).toString();
}

export function UnitConverter({ defaultUnit, defaultAmount }: Props) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(String(defaultAmount ?? 1));
  const [from, setFrom] = React.useState<Unit>((defaultUnit as Unit) ?? "cup");
  const [to, setTo] = React.useState<Unit>("ml");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const parsed = parseFloat(amount);
  const result =
    !isNaN(parsed) && parsed >= 0 ? convert(parsed, from, to) : null;

  return (
    <div className="relative inline-block" ref={ref}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="Unit converter"
        title="Unit converter"
      >
        <ArrowLeftRight />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <p className="mb-3 text-sm font-medium">Unit Converter</p>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24"
                aria-label="Amount"
              />
              <Select value={from} onValueChange={(v) => setFrom(v as Unit)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-24 text-center text-sm text-muted-foreground">
                =
              </span>
              <Select value={to} onValueChange={(v) => setTo(v as Unit)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {UNIT_LABELS[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              {result !== null ? (
                <span className="font-medium">
                  {formatResult(result)} {UNIT_LABELS[to]}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Cannot convert between volume and weight
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
