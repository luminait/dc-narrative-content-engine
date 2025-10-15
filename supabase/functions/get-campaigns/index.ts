import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PrismaClient } from "../_shared/prisma-client.ts";

const prisma = new PrismaClient();

async function getCampaignsWithCounts() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      personas: true,
      characters: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });

  return campaigns.map((campaign) => ({
    ...campaign,
    personaCount: campaign.personas.length ?? 0,
    characterCount: campaign.characters.length ?? 0,
  }));
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
      },
    });
  }

  try {
    const campaigns = await getCampaignsWithCounts();
    return new Response(JSON.stringify(campaigns), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 500,
    });
  }
});
