import { Building2, ChevronDown, Check } from "lucide-react";
import { useClinic } from "@/hooks/useClinic";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ClinicSwitcher() {
  const { clinic, clinics, switchClinic } = useClinic();

  if (clinics.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{clinic?.name || "اختر العيادة"}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {clinics.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => switchClinic(c.id)}
            className="gap-2"
          >
            <Check className={`h-4 w-4 ${c.id === clinic?.id ? "opacity-100" : "opacity-0"}`} />
            <span className="truncate">{c.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
