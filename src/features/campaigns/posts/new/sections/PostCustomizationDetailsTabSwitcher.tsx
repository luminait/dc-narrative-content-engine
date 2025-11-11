'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import PostFormFieldsTab from "./PostFormFieldsTab";
import PostMergeFieldsTab from "./PostMergeFieldsTab";
import type { CampaignData } from "@/src/lib/zod/campaign.schema";

interface PostCustomizationDetailsTabSwitcherProps {
    campaign: CampaignData;
}

const PostCustomizationDetailsTabSwitcher = ({ campaign }: PostCustomizationDetailsTabSwitcherProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'details';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Post Details</TabsTrigger>
                <TabsTrigger value="assets">Assets (Merge Fields)</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
                <PostFormFieldsTab campaign={campaign} />
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
                <PostMergeFieldsTab campaign={campaign} />
            </TabsContent>
        </Tabs>
    );
};

export default PostCustomizationDetailsTabSwitcher;
