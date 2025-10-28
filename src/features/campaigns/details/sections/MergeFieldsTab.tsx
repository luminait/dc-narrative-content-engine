import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Skeleton } from '@/ui/shadcn/skeleton';
import { Alert, AlertDescription } from '@/ui/shadcn/alert';
// import { AssetSelectorModal } from '../AssetSelectorModal';
import type { Campaign, Character, Persona } from '@/src/lib/types/ui';
import { isAssetSystemAvailable } from '@/src/features/assets';
import { MergeField } from "@/src/features/campaigns/campaign.schema";
import { Badge } from "@/ui/shadcn/badge";

interface MergeFieldsTabProps {
    campaign: Campaign;
    campaignMergeFields: MergeField[];
    campaignPersonas: Persona[];
    campaignCharacters: Character[];
    mergeFieldsLoading: boolean;
    mergeFieldsError: string | null;
    // assetPools: Record<string, string[]>;
    // activeInputs: Record<string, boolean>;
    // inputValues: Record<string, string>;
//     assetRefNames: Record<string, string>;
//     loadingAssetRefs: Set<string>;
//     modalOpen: boolean;
//     selectedMergeField: any;
//     onOpenAssetModal: ( field: any ) => void;
//     onCloseModal: () => void;
//     onAddAssetFromModal: ( asset: string ) => void;
//     onAddInputAsset: ( mergeFieldId: string ) => void;
//     onRemoveAssetFromPool: ( mergeFieldId: string, assetIndex: number ) => void;
//     onSetActiveInputs: ( callback: ( prev: Record<string, boolean> ) => Record<string, boolean> ) => void;
//     onSetInputValues: ( callback: ( prev: Record<string, string> ) => Record<string, string> ) => void;
//     onHandleAssetClick: ( asset: string, mergeField: any ) => void;
//     onHandleResolveAssetReference: ( assetRefId: string ) => void;
//     getMergeFieldDefaultDisplayValue: ( mergeField: any ) => string;
//     handleAssetUrlClick: ( assetUrl: string ) => void;
//     getAssetPoolDisplayInfo: ( asset: string, field: any ) => {
//         displayValue: string;
//         clickableUrl: string | null;
//         isUrl: boolean;
//     };
}

export function MergeFieldsTab( {
                                    campaign,
                                    campaignMergeFields,
                                    mergeFieldsLoading,
                                    mergeFieldsError,
                                    campaignPersonas,
                                    campaignCharacters,
                                    // assetPools,
                                    // activeInputs,
                                    // inputValues,
                                    // assetRefNames,
                                    // loadingAssetRefs,
                                    // modalOpen,
                                    // selectedMergeField,
                                    // onOpenAssetModal,
                                    // onCloseModal,
                                    // onAddAssetFromModal,
                                    // onAddInputAsset,
                                    // onRemoveAssetFromPool,
                                    // onSetActiveInputs,
                                    // onSetInputValues,
                                    // onHandleAssetClick,
                                    // onHandleResolveAssetReference,
                                    // getMergeFieldDefaultDisplayValue,
                                    // handleAssetUrlClick,
                                    // getAssetPoolDisplayInfo
                                }: MergeFieldsTabProps ) {

    const addInputAsset = ( mergeFieldId: string ) => {
        // const inputValue = inputValues[mergeFieldId]?.trim();
        // if ( inputValue ) {
        // onAddInputAsset( mergeFieldId );
        // onSetInputValues( prev => ( { ...prev, [mergeFieldId]: '' } ) );
        // onSetActiveInputs( prev => ( { ...prev, [mergeFieldId]: false } ) );
        // }
    };

    console.log('campaign: ', campaign);
    console.log('mergeFields: ', campaignMergeFields);
    console.log('personas: ', campaignPersonas);

    return (
        <>
            {/* Merge Fields Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Merge Fields</CardTitle>
                    <CardDescription>
                        Manage asset pools for each merge field in this campaign
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Asset System Status Warning */}
                    {!mergeFieldsLoading && isAssetSystemAvailable() === false && (
                        <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600"/>
                            <AlertDescription className="text-orange-800">
                                <strong>Asset resolution system is not available.</strong> Asset reference IDs will be
                                displayed as shortened identifiers instead of resolved filenames or URLs. <br/>This is
                                expected if the assets database table hasn't been set up yet or if the asset management
                                system is not configured.
                            </AlertDescription>
                        </Alert>
                    )}
                    {mergeFieldsLoading ? (
                        <div className="space-y-4">
                            {[ ...Array( 3 ) ].map( ( _, i ) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                            ) )}
                        </div>
                    ) : mergeFieldsError ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{mergeFieldsError}</AlertDescription>
                        </Alert>
                    ) : campaignMergeFields.length > 0 ? (
                        <div className={"space-y-8"}>
                            {campaignPersonas.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <h5 className="font-medium text-blue-800 mb-2">Available Campaign Personas:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {campaignPersonas.map( ( persona, personaIndex ) => (
                                            <Badge
                                                key={persona.id}
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800"
                                            >
                                                {persona.name} ({persona.isPrimaryPersona ? 'Primary' : 'Secondary'})
                                            </Badge>
                                        ) )}
                                    </div>
                                    <p className="text-sm text-blue-700 mt-2">
                                        These personas are associated with this campaign and can be used in merge
                                        fields.
                                    </p>
                                </div>
                            )}

                        {campaignMergeFields.map( ( field, fieldIndex ) => (
                            <div key={fieldIndex}
                                 className="space-y-4 pb-6 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-medium text-lg">{field.name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {field.mediaValueType}
                                            </Badge>
                                            {field.type && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {field.type}
                                                </Badge>
                                            )}
                                            <p className={"text-sm text-gray-600 mb-3"}>
                                                {field.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) )}
                        </div>

                    ) : (
                        <p className="text-gray-500 text-sm">No merge fields found for this campaign.</p>
                    )}
                </CardContent>
            </Card>
        </>

    );
}


// <>
//     {/* Merge Fields Management */}
//     <Card>
//         <CardHeader>
//             <CardTitle>Merge Fields</CardTitle>
//             <CardDescription>
//                 Manage asset pools for each merge field in this campaign
//             </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//             {/* Asset System Status Warning */}
//             {!mergeFieldsLoading && isAssetSystemAvailable() === false && (
//                 <Alert className="border-orange-200 bg-orange-50">
//                     <AlertCircle className="h-4 w-4 text-orange-600"/>
//                     <AlertDescription className="text-orange-800">
//                         <strong>Asset resolution system is not available.</strong> Asset reference IDs will be
//                         displayed as shortened identifiers instead of resolved filenames or URLs. This is
//                         expected if the assets database table hasn't been set up yet or if the asset management
//                         system is not configured.
//                     </AlertDescription>
//                 </Alert>
//             )}
//
//             {mergeFieldsLoading ? (
//                 <div className="space-y-4">
//                     {[ ...Array( 3 ) ].map( ( _, i ) => (
//                         <div key={i} className="space-y-2">
//                             <Skeleton className="h-4 w-1/4"/>
//                             <Skeleton className="h-10 w-full"/>
//                         </div>
//                     ) )}
//                 </div>
//             ) : mergeFieldsError ? (
//                 <Alert>
//                     <AlertCircle className="h-4 w-4"/>
//                     <AlertDescription>{mergeFieldsError}</AlertDescription>
//                 </Alert>
//             ) : campaignMergeFields.length > 0 ? (
//                 <div className="space-y-8">
//                     {/* Show Campaign Personas if available */}
//                     {campaignPersonas.length > 0 && (
//                         <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
//                             <h5 className="font-medium text-blue-800 mb-2">Available Campaign Personas:</h5>
//                             <div className="flex flex-wrap gap-2">
//                                 {campaignPersonas.map( ( persona, personaIndex ) => (
//                                     <Badge
//                                         key={persona.id}
//                                         variant="secondary"
//                                         className="bg-blue-100 text-blue-800"
//                                     >
//                                         {persona.name} ({persona.id})
//                                     </Badge>
//                                 ) )}
//                             </div>
//                             <p className="text-sm text-blue-700 mt-2">
//                                 These personas are associated with this campaign and can be used in merge
//                                 fields.
//                             </p>
//                         </div>
//                     )}
//
//                     {campaignMergeFields.map( ( field, fieldIndex ) => (
//                         <div key={fieldIndex}
//                              className="space-y-4 pb-6 border-b border-gray-100 last:border-b-0">
//                             <div className="flex items-start justify-between">
//                                 <div className="flex-1">
//                                     <div className="flex items-center gap-3 mb-2">
//                                         <h4 className="font-medium text-lg">{field.merge_field}</h4>
//                                         <Badge variant="outline" className="text-xs">
//                                             {field.mediaValueType}
//                                         </Badge>
//                                         {field.type && (
//                                             <Badge variant="secondary" className="text-xs">
//                                                 {field.type}
//                                             </Badge>
//                                         )}
//                                     </div>
//                                     <p className="text-sm text-gray-600 mb-3">
//                                         {field.description}
//                                     </p>
//
//                                     {/* Default Value Display */}
//                                     {field.value && (
//                                         <div className="bg-gray-50 p-3 rounded-lg mb-4">
//                                             {/*<div className="flex items-center justify-between">*/}
//                                             {/*    <span className="text-sm font-medium text-gray-700">Default Value:</span>*/}
//                                             {/*    {field.isResolving && (*/}
//                                             {/*        <Loader2 className="w-4 h-4 animate-spin text-gray-500"/>*/}
//                                             {/*    )}*/}
//                                             {/*</div>*/}
//                                             {/*{field.resolved_asset_url &&*/}
//                                             {/*isMediaAssetType( field.media_value_type ) &&*/}
//                                             {/*isAssetReferenceId( field.default_value.trim() ) ? (*/}
//                                             {/*    <div*/}
//                                             {/*        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer mt-1 break-all"*/}
//                                             {/*        onClick={() => handleAssetUrlClick( field.resolved_asset_url )}*/}
//                                             {/*        title="Click to open asset in new tab"*/}
//                                             {/*    >*/}
//                                             {/*        {field.resolved_asset_url}*/}
//                                             {/*    </div>*/}
//                                             {/*) : (*/}
//                                             {/*    <p className="text-sm text-gray-800 mt-1 break-all">*/}
//                                             {/*        {getMergeFieldDefaultDisplayValue( field )}*/}
//                                             {/*    </p>*/}
//                                             {/*)}*/}
//                                             {/*{field.startTime && field.endTime && (*/}
//                                             {/*    <p className="text-xs text-gray-500 mt-1">*/}
//                                             {/*        Timing: {field.startTime}s - {field.endTime}s*/}
//                                             {/*        {field.length && ` (${field.length})`}*/}
//                                             {/*    </p>*/}
//                                             {/*)}*/}
//                                         </div>
//                                     )}
//                                 </div>
//                                 {/*<Button*/}
//                                 {/*    variant="outline"*/}
//                                 {/*    size="sm"*/}
//                                 {/*    onClick={() => onOpenAssetModal( field )}*/}
//                                 {/*    className="flex items-center gap-2 ml-4"*/}
//                                 {/*>*/}
//                                 {/*    <Plus className="w-4 h-4"/>*/}
//                                 {/*    Add Assets*/}
//                                 {/*</Button>*/}
//                             </div>
//
//                             {/* Asset Pool Display */}
//                             <div className="space-y-3">
//                                 <div className="flex flex-wrap gap-2">
//                                     {( assetPools[field.name] || [] ).map( ( asset, assetIndex ) => {
//                                         const {
//                                             displayValue,
//                                             clickableUrl,
//                                             isUrl
//                                         } = getAssetPoolDisplayInfo( asset, field );
//                                         const isLoading = loadingAssetRefs.has( asset );
//                                         const hasUrl = clickableUrl || canOpenAsset( asset, field );
//
//                                         return (
//                                             <div
//                                                 key={assetIndex}
//                                                 className={`inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm ${hasUrl ? 'cursor-pointer hover:bg-blue-100' : ''} ${isLoading ? 'opacity-60' : ''}`}
//                                                 onClick={hasUrl ? () => {
//                                                     if ( clickableUrl ) {
//                                                         // handleAssetUrlClick( clickableUrl );
//                                                     } else {
//                                                         // onHandleAssetClick( asset, field );
//                                                     }
//                                                 } : undefined}
//                                                 title={hasUrl ? 'Click to open asset' : asset}
//                                             >
//                                                 {isLoading && <Loader2 className="w-3 h-3 animate-spin"/>}
//                                                 {hasUrl && !isLoading && <Maximize2 className="w-3 h-3"/>}
//                                                 <span
//                                                     className={`max-w-xs truncate ${isUrl ? 'break-all' : ''}`}>
//                       {displayValue}
//                     </span>
//                                                 <button
//                                                     onClick={( e ) => {
//                                                         e.stopPropagation();
//                                                         // onRemoveAssetFromPool( field.name, assetIndex );
//                                                     }}
//                                                     className="text-blue-500 hover:text-blue-700 ml-1"
//                                                 >
//                                                     <X className="w-3 h-3"/>
//                                                 </button>
//                                             </div>
//                                         );
//                                     } )}
//                                 </div>
//
//                                 {/* Add Asset Input */}
//                                 <div className="flex items-center gap-2">
//                                     {!activeInputs[field.name] ? (
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => onSetActiveInputs( prev => ( {
//                                                 ...prev,
//                                                 [field.name]: true
//                                             } ) )}
//                                             className="text-xs"
//                                         >
//                                             + Add Manual Entry
//                                         </Button>
//                                     ) : (
//                                         <div className="flex items-center gap-2">
//                                             <Input
//                                                 placeholder="Enter asset value..."
//                                                 value={inputValues[field.name] || ''}
//                                                 onChange={( e ) => onSetInputValues( prev => ( {
//                                                     ...prev,
//                                                     [field.name]: e.target.value
//                                                 } ) )}
//                                                 onKeyDown={( e ) => {
//                                                     if ( e.key === 'Enter' ) {
//                                                         addInputAsset( field.name );
//                                                     }
//                                                     if ( e.key === 'Escape' ) {
//                                                         onSetActiveInputs( prev => ( {
//                                                             ...prev,
//                                                             [field.name]: false
//                                                         } ) );
//                                                         onSetInputValues( prev => ( {
//                                                             ...prev,
//                                                             [field.name]: ''
//                                                         } ) );
//                                                     }
//                                                 }}
//                                                 className="w-64 text-sm"
//                                                 autoFocus
//                                             />
//                                             <Button
//                                                 size="sm"
//                                                 onClick={() => addInputAsset( field.merge_field )}
//                                                 disabled={!inputValues[field.merge_field]?.trim()}
//                                             >
//                                                 Add
//                                             </Button>
//                                             <Button
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     onSetActiveInputs( prev => ( {
//                                                         ...prev,
//                                                         [field.merge_field]: false
//                                                     } ) );
//                                                     onSetInputValues( prev => ( {
//                                                         ...prev,
//                                                         [field.merge_field]: ''
//                                                     } ) );
//                                                 }}
//                                             >
//                                                 Cancel
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     ) )}
//                 </div>
//             ) : (
//                 <p className="text-gray-500 text-sm">No merge fields found for this campaign.</p>
//             )}
//         </CardContent>
//     </Card>
//
//     {/* Asset Selector Modal */}
//     {modalOpen && selectedMergeField && (
//         <AssetSelectorModal
//             isOpen={modalOpen}
//             onClose={onCloseModal}
//             mergeField={selectedMergeField}
//             campaignTitle={campaign.title}
//             existingAssets={assetPools[selectedMergeField.merge_field] || []}
//             onAddAsset={onAddAssetFromModal}
//             featuredCharacters={campaignCharacters.map( char => char.name )}
//         />
//     )}
// </>
