import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/shadcn/card";
import {Skeleton} from "@/ui/shadcn/skeleton";

type CardProps = {
    title: string;
    isLoading: boolean;
    count: string;
    icon: React.ReactElement;
    message: string;
}

const DashboardInfoCard = ({title, isLoading, count, message, icon}: CardProps) => {
    // Clone the icon element passed in props and apply new classes.
    // This preserves any existing classes on the icon and merges our new ones.
    const styledIcon = React.cloneElement(icon, {
        className: `w-4 h-4 text-green-600 ${icon.props.className || ''}`.trim()
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {styledIcon}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-8"/>
                ) : (
                    <div className="text-2xl font-bold">{count}</div>
                )}
                <p className="text-xs text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    );
};
export default DashboardInfoCard;
