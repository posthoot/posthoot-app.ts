import { useTeam } from "@/app/providers/team-provider";
import { cn } from "@/lib/utils";
import { ShipWheel } from "lucide-react";

interface LogoProps {
  className?: string;
  onlyLogo?: boolean;
}

export function Logo({ className, onlyLogo }: LogoProps) {
  const { team } = useTeam();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {team?.logoUrl ? (
        <img
          src={team.logoUrl}
          alt={team.name}
          className="h-8 w-8 object-contain rounded-full"
        />
      ) : (
        <ShipWheel className="h-6 w-6" />
      )}
      {!onlyLogo && (
        <span className="font-semibold">{team?.name || "kori 🦆"}</span>
      )}
    </div>
  );
}
