import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  FileText,
  LayoutDashboard,
  Truck,
  User,
  UserCircle,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/hub" },
  { label: "Orders", icon: FileText, path: "/hub/orders" },
  { label: "Restaurants", icon: UtensilsCrossed, path: "/hub/restaurants" },
  { label: "Delivery Partners", icon: Truck, path: "/hub/delivery-partners" },
  { label: "Customers", icon: UserCircle, path: "/hub/customers" },
  { label: "Profile", icon: User, path: "/hub/profile" },
  { label: "Complaints", icon: AlertTriangle, path: "/hub/complaints" },
];

export default function HubSidebar({ isOpen = false, onClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/hub") {
      return location.pathname === "/hub" || location.pathname === "/hub/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "bg-neutral-950 border-r border-neutral-800/60 h-screen fixed left-0 top-0 overflow-y-auto z-50 w-64 transform transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="px-4 py-4 border-b border-neutral-800/60 flex items-center justify-between">
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
          Hub Panel
        </span>
        <button className="lg:hidden text-neutral-300" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 text-neutral-300" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
