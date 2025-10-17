import { CheckCircle, Clock } from "lucide-react";
import { Campaign } from "@/packages/types";

export const getStatusIcon = ( status: Campaign['status'] ) => {
    switch ( status ) {
        case 'active':
            return <CheckCircle className="w-4 h-4 text-green-600"/>;
        case 'draft':
            return <Clock className="w-4 h-4 text-yellow-600"/>;
        case 'completed':
            return <CheckCircle className="w-4 h-4 text-gray-600"/>;
    }
};

export const getStatusColor = ( status: Campaign['status'] ) => {
    switch ( status ) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-gray-100 text-gray-800';
    }
};
