'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shadcn/tabs";

const CampaignDetailTabSwitcher = () => {
    return (
        <>
            {/* Tabs */}
            <Tabs value={"overview"} onValueChange={() => {}} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="merge-fields">Merge Fields</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/*<OverviewTab*/}
                    {/*    campaign={campaign}*/}
                    {/*    posts={posts}*/}
                    {/*    campaignCharacters={campaignCharacters}*/}
                    {/*    campaignPersonas={campaignPersonas}*/}
                    {/*    charactersLoading={charactersLoading}*/}
                    {/*    personasLoading={personasLoading}*/}
                    {/*    charactersError={charactersError}*/}
                    {/*    personasError={personasError}*/}
                    {/*/>*/}
                    OverviewTabContent
                </TabsContent>

                <TabsContent value="posts" className="space-y-6">
                    {/*<PostsTab*/}
                    {/*    campaign={campaign}*/}
                    {/*    posts={posts}*/}
                    {/*    onNavigate={onNavigate}*/}
                    {/*/>*/}
                    Posts Tab Content
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
