import { Archive, CheckCircle, Clock, NotebookPen } from "lucide-react";
import { CampaignStatus, PostStatus } from "@/src/lib/types/ui";

export const getCampaignStatusIcon = ( status: CampaignStatus ) => {
    switch ( status ) {
        case 'active':
            return <CheckCircle className="w-4 h-4 text-green-600"/>;
        case 'draft':
            return <NotebookPen className="w-4 h-4 text-yellow-600"/>;
        case 'completed':
            return <CheckCircle className="w-4 h-4 text-gray-600"/>;
        case "archived":
            return <Archive className="w-4 h-4 text-amber-600"/>;
        case "scheduled":
            return <Clock className="w-4 h-4 text-gray-600"/>;
    }
};

export const getPostStatusIcon = ( status: PostStatus ) => {
    switch ( status ) {
        case 'published':
            return <CheckCircle className="w-4 h-4 text-green-600"/>;
        case 'draft':
            return <NotebookPen className="w-4 h-4 text-yellow-600"/>;
        case "scheduled":
            return <Clock className="w-4 h-4 text-gray-600"/>;
        case "archived":
            return <Archive className="w-4 h-4 text-amber-600"/>;
    }
};


export const getStatusColor = ( status: CampaignStatus | PostStatus ) => {
    switch ( status ) {
        case "active":
        case "published":
            return 'bg-green-100 text-green-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-gray-100 text-gray-800';
        case "archived":
            return 'bg-amber-500 text-gray-800';
        case "scheduled":
            return 'bg-blue-100 text-gray-800';
    }
};
