import {
  BookOpen,
  ClipboardCheck,
  BriefcaseBusiness,
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
    label: "Feedback and Nudges",
    to: "/feedback",
    icon: MessageCircle,
  },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-white/[0.08] bg-[#111827] text-white shadow-2xl shadow-black/20">
      <div className="p-5">
        <Link
          className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/5"
          onClick={onNavigate}
          to="/"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-base font-black text-white shadow-lg shadow-blue-950/40">
            S
          </span>
          <span>
            <span className="block text-base font-black tracking-tight text-white">
              Saarthi.AI
            </span>
            <span className="block text-xs font-medium text-slate-400">
              Learning Workspace
            </span>
          </span>
        </Link>
      </div>

      <nav className="space-y-1 px-4" aria-label="Workspace navigation">
        {sidebarItems.map((item) => (
          <SidebarItem
            icon={item.icon}
            key={`${item.label}-${item.to}`}
            label={item.label}
            onClick={onNavigate}
            to={item.to}
          />
        ))}
      </nav>

      <SidebarFooter />
    </aside>
  );
}
