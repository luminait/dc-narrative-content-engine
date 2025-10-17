import { PrismaClient, Prisma } from '@/src/server/db/generated/prisma';

// This will be moved to src/server/db.ts as per the architectural guidelines.
const prisma = new PrismaClient();

/**
 * Fetches all campaigns from the database.
 */
export async function getCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { personas: true, characters: true },
      orderBy: { updatedAt: 'desc' },
    });
    return campaigns.map((c) => ({ ...c, personaCount: c.personas.length, characterCount: c.characters.length }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error('Failed to fetch campaigns.');
  }
}

/**
 * Fetches a single campaign by its ID.
 * @param id The ID of the campaign to fetch.
 */
export async function getCampaignById(id: string) {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id }, include: { personas: true, characters: true } });
    if (!campaign) return null;
    return { ...campaign, personaCount: campaign.personas.length, characterCount: campaign.characters.length };
  } catch (error) {
    console.error(`Error fetching campaign with ID ${id}:`, error);
    throw new Error('Failed to fetch campaign.');
  }
}

/**
 * Creates a new campaign.
 * @param data The data for the new campaign.
 */
export async function createCampaign(data: Prisma.CampaignCreateInput) {
  try {
    return await prisma.campaign.create({ data });
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Failed to create campaign.');
  }
}

/**
 * Updates an existing campaign.
 * @param id The ID of the campaign to update.
 * @param data The data to update.
 */
export async function updateCampaign(id: string, data: Prisma.CampaignUpdateInput) {
  try {
    return await prisma.campaign.update({ where: { id }, data });
  } catch (error) {
    console.error(`Error updating campaign with ID ${id}:`, error);
    throw new Error('Failed to update campaign.');
  }
}

/**
 * Deletes a campaign from the database.
 * @param id The ID of the campaign to delete.
 */
export async function deleteCampaign(id: string) {
  try {
    return await prisma.campaign.delete({ where: { id } });
  } catch (error) {
    console.error(`Error deleting campaign with ID ${id}:`, error);
    throw new Error('Failed to delete campaign.');
  }
}
