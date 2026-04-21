import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import HubSidebar from "./HubSidebar";

export default function HubLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-200 flex">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <HubSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <header className="h-14 bg-neutral-900 text-white flex items-center justify-between px-4 shadow-sm">
          <button
            className="lg:hidden text-neutral-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-wide">Hub Panel</h1>
          <div />
        </header>

        <main className="flex-1 bg-neutral-100 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
