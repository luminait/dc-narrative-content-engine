'use client'

import Header from "@/ui/layout/Header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronRight,
    Copy,
    Image,
    Images,
    Loader2,
    MoreVertical,
    Search,
    Target,
    Trash2,
    Users,
    Video,
    X,
    Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import {Textarea} from "@/ui/shadcn/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/ui/shadcn/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/ui/shadcn/collapsible";
import {
    Campaign,
    Character,
    MergeField,
    Persona
} from "@/lib/types";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Skeleton } from "@/ui/shadcn/skeleton";
import {Alert, AlertDescription} from "@/ui/shadcn/alert";
import {Badge} from "@/ui/shadcn/badge";
import ImageWithFallback from "@/ui/common/ImageWithFallback";
import { Button } from "@/ui/shadcn/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/ui/shadcn/dropdown-menu";

const CampaignGenerator = () => {
    const [formData, setFormData] = useState({
        title: '',
        objective: '',
        narrativeContext: '',
        postLength: '',
        startDate: '',
        endDate: ''
    });

    const [cadence, setCadence] = useState({
        daysOfWeek: [] as string[],
        frequency: 'weekly' as 'weekly' | 'bi-weekly'
    });

    const [postType, setPostType] = useState<'image' | 'carousel' | 'video'>('image');
    const [videoLength, setVideoLength] = useState<30 | 45 | 60>(30);

    const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [characterSearch, setCharacterSearch] = useState('');
    const [csvContent, setCsvContent] = useState('');
    const [mergeFields, setMergeFields] = useState<MergeField[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [webhookError, setWebhookError] = useState<string | null>(null);
    const [webhookSuccess, setWebhookSuccess] = useState(false);
    const [testMode, setTestMode] = useState(false);
    const [webhookTestResult, setWebhookTestResult] = useState<any>(null);

    // Character-related state
    const [characters, setCharacters] = useState<Character[]>([]);
    const [charactersLoading, setCharactersLoading] = useState(true);
    const [charactersError, setCharactersError] = useState<string | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Persona-related state
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [personasLoading, setPersonasLoading] = useState(true);
    const [personasError, setPersonasError] = useState<string | null>(null);

    // Value types state
    const [valueTypes, setValueTypes] = useState<string[]>([]);
    const [valueTypesLoading, setValueTypesLoading] = useState(true);
    const [valueTypesError, setValueTypesError] = useState<string | null>(null);

    // Campaign creation state
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [campaignCreationError, setCampaignCreationError] = useState<string | null>(null);

    // Collapsible states
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isPersonasOpen, setIsPersonasOpen] = useState(false);
    const [isCharactersOpen, setIsCharactersOpen] = useState(false);
    const [isPostTypeOpen, setIsPostTypeOpen] = useState(false);
    const [isVideoLengthOpen, setIsVideoLengthOpen] = useState(false);
    const [isMergeFieldsOpen, setIsMergeFieldsOpen] = useState(false);

    const isFormValid = () => {
        return (
            formData.title.trim() !== '' &&
            formData.objective.trim() !== '' &&
            formData.postLength.trim() !== '' &&
            cadence.daysOfWeek.length > 0 &&
            selectedPersonas.length > 0 &&
            selectedCharacters.length > 0
        );
    };

    const handleTestWebhook = async () => {
        setTestMode(true);
        setWebhookError(null);
        setWebhookTestResult(null);

        try {
            const result = await testWebhookConnectivity();
            setWebhookTestResult(result);

            if (!result.success) {
                setWebhookError(`Test failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error testing webhook:', error);
            setWebhookError(`Test error: ${error.message}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsGenerating(true);
        setIsCreatingCampaign(true);
        setWebhookError(null);
        setWebhookSuccess(false);
        setCampaignCreationError(null);

        try {
            // 1. Create campaign object for database
            const campaignForDatabase: Omit<Campaign, 'id' | 'createdAt' | 'status'> = {
                title: formData.title,
                objective: formData.objective,
                narrativeContext: formData.narrativeContext,
                cadence,
                postType,
                videoLength: postType === 'video' ? videoLength : undefined,
                personas: selectedPersonas,
                characters: selectedCharacters,
                postLength: formData.postLength,
                mergeFields,
                startDate: formData.startDate,
                endDate: formData.endDate
            };

            console.log('Creating campaign with data:', campaignForDatabase);

            // 2. Save campaign to database first
            const savedCampaign = await saveCampaignToDatabase(campaignForDatabase);
            console.log('Campaign saved successfully:', savedCampaign);

            // 3. Also call the local handler for UI state management
            onCreateCampaign(campaignForDatabase);

            // 4. Send webhook (if not in test mode)
            if (!testMode) {
                try {
                    const webhookPayload = transformToWebhookPayload();
                    console.log('Sending webhook with payload:', webhookPayload);

                    await sendWebhookPayload(webhookPayload);
                    setWebhookSuccess(true);
                    console.log('Webhook sent successfully');
                } catch (webhookError) {
                    console.error('Webhook failed but campaign was saved:', webhookError);
                    setWebhookError(`Campaign created but webhook failed: ${webhookError.message}`);
                    // Don't throw here - campaign was successfully saved
                }
            }

            // 5. Navigate to campaign details if everything succeeded
            if (savedCampaign) {
                // Create a properly typed campaign object for navigation
                const campaignForNavigation: Campaign = {
                    ...campaignForDatabase,
                    id: savedCampaign.id?.toString() || Date.now().toString(),
                    createdAt: savedCampaign.createdAt || new Date().toISOString().split('T')[0],
                    status: savedCampaign.status || 'draft'
                };

                console.log('Navigating to campaign details with:', campaignForNavigation);
                onNavigate('campaign-details', campaignForNavigation);
            }

        } catch (error) {
            console.error('Error creating campaign:', error);

            if (error.message.includes('Failed to save campaign')) {
                setCampaignCreationError(`Failed to save campaign to database: ${error.message}`);
            } else {
                setCampaignCreationError(`Campaign creation failed: ${error.message}`);
            }

            setWebhookError(error.message);
        } finally {
            setIsGenerating(false);
            setIsCreatingCampaign(false);
        }
    };


    const daysOptions = [
        {id: 'monday', label: 'Monday'},
        {id: 'tuesday', label: 'Tuesday'},
        {id: 'wednesday', label: 'Wednesday'},
        {id: 'thursday', label: 'Thursday'},
        {id: 'friday', label: 'Friday'},
        {id: 'saturday', label: 'Saturday'},
        {id: 'sunday', label: 'Sunday'}
    ];

    const postLengthOptions = [
        {value: 'short', label: 'Short (50-100 words)'},
        {value: 'medium', label: 'Medium (100-200 words)'},
        {value: 'long', label: 'Long (200+ words)'}
    ];

    const filteredCharacters = characterSearch
        ? characters.filter(character =>
            character.name.toLowerCase().includes(characterSearch.toLowerCase()) ||
            character.type.toLowerCase().includes(characterSearch.toLowerCase())
        )
        : characters;

    return (
        <div  className="flex flex-1 flex-col justify-between items-start">
            <Header
                title={"Create a new campaign"}
                subtitle={"Build a comprehensive narrative social media campaign."}
            />


            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Campaign Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-blue-600"/>
                            <span>Campaign Details</span>
                        </CardTitle>
                        <CardDescription>
                            Define the core objective and messaging for your campaign
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Campaign Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                                placeholder="e.g., Holiday Pokémon Card Collection Showcase"
                                className="mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="objective">Campaign Objective</Label>
                            <Textarea
                                id="objective"
                                value={formData.objective}
                                onChange={(e) => setFormData(prev => ({...prev, objective: e.target.value}))}
                                placeholder="What do you want to achieve with this campaign?"
                                className="mt-1"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="narrativeContext">Narrative Context (Optional)</Label>
                            <Textarea
                                id="narrativeContext"
                                value={formData.narrativeContext}
                                onChange={(e) => setFormData(prev => ({...prev, narrativeContext: e.target.value}))}
                                placeholder="Additional context or storytelling elements for your campaign"
                                className="mt-1"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="postLength">Post Length</Label>
                                <Select
                                    value={formData.postLength}
                                    onValueChange={(value) => setFormData(prev => ({...prev, postLength: value}))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select post length"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {postLengthOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="startDate">Start Date (Optional)</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Posting Schedule */}
                <Card>
                    <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-purple-600"/>
                                        <span>Posting Schedule</span>
                                    </div>
                                    {isScheduleOpen ? <ChevronDown className="w-4 h-4"/> :
                                        <ChevronRight className="w-4 h-4"/>}
                                </CardTitle>
                                <CardDescription>
                                    Set when and how often your content will be published
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Days of the Week</Label>
                                    <div className="grid grid-cols-4 gap-3 mt-2">
                                        {daysOptions.map(day => (
                                            <div key={day.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={day.id}
                                                    checked={cadence.daysOfWeek.includes(day.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setCadence(prev => ({
                                                                ...prev,
                                                                daysOfWeek: [...prev.daysOfWeek, day.id]
                                                            }));
                                                        } else {
                                                            setCadence(prev => ({
                                                                ...prev,
                                                                daysOfWeek: prev.daysOfWeek.filter(d => d !== day.id)
                                                            }));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={day.id} className="text-sm">
                                                    {day.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Frequency</Label>
                                    <Select
                                        value={cadence.frequency}
                                        onValueChange={(value: 'weekly' | 'bi-weekly') =>
                                            setCadence(prev => ({...prev, frequency: value}))
                                        }
                                    >
                                        <SelectTrigger className="mt-1 max-w-xs">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {cadence.daysOfWeek.length > 0 && (
                                    <div className="text-sm text-gray-600 mt-4">
                                        <strong>Schedule Preview:</strong> Posts will be published{' '}
                                        {cadence.daysOfWeek.length === 7 ? 'daily' : `on ${cadence.daysOfWeek.join(', ')}`}{' '}
                                        {cadence.frequency === 'bi-weekly' ? 'every two weeks' : 'every week'}
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Target Audience (Personas) */}
                <Card>
                    <Collapsible open={isPersonasOpen} onOpenChange={setIsPersonasOpen}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-green-600"/>
                                        <span>Target Audience</span>
                                    </div>
                                    {isPersonasOpen ? <ChevronDown className="w-4 h-4"/> :
                                        <ChevronRight className="w-4 h-4"/>}
                                </CardTitle>
                                <CardDescription>
                                    Choose the audience personas for your campaign
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent>
                                {personasError && (
                                    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                                        <AlertCircle className="h-4 w-4 text-yellow-600"/>
                                        <AlertDescription className="text-yellow-700">
                                            {personasError}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {personasLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Skeleton className="h-4 w-4"/>
                                                    <Skeleton className="h-4 w-32"/>
                                                </div>
                                                <Skeleton className="h-3 w-full mt-2"/>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {personas.map(persona => (
                                            <div
                                                key={persona.key}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedPersonas.includes(persona.label)
                                                        ? 'border-blue-300 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => handlePersonaToggle(persona.label)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        checked={selectedPersonas.includes(persona.label)}
                                                        readOnly
                                                    />
                                                    <h3 className="text-sm">{persona.label}</h3>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2">
                                                    {persona.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedPersonas.length > 0 && (
                                    <div className="mt-4">
                                        <Label>Selected Personas ({selectedPersonas.length})</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedPersonas.map(persona => (
                                                <Badge
                                                    key={persona}
                                                    variant="secondary"
                                                    className="flex items-center space-x-1"
                                                >
                                                    <span>{persona}</span>
                                                    <X
                                                        className="w-3 h-3 cursor-pointer"
                                                        onClick={() => handlePersonaToggle(persona)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Characters Selection */}
                <Card>
                    <Collapsible open={isCharactersOpen} onOpenChange={setIsCharactersOpen}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-orange-600"/>
                                        <span>Featured Characters</span>
                                    </div>
                                    {isCharactersOpen ? <ChevronDown className="w-4 h-4"/> :
                                        <ChevronRight className="w-4 h-4"/>}
                                </CardTitle>
                                <CardDescription>
                                    Select the Pokémon characters to feature in your campaign
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="space-y-4">
                                {charactersError && (
                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertCircle className="h-4 w-4 text-yellow-600"/>
                                        <AlertDescription className="text-yellow-700">
                                            {charactersError}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                                    <Input
                                        placeholder="Search characters..."
                                        value={characterSearch}
                                        onChange={(e) => setCharacterSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {charactersLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div key={i} className="p-3 border rounded-lg">
                                                <Skeleton className="h-20 w-full mb-2"/>
                                                <Skeleton className="h-4 w-3/4 mx-auto"/>
                                                <Skeleton className="h-3 w-1/2 mx-auto mt-1"/>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {filteredCharacters.map(character => (
                                            <div
                                                key={character.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedCharacters.includes(character.name)
                                                        ? 'border-blue-300 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => handleCharacterToggle(character.name)}
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className="relative w-20 h-20 mx-auto mb-2 overflow-hidden rounded">
                                                        <ImageWithFallback
                                                            src={character.defaultImage || character.imageAssets?.[0] || ''}
                                                            alt={character.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {selectedCharacters.includes(character.name) && (
                                                            <div
                                                                className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                                                <div
                                                                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                    <X className="w-4 h-4 text-white"/>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm text-gray-900">{character.name}</h3>
                                                    <p className="text-xs text-gray-600">{character.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedCharacters.length > 0 && (
                                    <div>
                                        <Label>Selected Characters ({selectedCharacters.length})</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedCharacters.map(character => (
                                                <Badge
                                                    key={character}
                                                    variant="secondary"
                                                    className="flex items-center space-x-1"
                                                >
                                                    <span>{character}</span>
                                                    <X
                                                        className="w-3 h-3 cursor-pointer"
                                                        onClick={() => handleCharacterToggle(character)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Post Type Selection */}
                <Card>
                    <Collapsible open={isPostTypeOpen} onOpenChange={setIsPostTypeOpen}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Image className="w-5 h-5 text-pink-600"/>
                                        <span>Post Type</span>
                                    </div>
                                    {isPostTypeOpen ? <ChevronDown className="w-4 h-4"/> :
                                        <ChevronRight className="w-4 h-4"/>}
                                </CardTitle>
                                <CardDescription>
                                    Choose the format for your social media posts
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            id: 'image',
                                            icon: Image,
                                            label: 'Single Image',
                                            description: 'Single photo posts'
                                        },
                                        {
                                            id: 'carousel',
                                            icon: Images,
                                            label: 'Image Carousel',
                                            description: 'Multiple image slides'
                                        },
                                        {id: 'video', icon: Video, label: 'Video', description: 'Video content'}
                                    ].map(type => (
                                        <div
                                            key={type.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                postType === type.id
                                                    ? 'border-blue-300 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => setPostType(type.id as 'image' | 'carousel' | 'video')}
                                        >
                                            <div className="text-center">
                                                <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                                                    postType === type.id ? 'text-blue-600' : 'text-gray-400'
                                                }`}/>
                                                <h3 className="text-sm text-gray-900 mb-1">{type.label}</h3>
                                                <p className="text-xs text-gray-600">{type.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                {/* Video Length (only show if video is selected) */}
                {postType === 'video' && (
                    <Card>
                        <Collapsible open={isVideoLengthOpen} onOpenChange={setIsVideoLengthOpen}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Video className="w-5 h-5 text-red-600"/>
                                            <span>Video Length</span>
                                        </div>
                                        {isVideoLengthOpen ? <ChevronDown className="w-4 h-4"/> :
                                            <ChevronRight className="w-4 h-4"/>}
                                    </CardTitle>
                                    <CardDescription>
                                        Choose the duration for your video content
                                    </CardDescription>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {value: 30, label: '30 seconds', description: 'Short, quick content'},
                                            {value: 45, label: '45 seconds', description: 'Medium-length content'},
                                            {
                                                value: 60,
                                                label: '60 seconds',
                                                description: 'Longer, detailed content'
                                            }
                                        ].map(option => (
                                            <div
                                                key={option.value}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    videoLength === option.value
                                                        ? 'border-blue-300 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setVideoLength(option.value as 30 | 45 | 60)}
                                            >
                                                <div className="text-center">
                                                    <h3 className="text-sm text-gray-900 mb-1">{option.label}</h3>
                                                    <p className="text-xs text-gray-600">{option.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                )}

                {/* Merge Fields */}
                {postType === 'video' && (
                    <Card>
                        <Collapsible open={isMergeFieldsOpen} onOpenChange={setIsMergeFieldsOpen}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-5 h-5 text-indigo-600"/>
                                            <span>Merge Fields</span>
                                        </div>
                                        {isMergeFieldsOpen ? <ChevronDown className="w-4 h-4"/> :
                                            <ChevronRight className="w-4 h-4"/>}
                                    </CardTitle>
                                    <CardDescription>
                                        Define dynamic content fields for your video posts
                                    </CardDescription>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-4">
                                    {valueTypesError && (
                                        <Alert className="border-yellow-200 bg-yellow-50">
                                            <AlertCircle className="h-4 w-4 text-yellow-600"/>
                                            <AlertDescription className="text-yellow-700">
                                                {valueTypesError}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <Label htmlFor="csv-upload">Upload CSV for Bulk Import</Label>
                                            <Input
                                                id="csv-upload"
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addMergeFieldRow}
                                                className="flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4"/>
                                                <span>Add Field</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {mergeFields.length > 0 && (
                                        <div className="space-y-3">
                                            <Label>Merge Fields ({mergeFields.length})</Label>
                                            {mergeFields.map((field, index) => (
                                                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm">Field #{index + 1}</Label>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="w-4 h-4"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => duplicateMergeFieldRow(field.id)}>
                                                                    <Copy className="w-4 h-4 mr-2"/>
                                                                    Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => removeMergeFieldRow(field.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2"/>
                                                                    Remove
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <Label htmlFor={`merge-field-${field.id}`}
                                                                   className="text-xs">
                                                                Merge Field Name
                                                            </Label>
                                                            <Input
                                                                id={`merge-field-${field.id}`}
                                                                value={field.mergeField}
                                                                onChange={(e) => updateMergeField(field.id, {mergeField: e.target.value})}
                                                                placeholder="e.g., character_name"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`description-${field.id}`}
                                                                   className="text-xs">
                                                                Description
                                                            </Label>
                                                            <Input
                                                                id={`description-${field.id}`}
                                                                value={field.description}
                                                                onChange={(e) => updateMergeField(field.id, {description: e.target.value})}
                                                                placeholder="Field description"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`value-type-${field.id}`}
                                                                   className="text-xs">
                                                                Value Type
                                                            </Label>
                                                            {valueTypesLoading ? (
                                                                <Skeleton className="h-9 mt-1"/>
                                                            ) : (
                                                                <Select
                                                                    value={field.valueType}
                                                                    onValueChange={(value) => updateMergeField(field.id, {valueType: value})}
                                                                >
                                                                    <SelectTrigger className="mt-1">
                                                                        <SelectValue/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {valueTypes.map(type => (
                                                                            <SelectItem key={type} value={type}>
                                                                                {type}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`value-${field.id}`}
                                                                   className="text-xs">
                                                                Value
                                                            </Label>
                                                            <Input
                                                                id={`value-${field.id}`}
                                                                value={field.value}
                                                                onChange={(e) => updateMergeField(field.id, {value: e.target.value})}
                                                                placeholder="Field value"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`start-time-${field.id}`}
                                                                   className="text-xs">
                                                                Start Time (seconds)
                                                            </Label>
                                                            <Input
                                                                id={`start-time-${field.id}`}
                                                                type="number"
                                                                step="0.1"
                                                                value={field.startTime}
                                                                onChange={(e) => updateMergeField(field.id, {startTime: e.target.value})}
                                                                placeholder="0.0"
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`end-time-${field.id}`}
                                                                   className="text-xs">
                                                                End Time (seconds)
                                                            </Label>
                                                            <Input
                                                                id={`end-time-${field.id}`}
                                                                type="number"
                                                                step="0.1"
                                                                value={field.endTime}
                                                                onChange={(e) => updateMergeField(field.id, {endTime: e.target.value})}
                                                                placeholder="5.0"
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {field.length && (
                                                        <div className="text-xs text-gray-600">
                                                            Duration: {field.length} seconds
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                )}

                {/* Webhook Test and Errors */}
                {webhookError && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600"/>
                        <AlertDescription className="text-red-700">
                            {webhookError}
                        </AlertDescription>
                    </Alert>
                )}

                {webhookSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertCircle className="h-4 w-4 text-green-600"/>
                        <AlertDescription className="text-green-700">
                            Campaign created and webhook sent successfully!
                        </AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pt-6 border-t">
                    <div className="flex items-center space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTestWebhook}
                            disabled={isGenerating}
                            className="flex items-center space-x-2"
                        >
                            <Zap className="w-4 h-4"/>
                            <span>Test Webhook</span>
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="test-mode"
                                checked={testMode}
                                onCheckedChange={setTestMode}
                            />
                            <Label htmlFor="test-mode" className="text-sm">
                                Test Mode (Skip webhook)
                            </Label>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onNavigate('dashboard')}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid() || isGenerating || isCreatingCampaign}
                            className="flex items-center space-x-2"
                        >
                            {isGenerating || isCreatingCampaign ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                    <span>{isCreatingCampaign ? 'Creating Campaign...' : 'Generating...'}</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4"/>
                                    <span>Create Campaign</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default CampaignGenerator;
