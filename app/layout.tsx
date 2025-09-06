import type {Metadata} from "next";
import {Geist} from "next/font/google";
import {ThemeProvider} from "@/components/providers/ThemeProvider";
import "./globals.css";
import {SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import {cookies} from "next/headers";
import MainContainer from "@/components/MainContainer";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Pokémon Content Engine",
    description: "A narrative content generation engine powered by luminAIt.",
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    display: "swap",
    subsets: ["latin"],
});

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const cookiesStore = await cookies();
    const defaultOpen = cookiesStore.get("sidebar_state")?.value === "open";
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider defaultOpen>
                <AppSidebar/>
                <MainContainer>
                    <div className="flex h-screen flex-col">
                        <Navbar/>
                        <div className="flex-1 overflow-y-auto p-4">
                            {children}
                        </div>
                    </div>
                </MainContainer>
            </SidebarProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
