import type {Metadata} from "next";
import {Geist} from "next/font/google";
import {ThemeProvider} from "@/ui/providers/ThemeProvider";
import "./globals.css";
import {SidebarProvider} from "@/ui/shadcn/sidebar";
import AppSidebar from "@/ui/layout/AppSidebar";
import Navbar from "@/ui/layout/Navbar";
import {cookies} from "next/headers";
import MainContainer from "@/ui/layout/MainContainer";
import Providers from "@/app/providers";

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
            <Providers>
                <SidebarProvider defaultOpen>
                    <AppSidebar/>
                    <MainContainer>
                        <div className="flex h-screen flex-col">
                            <Navbar/>
                            <div className="flex-1 overflow-y-auto p-8">
                                {children}
                            </div>
                        </div>
                    </MainContainer>
                </SidebarProvider>
            </Providers>
        </ThemeProvider>
        </body>
        </html>
    );
}
