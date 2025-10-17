import {Button} from "@/ui/shadcn/button";
import {Plus} from "lucide-react";

type HeaderProps = {
    title: string;
    subtitle: string;
    actionButton?: React.ReactNode;
};

const Header = ({title, subtitle, actionButton}: HeaderProps) => {
    return (
        <header className="flex flex-row items-start justify-between w-full">
            <div className="flex flex-1 flex-col justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-amber-300">{title}</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-100 ">{subtitle}</p>
            </div>
            { actionButton && actionButton }
        </header>
    );
};
export default Header;
