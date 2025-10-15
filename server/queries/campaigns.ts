import { prisma } from '@/server/db/prisma';

export async function getCampaignsWithCounts() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        personas: true, // Include the join table for personas
        characters: true, // Include the join table for characters
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map over the results to add the counts
    return campaigns.map((campaign) => ({
      ...campaign,
      personaCount: campaign.personas.length ?? 0,
      characterCount: campaign.characters.length ?? 0,
    }));
  } catch (error) {
    console.error('Failed to fetch campaigns with counts:', error);
    throw new Error('Could not fetch campaigns.');
  }
}
