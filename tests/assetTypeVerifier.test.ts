import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { fetchContentTypeForUrl, determineAssetKind } from '@/src/server/utils/assetTypeVerifier';

declare const global: any;

describe('assetTypeVerifier', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
    global.fetch = realFetch;
  });

  it('fetchContentTypeForUrl returns content-type from HEAD', async () => {
    // Ensure the mock is typed as returning a Promise to satisfy mockResolvedValue typings
    global.fetch = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'audio/mpeg' : null) } });
    const ct = await fetchContentTypeForUrl('https://cdn.example.com/a');
    expect(ct).toBe('audio/mpeg');
    expect(global.fetch).toHaveBeenCalledWith('https://cdn.example.com/a', { method: 'HEAD' });
  });

  it('fetchContentTypeForUrl falls back to GET Range when HEAD lacks content-type', async () => {
    global.fetch = (jest
      .fn<(...args: any[]) => Promise<any>>()
      // HEAD: no content-type
      .mockResolvedValueOnce({ headers: { get: (_: string) => null } })
      // GET: returns audio
      .mockResolvedValueOnce({ headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'audio/aac' : null) } })
    );

    const ct = await fetchContentTypeForUrl('https://cdn.example.com/b');
    expect(ct).toBe('audio/aac');
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://cdn.example.com/b', { method: 'HEAD' });
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://cdn.example.com/b', { method: 'GET', headers: { Range: 'bytes=0-0' } });
  });

  it('determineAssetKind marks audio when content-type says audio', async () => {
    global.fetch = jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ headers: { get: () => 'audio/ogg' } });
    const res = await determineAssetKind({ url: 'https://cdn/x/file', objectName: 'noext', mediaValueType: null, guessedContentType: null });
    expect(res.contentType).toBe('audio/ogg');
    expect(res.isAudio).toBe(true);
    expect(res.isVideo).toBe(false);
  });

  it('determineAssetKind uses guess when no network available', async () => {
    global.fetch = jest.fn<(...args: any[]) => Promise<any>>().mockRejectedValue(new Error('network error'));
    const res = await determineAssetKind({ url: 'https://cdn/x/file', objectName: 'path/voiceover.m4a', mediaValueType: 'image_or_video', guessedContentType: 'audio/mp4' });
    expect(res.contentType).toBe('audio/mp4');
    expect(res.isAudio).toBe(true); // from hints (contentType + objectName)
  });

  it('determineAssetKind marks video/image via extension when not audio', async () => {
    global.fetch = jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ headers: { get: () => 'video/mp4' } });
    const video = await determineAssetKind({ url: 'https://cdn/x/v', objectName: 'clip.mov', mediaValueType: null, guessedContentType: null });
    expect(video.isVideo).toBe(true);
    expect(video.isAudio).toBe(false);

    global.fetch = jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ headers: { get: () => 'image/png' } });
    const image = await determineAssetKind({ url: 'https://cdn/x/i', objectName: 'poster.png', mediaValueType: null, guessedContentType: null });
    expect(image.isImage).toBe(true);
    expect(image.isAudio).toBe(false);
  });
});
