import { Button } from "@/ui/shadcn/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/ui/shadcn/dropdown-menu";
import { Copy, Edit, Plus, Settings, Trash2 } from "lucide-react";


function CampaignDetails( props: { onClick?: () => any } ) {
    return (

        <div className={"space-y-6"}>
            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={props.onClick}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Create Post
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Edit className="w-4 h-4"/>
                        Edit Campaign
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Settings className="w-4 h-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2">
                                <Copy className="w-4 h-4"/>
                                Duplicate Campaign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                <Trash2 className="w-4 h-4"/>
                                Delete Campaign
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export default CampaignDetails;
