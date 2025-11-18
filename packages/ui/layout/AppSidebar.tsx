'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator
} from "@/ui/shadcn/sidebar"
import { Calendar, ChevronDown, ChevronUp, Home, ImageIcon, Megaphone, Settings, User2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/ui/shadcn/collapsible";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/ui/shadcn/dropdown-menu";
import { useSession } from "@/src/server/supabase/providers";
import { createClient } from "@/src/server/supabase/client";
import { useRouter } from "next/navigation";

// Menu items.
const applicationMenuItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Assets",
        url: "/assets",
        icon: ImageIcon,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

const campaigns = [
    {
        title: "Project 1",
        url: "/campaigns/project-1",
        icon: Calendar,
    },
    {
        title: "Project 2",
        url: "/campaigns/project-2",
        icon: Calendar,
    }
]

const AppSidebar = () => {
    const { session } = useSession();
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleSignIn = () => {
        router.push('/login');
    };

    return (
        <Sidebar collapsible={"offcanvas"} side={"left"}>
            <SidebarHeader className={"py-4"}>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <Link href={"/public"} className={"flex flex-1 items-center w-full"}>
                            <Image src={"/logo.webp"} alt={"logo"} width={32} height={32} className={"rounded-full"}/>
                            <div className={"ml-2 flex flex-col align-start"}>
                                <span className={"font-bold`"}>Content Generator</span>
                                <p className="text-sm text-gray-500">by luminAIt</p>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarSeparator/>
            </SidebarHeader>
            <SidebarContent className={"px-4 overflow-hidden"}>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                applicationMenuItems.map((item, _) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url}>
                                                <item.icon/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        {
                                            item.title === "Inbox" && (
                                                <SidebarMenuBadge>24</SidebarMenuBadge>
                                            )
                                        }
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator/>
                <Collapsible defaultOpen className={"group/collapsible"}>
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger>
                                <Megaphone/>
                                <span className={"ml-2"}>Campaigns</span>
                                <ChevronDown
                                    className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"/>
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>

                        <CollapsibleContent>
                            <SidebarGroupContent>
                                {
                                    campaigns.map((item, _) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>
                                                    {item.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                }
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2/> {session ? session.user.email : "Sign In"} <ChevronUp className="ml-auto h-4 w-4"/>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {session ? (
                                    <>
                                        <DropdownMenuItem>Account</DropdownMenuItem>
                                        <DropdownMenuItem>Settings</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onClick={handleSignIn}>Sign in</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
export default AppSidebar;
