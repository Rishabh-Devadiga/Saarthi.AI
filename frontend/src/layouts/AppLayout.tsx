import { Bell, Search, X } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSession } from "@/context/SessionContext";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const isLearningPlan = location.pathname === "/learning-plan";
  const isApiTest = location.pathname === "/api-test";
  const searchValue = isLearningPlan ? searchParams.get("q") ?? "" : "";
  const nudge = state.nudges;
  const todayLabel = new Date()
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toLowerCase();

  // The landing, the wizard and the auth pages run their own shells;
  // the workspace rail belongs to the app surfaces only.
  if (
    location.pathname === "/" ||
    location.pathname === "/onboarding" ||
    location.pathname === "/signin" ||
    location.pathname === "/signup"
  ) {
    return <Outlet />;
  }

  function handleLearningSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    navigate({ pathname: "/learning-plan", search: params.toString() });
  }

  return (
    <div className="lumen lumen-workspace min-h-dvh">
      <div className="grid min-h-dvh lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-rule px-4 py-6 lg:flex">
          <Sidebar />
        </aside>
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpen={() => setIsMobileSidebarOpen(true)}
        />
        <div className="flex min-w-0 flex-col">
          <header className="flex items-center gap-3 border-b border-rule py-3 pl-16 pr-4 lg:pl-10 sm:pr-6">
            <p className="l-readout hidden grow sm:block">{todayLabel}</p>
            {isLearningPlan ? (
              <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-rule bg-transparent px-3 text-sm text-ink sm:max-w-xs sm:flex-none">
                <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  aria-label="Search lessons"
                  className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
                  onChange={(event) => handleLearningSearch(event.target.value)}
                  placeholder="search roadmap"
                  type="text"
                  value={searchValue}
                />
                {searchValue ? (
                  <button
                    aria-label="Clear search"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
                    onClick={() => handleLearningSearch("")}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </label>
            ) : null}
            <div className="relative">
              <button
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                className={`inline-flex h-10 w-10 items-center justify-center border text-ink-2 transition-colors hover:text-ink ${
                  isNotificationsOpen
                    ? "border-accent-2 text-ink"
                    : "border-rule"
                }`}
                onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
                type="button"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {nudge ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-2"
                  />
                ) : null}
              </button>
              {isNotificationsOpen ? (
                <div
                  className="l-well absolute right-0 top-12 z-40 w-[min(92vw,22rem)] p-4 text-left shadow-card"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="l-readout">notifications</p>
                      <p className="mt-1 text-sm text-ink">learning nudges</p>
                    </div>
                    {nudge?.urgency ? (
                      <span className="l-tag">{nudge.urgency}</span>
                    ) : null}
                  </div>
                  {nudge ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm leading-6 text-ink-2">
                        {nudge.personalized_message}
                      </p>
                      {nudge.recommended_action ? (
                        <p className="l-readout">
                          next action · {nudge.recommended_action}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted">No nudges yet.</p>
                  )}
                </div>
              ) : null}
            </div>
          </header>
          <main
            className={`mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 ${
              isApiTest ? "sm:pb-10" : ""
            }`}
          >
            {isApiTest ? (
              <div className="workspace-utility l-enter">
                <Outlet />
              </div>
            ) : (
              <div className="l-enter">
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
