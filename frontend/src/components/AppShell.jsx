import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppShell() {
    return (
        <div className="flex min-h-screen bg-[var(--v-bg)]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 px-6 lg:px-10 py-8" data-testid="app-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
