import { cn } from "@/lib/utils";
import { ShipWheel } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg flex items-center gap-2", className)}>
      <ShipWheel className="w-6 h-6" />
      SailMail
    </span>
  );
}
