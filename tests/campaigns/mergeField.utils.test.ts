import { buildMergeFieldUpdatePayload } from '@/src/lib/utils/mergefield.client-utils';
import type { MergeField } from '@/src/lib/zod/campaign.schema';

describe('buildMergeFieldUpdatePayload', () => {
  const baseField: Partial<MergeField> = {
    id: 'mf-1',
    name: 'HEADER_TITLE',
    description: 'Title text',
    mediaValueType: 'text' as any,
    value: 'Old Value',
    type: 'text' as any,
    startTime: 0 as any,
    endTime: 10 as any,
    shouldRefreshOnRegenerate: false as any,
  };

  it('keeps plain text value for text fields', () => {
    const field = { ...baseField } as MergeField;
    const editing = {
      fieldId: field.id!,
      name: 'HEADER_TITLE',
      description: 'Title text',
      value: 'New Title',
    };

    const payload = buildMergeFieldUpdatePayload(field, editing);
    expect(payload.value).toBe('New Title');
    expect(payload.mediaValueType).toBe('text');
  });

  it('uses asset_ref for explicit media types (image)', () => {
    const field = { ...baseField, mediaValueType: 'image', type: 'environment' } as unknown as MergeField;
    const editing = {
      fieldId: field.id!,
      name: 'ENV_FG1',
      description: 'Foreground foliage',
      value: '8e483c0a-a8ca-4941-bc11-ba47d0fbde39',
    };

    const payload = buildMergeFieldUpdatePayload(field, editing);
    expect(payload.value).toBe('8e483c0a-a8ca-4941-bc11-ba47d0fbde39');
  });

  it('uses asset_ref for semantic media types (character)', () => {
    const field = { ...baseField, mediaValueType: 'image', type: 'character' } as unknown as MergeField;
    const editing = {
      fieldId: field.id!,
      name: 'CHAR_FG1',
      description: 'Featured Pokemon',
      value: '48b93995-e11c-48ea-afe0-7d76248b93ad',
    };

    const payload = buildMergeFieldUpdatePayload(field, editing);
    expect(payload.value).toBe('48b93995-e11c-48ea-afe0-7d76248b93ad');
  });

  it('coerces numeric-like start/end time to numbers', () => {
    const field = { ...baseField, startTime: '0.000000000000', endTime: '3.98' } as unknown as MergeField;
    const editing = {
      fieldId: field.id!,
      name: 'HEADER_TITLE',
      description: 'Title text',
      value: 'New Title',
    };

    const payload = buildMergeFieldUpdatePayload(field, editing);
    expect(typeof payload.startTime).toBe('number');
    expect(typeof payload.endTime).toBe('number');
    expect(payload.startTime).toBeCloseTo(0, 5);
    expect(payload.endTime).toBeCloseTo(3.98, 5);
  });
});
