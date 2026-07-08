"use client";

/**
 * components/layout/Sidebar.tsx — Barra lateral de navegação principal.
 *
 * Design: logo + nav links com ícones Lucide + status do usuário no rodapé.
 * Colapsa em mobile (controlado pelo Header via estado compartilhado em context).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Target,
  MessageSquare,
  Settings,
  TrendingUp,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  const NAV_ITEMS: NavItem[] = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("nav.transactions"), href: "/transactions", icon: ArrowLeftRight },
    { label: t("nav.subscriptions"), href: "/subscriptions", icon: CreditCard },
    { label: t("nav.goals"), href: "/goals", icon: Target },
    { label: t("nav.chat"), href: "/chat", icon: MessageSquare, badge: "AI" },
  ];

  const BOTTOM_ITEMS: NavItem[] = [
    { label: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-surface",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-moss-500 shadow-sm">
          <TrendingUp className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold text-ink text-[15px] tracking-tight">
          FinanceFlow
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="flex flex-col gap-0.5" role="list">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
              }
              onClick={onNavigate}
            />
          ))}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className="border-t border-border p-3">
        <ul className="flex flex-col gap-0.5" role="list">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
              onClick={onNavigate}
            />
          ))}
          <li>
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "text-ink-muted transition-colors duration-150",
                "hover:bg-elevated hover:text-rose-400"
              )}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{t("action.logout") ?? "Sair"}</span>
            </button>
          </li>
        </ul>
        {/* Avatar do usuário */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2.5">
          <div className="h-7 w-7 rounded-full bg-moss-500/20 flex items-center justify-center text-xs font-semibold text-moss-400 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink truncate">{user?.name ?? "Usuário"}</p>
            <p className="text-[10px] text-ink-muted truncate">{user?.email ?? ""}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-ink-muted shrink-0" />
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href as any}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
          active
            ? "bg-moss-500/15 text-moss-400"
            : "text-ink-muted hover:bg-elevated hover:text-ink"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="rounded-md bg-moss-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-moss-400 leading-none">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
