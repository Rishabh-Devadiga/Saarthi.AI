import { Menu, X } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export function MobileSidebar({ isOpen, onClose, onOpen }: MobileSidebarProps) {
  return (
    <>
      <button
        aria-label="Open workspace navigation"
        className="l-raillink fixed left-4 top-3 z-40 h-10 w-10 justify-center px-0 lg:hidden"
        onClick={onOpen}
        type="button"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close workspace navigation"
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--color-paper)_62%,black)]"
            onClick={onClose}
            type="button"
          />
          <div className="l-well relative h-full w-[min(84vw,17rem)] p-4">
            <Sidebar onNavigate={onClose} />
            <button
              aria-label="Close workspace navigation"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center border border-rule text-ink-2 transition-colors hover:text-ink"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
