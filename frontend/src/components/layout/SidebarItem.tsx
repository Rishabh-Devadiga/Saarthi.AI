import type { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { cn } from "@/utils/cn";

type SidebarItemProps = {
  activePath?: string;
  end?: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  to: string;
};

export function SidebarItem({
  activePath,
  end = false,
  icon: Icon,
  label,
  onClick,
  to,
}: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === (activePath ?? to);

  return (
    <NavLink
      className={cn("l-raillink", isActive && "is-active")}
      end={end}
      onClick={onClick}
      to={to}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <span>{label}</span>
    </NavLink>
  );
}
