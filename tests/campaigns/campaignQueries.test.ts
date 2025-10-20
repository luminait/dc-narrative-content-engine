/**
 * Campaign Queries Test Suite
 *
 * Tests server-side data fetching for campaigns
 * Run with: pnpm test
 */

import { describe, it, expect } from "@jest/globals";
import { getCampaignsWithCounts, getCampaignById } from '@/src/server/queries/campaigns.queries';

describe('Campaign Queries', () => {
    describe('getCampaignsWithCounts', () => {
        it('should return an array of campaigns', async () => {
            const campaigns = await getCampaignsWithCounts();

            expect(Array.isArray(campaigns)).toBe(true);
        });

        it('should include persona and character counts', async () => {
            const campaigns = await getCampaignsWithCounts();

            if (campaigns.length > 0) {
                const firstCampaign = campaigns[0];
                expect(firstCampaign).toHaveProperty('personaCount');
                expect(firstCampaign).toHaveProperty('characterCount');
                expect(typeof firstCampaign.personaCount).toBe('number');
                expect(typeof firstCampaign.characterCount).toBe('number');
            }
        });

        it('should have required campaign fields', async () => {
            const campaigns = await getCampaignsWithCounts();

            if (campaigns.length > 0) {
                const firstCampaign = campaigns[0];
                expect(firstCampaign).toHaveProperty('id');
                expect(firstCampaign).toHaveProperty('title');
                expect(firstCampaign).toHaveProperty('createdAt');
                expect(firstCampaign).toHaveProperty('updatedAt');
            }
        });

        it('should order campaigns by updatedAt desc', async () => {
            const campaigns = await getCampaignsWithCounts();

            if (campaigns.length > 1) {
                for (let i = 0; i < campaigns.length - 1; i++) {
                    const current = new Date(campaigns[i].updatedAt?.toISOString() ||'');
                    const next = new Date(campaigns[i + 1].updatedAt?.toISOString() || '');
                    expect(current >= next).toBe(true);
                }
            }
        });
    });

    describe('getCampaignById', () => {
        it('should return null for non-existent campaign', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            const campaign = await getCampaignById(nonExistentId);

            expect(campaign).toBeNull();
        });

        it('should return campaign with relations when found', async () => {
            const campaigns = await getCampaignsWithCounts();

            if (campaigns.length > 0) {
                const firstCampaignId = campaigns[0].id;
                const campaign = await getCampaignById(firstCampaignId);

                expect(campaign).not.toBeNull();
                expect(campaign).toHaveProperty('personas');
                expect(campaign).toHaveProperty('characters');
                expect(campaign).toHaveProperty('mergeFields');
            }
        });
    });
});
