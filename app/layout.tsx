import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/ui/providers/ThemeProvider";
import "../src/styles/globals.css";
import { SidebarInset, SidebarProvider } from "@/ui/shadcn/sidebar";
import AppSidebar from "@/ui/layout/AppSidebar";
import Navbar from "@/ui/layout/Navbar";
import { cookies } from "next/headers";
import MainContainer from "@/ui/layout/MainContainer";
import Providers from "@/app/providers";
import { CampaignProvider } from "@/src/features/campaigns/providers/CampaignProvider";
import { Campaign, Character, Post } from "@/src/lib/types/ui";
import { getPosts } from "@/src/server/queries/posts.queries";
import { getCampaigns } from "@/src/server/queries/campaigns.queries";
import { getCharacters } from "@/src/server/queries/characters.queries";
import { buildCampaign } from "@/src/lib/utils/campaigns.utils";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL( defaultUrl ),
    title: "Pokémon Content Engine",
    description: "A narrative content generation engine powered by luminAIt.",
};

const geistSans = Geist( {
    variable: "--font-geist-sans",
    display: "swap",
    subsets: [ "latin" ],
} );


// Define the extended Campaign type with counts
interface CampaignWithCounts extends Campaign {
    personaCount: number;
    characterCount: number;
}


export default async function RootLayout( {
                                              children,
                                          }: Readonly<{
    children: React.ReactNode;
}> ) {
    const cookiesStore = await cookies();
    const defaultOpen = cookiesStore.get( "sidebar_state" )?.value === "open";


    // Turn this into a Campaign type with counts
    const baseCampaigns = await getCampaigns();
    const campaigns = baseCampaigns.map( (campaign) => buildCampaign(campaign) );
    const characters = await getCharacters();



    // const posts: Post[] = await getPosts();

    console.log( 'campaigns: ', campaigns );


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
                <CampaignProvider
                    campaigns={campaigns}
                    characters={characters}
                    posts={[] as Post[]}
                >
                    <SidebarProvider defaultOpen>
                        <MainContainer>
                            <AppSidebar/>
                            <SidebarInset>
                                <Navbar/>
                                <main className="flex-1 overflow-y-auto p-8">
                                    {children}
                                </main>
                            </SidebarInset>
                        </MainContainer>
                    </SidebarProvider>
                </CampaignProvider>
            </Providers>
        </ThemeProvider>
        </body>
        </html>
    );
}
