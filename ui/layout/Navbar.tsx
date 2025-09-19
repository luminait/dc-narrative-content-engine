'use client'
import Link from "next/link";
import {LogOut, Moon, Settings, SquareMenu, User} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/ui/shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/ui/shadcn/dropdown-menu";
import {Button} from "@/ui/shadcn/button";
import ThemeModeToggle from "@/ui/common/ThemeModeToggle";
import {SidebarTrigger, useSidebar} from "@/ui/shadcn/sidebar";

const Navbar = () => {
    // const {toggleSidebar} = useSidebar();
    return (
        <nav className='p-4 flex items-center justify-between'>
            {/* LEFT SIDE */}
            <SidebarTrigger   />
            {/*<Button variant={"outline"} onClick={toggleSidebar}>Custom Button</Button>*/}
            {/*RIGHT SIDE*/}
            <div className={"flex items-center gap-4"}>

                <ThemeModeToggle/>

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png"/>
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10} align={"end"}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <User className={"h-[1.2rem w-[1.2rem] mr-2"}/> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className={"h-[1.2rem w-[1.2rem] mr-2"}/>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem color={"destructive"}>
                            <LogOut className={"h-[1.2rem w-[1.2rem] mr-2"}/>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>



            </div>
        </nav>
    );
};
export default Navbar;
