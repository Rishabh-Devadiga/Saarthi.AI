import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FolderOpen,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SidebarFooter } from "@/components/layout/SidebarFooter";
import { SidebarItem } from "@/components/layout/SidebarItem";

const sidebarItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Learning", to: "/my-learning", icon: FolderOpen },
  { label: "Learning Plan", to: "/learning-plan", icon: BookOpen },
  { label: "Quiz", to: "/quiz", icon: ClipboardCheck },
  { label: "AI Mentor", to: "/mentor", icon: MessagesSquare },
  {
    label: "Mock Interview",
    to: "/interview",
    icon: BriefcaseBusiness,
  },
  { label: "Progress", to: "/progress", icon: TrendingUp },
  {
    label: "Feedback",
    to: "/feedback",
    icon: MessageCircle,
  },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link aria-label="Return to Saarthi.AI home" className="mb-8 inline-flex" to="/">
        <img
          alt="Saarthi.AI"
          className="h-7 w-auto"
          draggable={false}
          src="/images/logo.png"
        />
      </Link>
      <p className="l-readout">workspace</p>
      <nav
        aria-label="Workspace navigation"
        className="mt-3 flex flex-col gap-1"
      >
        {sidebarItems.map((item) => (
          <SidebarItem
            icon={item.icon}
            key={item.to}
            label={item.label}
            onClick={onNavigate}
            to={item.to}
          />
        ))}
      </nav>
      <SidebarFooter />
    </div>
  );
}
