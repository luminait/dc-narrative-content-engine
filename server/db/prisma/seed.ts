import {
    CaptionLength,
    EventCadence,
    PostType,
    PrismaClient,
    VideoLengthSeconds,
    Weekdays
} from '../../../app/generated/prisma'; // Corrected: Use relative path

// Initialize the Prisma Client
const prisma = new PrismaClient();

/**
 * Maps a numeric video length in seconds to the corresponding VideoLengthSeconds enum.
 * @param {number | null} length - The length of the video in seconds.
 * @returns {VideoLengthSeconds | null} The matching enum value or null if no match is found.
 */
const mapVideoLength = (length: number | null): VideoLengthSeconds | null => {
    switch (length) {
        case 30:
            return VideoLengthSeconds.THIRTY;
        case 45:
            return VideoLengthSeconds.FORTY_FIVE;
        case 60:
            return VideoLengthSeconds.SIXTY;
        default:
            return null;
    }
};

// Raw data structured from the provided CSV file.
const campaignData = [
    {
        id: 4,
        version_number: 1,
        title: "Team Rocket's Rare Pokémon Heist",
        campaign_objective: "Increase engagement with long-time fans by highlighting rare and powerful Pokémon from the original series.",
        created_at: "2025-08-03 21:09:56.204765",
        updated_at: "2025-08-03 21:09:56.204765",
        days_of_week: '["tuesday","thursday","saturday"]',
        frequency: "weekly",
        post_type: "video",
        post_caption_length: "medium",
        post_video_length: 60,
        start_date: "2025-10-01",
        end_date: "2025-11-30",
        narrative_context: "The campaign follows Team Rocket members Jessie, James, and Giovanni as they attempt to capture legendary and rare Pokémon like Mewtwo and a special Dark Charizard...",
        is_active: true,
        is_archived: false,
    },
    {
        id: 9,
        version_number: 1,
        title: "beachday",
        campaign_objective: "Drive engagement and auction participation by evoking summer nostalgia with a playful Pokémon beach scene that spotlights weekly WhatNot streams.",
        created_at: "2025-08-08 05:06:34.995534",
        updated_at: "2025-08-08 05:06:34.995534",
        days_of_week: '["monday","tuesday"]',
        frequency: "weekly",
        post_type: "video",
        post_caption_length: "short",
        post_video_length: 30,
        start_date: "2025-08-01",
        end_date: "2025-09-21",
        narrative_context: "Sun and beach setting. Foreground foliage slides out of frame to reveal your favorite Pokémon characters at the beach. Land-based Pokémon characters at the shore and water-based Pokémon characters in the ocean. An avian Pokémon flies overhead. An bug type Pokémon appears on the foreground foliage towards the end of the video. This is a fun and playfully inviting scene.",
        is_active: true,
        is_archived: false,
    },
];

async function main() {
    console.log(`🧹 Clearing existing campaign data...`);
    await prisma.campaign.deleteMany({}); // Optional: Clears the table before seeding

    console.log(`🌱 Starting the seeding process...`);
    for (const c of campaignData) {
        const campaign = await prisma.campaign.create({
            data: {
                // Corrected: Map snake_case from data to camelCase for Prisma
                versionNumber: c.version_number,
                title: c.title,
                campaignObjective: c.campaign_objective,
                createdAt: new Date(c.created_at),
                updatedAt: new Date(c.updated_at),
                daysOfWeek: c.days_of_week ? JSON.parse(c.days_of_week) as Weekdays[] : [],
                frequency: c.frequency as EventCadence,
                postType: c.post_type as PostType,
                postCaptionLength: c.post_caption_length as CaptionLength,
                postVideoLength: mapVideoLength(c.post_video_length),
                startDate: new Date(c.start_date),
                endDate: new Date(c.end_date),
                narrativeContext: c.narrative_context,
                isActive: c.is_active,
                isArchived: c.is_archived,
            },
        });
        console.log(`✅ Created campaign: ${campaign.title} (ID: ${campaign.id})`);
    }
}

main()
    .then(async () => {
        console.log(`🎉 Seeding finished successfully.`);
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ An error occurred during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
