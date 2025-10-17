'use client';

import { useSidebar } from "@/ui/shadcn/sidebar";
import { cn } from "@/lib/utils";

export default function MainContainer({ children }: { children: React.ReactNode }) {
    const { open, isMobile } = useSidebar();

    return (
        <main
            className={cn(
                "w-full transition-all duration-300",
                // On mobile, the sidebar is an overlay, so no margin is needed.
                // On desktop, we apply a margin-left that matches the sidebar's current width.
                // This uses the CSS variables defined in the SidebarProvider for consistency.
                {
                    "ml-0": isMobile,
                    "ml-[var(--sidebar-width)]": !isMobile && open,
                    "ml-[var(--sidebar-width-icon)]": !isMobile && !open,
                }
            )}
        >
            {children}
        </main>
    );
}
