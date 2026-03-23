"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import HomeTab from "./home";
import HistoryTab from "./history";
import ProfileTab from "./profile";

type TabKey = "home" | "history" | "profile";

export default function AdminTabs() {
  const [tab, setTab] = useState<TabKey>("home");

  const content = useMemo(() => {
    switch (tab) {
      case "history":
        return <HistoryTab />;
      case "profile":
        return <ProfileTab />;
      case "home":
      default:
        return <HomeTab />;
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="h-16 bg-[#4AA3A9] flex items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="w-15 h-15  flex items-center justify-center overflow-hidden">
            <Image
              src="/assets/logo-transparentbg.png"
              alt="InspirEd"
              width={44}
              height={44}
            />
          </div>
        </div>

        <nav className="flex items-center gap-10">
          <button
            onClick={() => setTab("home")}
            className={`font-semibold text-lg ${
              tab === "home" ? "text-white" : "text-white/80"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setTab("history")}
            className={`font-semibold text-lg ${
              tab === "history" ? "text-white" : "text-white/80"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`font-semibold text-lg ${
              tab === "profile" ? "text-white" : "text-white/80"
            }`}
          >
            Profile
          </button>
        </nav>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Logout
          </button>
        </form>
      </header>

      {content}
    </div>
  );
}

