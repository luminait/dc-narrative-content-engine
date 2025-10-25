'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";
import { OverviewTab } from "@/src/features/campaigns/details/sections/OverviewTab";
import { Campaign, Character, Persona, Post } from "@/src/lib/types/ui";
import { PostsTab } from "@/src/features/campaigns/details/sections/PostsTab";

interface CampaignDetailTabSwitcherProps {
    campaignPersonas: Persona[],
    campaign: Campaign,
    characters: Character[],
    posts: Post[]
}

const CampaignDetailTabSwitcher = ( {
                                        campaignPersonas,
                                        campaign,
                                        posts,
                                        characters,
                                    }: CampaignDetailTabSwitcherProps ) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get( 'tab' ) || 'overview';

    // Consume campaign data from the context


    const handleTabChange = ( value: string ) => {
        const params = new URLSearchParams( searchParams );
        params.set( 'tab', value );
        router.push( `${pathname}?${params.toString()}` );
    };

    return (
        <>
            {/* Tabs */}
            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="merge-fields">Merge Fields</TabsTrigger>
                </TabsList>

                {/* Ensure the pressing a tab upates the URL with the new tab value */}
                <TabsContent value="overview" className="space-y-6">
                    <OverviewTab
                        campaign={campaign}
                        posts={posts}
                        campaignCharacters={characters} // Use characters from context
                        campaignPersonas={campaignPersonas}
                        charactersLoading={false}
                        personasLoading={false}
                        charactersError={null}
                        personasError={null}
                    />
                </TabsContent>

                <TabsContent value="posts" className="space-y-6">
                    <PostsTab
                        campaign={campaign}
                        posts={posts}
                        onNavigate={() => {}}
                    />
                </TabsContent>

                <TabsContent value="merge-fields" className="space-y-6">
                    {/*<MergeFieldsTab*/}
                    {/*    campaign={campaign}*/}
                    {/*    campaignMergeFields={campaignMergeFields}*/}
                    {/*    mergeFieldsLoading={mergeFieldsLoading}*/}
                    {/*    mergeFieldsError={mergeFieldsError}*/}
                    {/*    campaignPersonas={campaignPersonas}*/}
                    {/*    campaignCharacters={campaignCharacters}*/}
                    {/*    assetPools={assetPools}*/}
                    {/*    activeInputs={activeInputs}*/}
                    {/*    inputValues={inputValues}*/}
                    {/*    assetRefNames={assetRefNames}*/}
                    {/*    loadingAssetRefs={loadingAssetRefs}*/}
                    {/*    modalOpen={modalOpen}*/}
                    {/*    selectedMergeField={selectedMergeField}*/}
                    {/*    onOpenAssetModal={openAssetModal}*/}
                    {/*    onCloseModal={handleModalClose}*/}
                    {/*    onAddAssetFromModal={handleAddAssetFromModal}*/}
                    {/*    onAddInputAsset={(mergeFieldId) => addInputAsset(mergeFieldId, handleResolveAssetReference)}*/}
                    {/*    onRemoveAssetFromPool={removeAssetFromPool}*/}
                    {/*    onSetActiveInputs={setActiveInputs}*/}
                    {/*    onSetInputValues={setInputValues}*/}
                    {/*    onHandleAssetClick={handleAssetClick}*/}
                    {/*    onHandleResolveAssetReference={handleResolveAssetReference}*/}
                    {/*    getMergeFieldDefaultDisplayValue={getMergeFieldDefaultDisplayValue}*/}
                    {/*    handleAssetUrlClick={handleAssetUrlClick}*/}
                    {/*    getAssetPoolDisplayInfo={getAssetPoolDisplayInfo}*/}
                    {/*/>*/}
                    MergeField Tab Content
                </TabsContent>
            </Tabs>
        </>
    );
};
export default CampaignDetailTabSwitcher;
