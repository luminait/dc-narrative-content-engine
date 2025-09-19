'use client';

import { useSidebar } from "@/ui/shadcn/sidebar";
import { cn } from "@/lib/utils";
import {useMemo} from "react"; // Assumes you have a `cn` utility for merging class names

/**
 * NOTE: The margin values below are educated guesses based on common sidebar widths.
 * Your specific `AppSidebar` component might have different widths for its
 * open and collapsed states. You may need to inspect the `AppSidebar` component
 * in your browser's developer tools to find the exact width classes (e.g., `w-72`, `w-14`)
 * and then use the corresponding margin classes (e.g., `ml-72`, `ml-14`) here.
 */
const MAIN_MARGIN_LEFT_OPEN = "ml-[12rem]"; // Example for an open sidebar width of `w-64` (16rem)
const MAIN_MARGIN_LEFT_COLLAPSED = "ml-4"; // Corresponds to the icon-only sidebar width of `w-12` (3rem) defined in `ui/sidebar.tsx`

export default function MainContainer({ children }: { children: React.ReactNode }) {
    const { open, state, isMobile } = useSidebar();

    const paddingLeft = useMemo(() => {
        if (isMobile) return 0                       // off-canvas on mobile
        return `var(${state === "collapsed" ? "--sidebar-width-icon" : "--sidebar-width"})`
    }, [state, isMobile])

    return (
        <main
            className={`w-full ${cn(
                "transition-all duration-300",
                isMobile ? "ml-0" : open ? MAIN_MARGIN_LEFT_OPEN : MAIN_MARGIN_LEFT_COLLAPSED
            )}`}
        >
            {children}
        </main>
    );
}
