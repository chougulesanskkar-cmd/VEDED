import React from "react";
import { Search, Bell, Settings, LogOut, Coins } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function TopBar() {
    const nav = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const initial = (user?.name || user?.email || "?")[0]?.toUpperCase();
    const isBookstream = location.pathname.startsWith("/app/bookstream");

    return (
        <header className="v-glass sticky top-0 z-30 border-b border-[var(--v-border)] px-6 lg:px-10 py-3.5 flex items-center gap-4">
            <div className="flex-1 max-w-2xl relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                    data-testid="topbar-search"
                    placeholder={isBookstream ? "Search for cinematic books, authors, or genres…" : "Search assets, prompts, projects…"}
                    className="w-full bg-[var(--v-surface-2)] border border-[var(--v-border)] rounded-full pl-11 pr-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-[var(--v-lime)] focus:outline-none transition-colors"
                />
            </div>

            {/* Credit chip */}
            <button
                onClick={() => nav("/app/pricing")}
                data-testid="topbar-credits"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--v-border)] bg-[var(--v-surface-2)] hover:border-[var(--v-lime)] transition-colors"
            >
                <Coins size={14} className="text-[var(--v-lime)]" />
                <span className="text-[12px] font-semibold text-neutral-200 tabular-nums">
                    {(user?.wallet?.image_credits ?? 0) + (user?.wallet?.video_credits ?? 0)} credits
                </span>
                <span className="v-chip v-chip-lime text-[9px] px-2 py-0.5">{user?.veded_tier?.replace("veded_", "") || "free"}</span>
            </button>

            <button className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white" data-testid="topbar-notifications">
                <Bell size={17} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white" data-testid="topbar-settings">
                <Settings size={17} />
            </button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button data-testid="topbar-avatar" className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--v-lime)] to-[var(--v-lime-dim)] text-black font-display font-black flex items-center justify-center border-2 border-[var(--v-lime)] hover:v-glow-lime-strong transition-shadow">
                        {initial}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--v-surface-2)] border-[var(--v-border-2)] w-52">
                    <DropdownMenuLabel className="text-neutral-400">
                        <div className="text-neutral-200 font-semibold">{user?.name}</div>
                        <div className="text-xs text-neutral-500">{user?.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[var(--v-border)]" />
                    <DropdownMenuItem onClick={() => nav("/app/pricing")} data-testid="menu-upgrade">
                        Upgrade Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => nav("/app")} data-testid="menu-dashboard">
                        Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[var(--v-border)]" />
                    <DropdownMenuItem onClick={() => { logout(); nav("/"); }} className="text-red-400" data-testid="menu-logout">
                        <LogOut size={14} className="mr-2" /> Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
