'use client';

import { KeyboardEvent, useMemo, useState } from 'react';
import ImageWithFallback from '@/ui/common/ImageWithFallback';
import { Input } from '@/ui/shadcn/input';
import { Badge } from '@/ui/shadcn/badge';
import { Search, X } from 'lucide-react';

export interface CharacterOption {
    id: string;
    name: string;
    characterTypes?: string | null;
    imageUrl?: string | null;
}

interface CharacterPickerProps {
    characters: CharacterOption[];
    selectedIds: string[];
    onChange: ( ids: string[] ) => void;
    /**
     * If false, behaves as single-select (always at most one id in selectedIds).
     * Default: true (multi-select).
     */
    allowMultiple?: boolean;
    /**
     * Show search input.
     * Default: true.
     */
    showSearch?: boolean;
    /**
     * Show selected badges under the grid.
     * Default: true.
     */
    showSelectedBadges?: boolean;
}

interface CharacterCardProps {
    character: CharacterOption;
    isSelected: boolean;
}

function resolveImageSrc( raw?: unknown ): string | undefined {
    if ( raw == null ) return undefined;

    // Handle React Flight "resolved_model" wrapper:
    // { status: "resolved_model", value: "\\"https://...png\\"" }
    if (
        typeof raw === 'object' && 'status' in raw && ( raw as any ).status === 'resolved_model' &&
        'value' in raw
    ) {
        let v = String( ( raw as any ).value ?? '' );
        // Strip surrounding quotes if present
        if ( v.startsWith( '"' ) && v.endsWith( '"' ) ) {
            v = v.slice( 1, -1 );
        }
        raw = v;
    }

    let value: string;
    if ( typeof raw === 'string' ) {
        value = raw;
    } else if ( raw instanceof URL ) {
        value = raw.toString();
    } else {
        try {
            value = String( raw );
        } catch {
            return undefined;
        }
    }

    if ( !value ) return undefined;

    // Absolute URL (e.g., Supabase public URL, CDN)
    // noinspection HttpUrlsUsage
    if ( value.startsWith( 'http://' ) || value.startsWith( 'https://' ) ) {
        return value;
    }

    // Already root-relative
    if ( value.startsWith( '/' ) ) {
        return value;
    }

    // Make path root-relative instead of route-relative
    return `/${value}`;
}

function CharacterCard( { character, isSelected }: CharacterCardProps ) {
    const src = resolveImageSrc( character.imageUrl );

    // TEMP debug
    console.log( '[CharacterPicker] image', {
        name: character.name,
        raw: character.imageUrl,
        resolved: src,
    } );

    return (
        <div className="text-center">
            <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                {/* We'll swap ImageWithFallback for a plain <img> for now */}
                <ImageWithFallback
                    src={src}
                    alt={character.name}
                    className="h-full w-full object-cover"
                />
                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                            <X className="h-4 w-4 text-white" aria-hidden="true"/>
                        </div>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{character.name}</h3>
            {character.characterTypes && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{character.characterTypes}</p>
            )}
        </div>
    );
}

interface SelectedBadgesProps {
    selectedIds: string[];
    characters: CharacterOption[];
    onRemove: ( id: string ) => void;
}

function SelectedBadges( { selectedIds, characters, onRemove }: SelectedBadgesProps ) {
    if ( !selectedIds || selectedIds.length === 0 ) return null;

    return (
        <div className="mt-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Selected Characters ({selectedIds.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
                {selectedIds.map( ( charId ) => {
                    const character = characters.find( ( c ) => c.id === charId );
                    return (
                        <Badge key={charId} variant="secondary" className="flex items-center space-x-1">
                            <span>{character?.name ?? 'Unknown'}</span>
                            <button
                                type="button"
                                onClick={( e ) => {
                                    e.stopPropagation();
                                    onRemove( charId );
                                }}
                                aria-label={`Remove ${character?.name ?? charId}`}
                                className="ml-1"
                            >
                                <X className="h-3 w-3 cursor-pointer"/>
                            </button>
                        </Badge>
                    );
                } )}
            </div>
        </div>
    );
}

export default function CharacterPicker( {
                                             characters,
                                             selectedIds,
                                             onChange,
                                             allowMultiple = true,
                                             showSearch = true,
                                             showSelectedBadges = true,
                                         }: CharacterPickerProps ) {
    const [ searchTerm, setSearchTerm ] = useState( '' );

    const filteredCharacters = useMemo( () => {
        if ( !searchTerm ) return characters;
        const lower = searchTerm.toLowerCase();
        return characters.filter(
            ( char ) =>
                char.name.toLowerCase().includes( lower ) ||
                ( char.characterTypes?.toLowerCase().includes( lower ) ?? false ),
        );
    }, [ characters, searchTerm ] );

    const handleToggle = ( characterId: string ) => {
        if ( !allowMultiple ) {
            onChange( selectedIds.includes( characterId ) ? [] : [ characterId ] );
            return;
        }

        const isSelected = selectedIds.includes( characterId );
        onChange(
            isSelected ? selectedIds.filter( ( id ) => id !== characterId ) : [ ...selectedIds, characterId ],
        );
    };

    const handleKeyDown = ( characterId: string, e: KeyboardEvent ) => {
        if ( e.key === 'Enter' || e.key === ' ' ) {
            e.preventDefault();
            handleToggle( characterId );
        }
    };

    return (
        <div className="space-y-4">
            {showSearch && (
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true"/>
                    <Input
                        type="search"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={( e ) => setSearchTerm( e.target.value )}
                        className="pl-10"
                        aria-label="Search characters"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredCharacters.map( ( character ) => {
                    const isSelected = selectedIds.includes( character.id );
                    return (
                        <div
                            key={character.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${character.name}`}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                isSelected
                                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                            }`}
                            onClick={() => handleToggle( character.id )}
                            onKeyDown={( e ) => handleKeyDown( character.id, e )}
                        >
                            <CharacterCard character={character} isSelected={isSelected}/>
                        </div>
                    );
                } )}
            </div>

            {showSelectedBadges && (
                <SelectedBadges
                    selectedIds={selectedIds}
                    characters={characters}
                    onRemove={( id ) => handleToggle( id )}
                />
            )}
        </div>
    );
}
