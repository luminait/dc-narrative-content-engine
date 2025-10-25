
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Campaign, Character, Post } from '@/src/lib/types/ui';

interface CampaignContextType {
  campaigns: Campaign[];
  characters: Character[];
  posts: Post[];
  paginatedPosts: Post[];
  loadMorePosts: () => void;
  hasMorePosts: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  campaigns: Campaign[];
  characters: Character[];
  posts: Post[];
}

const POSTS_PER_PAGE = 10;

export function CampaignProvider({
  children,
  campaigns,
  characters,
  posts,
}: CampaignProviderProps) {
  const [paginatedPosts, setPaginatedPosts] = useState<Post[]>(
    posts.slice(0, POSTS_PER_PAGE)
  );

  const loadMorePosts = () => {
    const currentLength = paginatedPosts.length;
    const morePosts = posts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    setPaginatedPosts((prev) => [...prev, ...morePosts]);
  };

  const hasMorePosts = paginatedPosts.length < posts.length;

  const value = {
    campaigns,
    characters,
    posts,
    paginatedPosts,
    loadMorePosts,
    hasMorePosts,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
