import { unstable_cache } from 'next/cache';
import { prisma } from '@/src/server/db/prisma';

export const getPersonas = unstable_cache(
  async () => {
    return prisma.persona.findMany({
      where: { deletedAt: null },
      orderBy: { label: 'asc' },
    });
  },
  ['personas'],
  { tags: ['personas'], revalidate: 3600 }
);

export const getCharacters = unstable_cache(
  async () => {
    return prisma.character.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      take: 100,
    });
  },
  ['characters'],
  { tags: ['characters'], revalidate: 3600 }
);

export const getValueTypes = unstable_cache(
  async () => {
    // Assuming you have a ValueType model or similar
    // Replace with actual implementation
    return ['text', 'number', 'image', 'video'];
  },
  ['value-types'],
  { tags: ['value-types'], revalidate: 3600 }
);
