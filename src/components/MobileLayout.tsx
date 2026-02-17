import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, CalendarDays, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/sessions", icon: CalendarDays, label: "Sessions" },
  { path: "/friends", icon: Users, label: "Friends" },
  { path: "/profile", icon: User, label: "Profile" },
];

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
}

const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {title && (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl px-4 py-4">
          <h1 className="text-xl font-display font-bold">{title}</h1>
        </header>
      )}

      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
