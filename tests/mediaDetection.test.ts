import { describe, it, expect } from '@jest/globals';
import { isAudioUrl, guessAudioMime, isAudioFromHints, deriveSourceAndMime } from '@/src/lib/utils/mediaDetection';

describe('mediaDetection helpers', () => {
  it('isAudioUrl detects common audio extensions even with query strings', () => {
    expect(isAudioUrl('https://x/y/song.mp3')).toBe(true);
    expect(isAudioUrl('https://x/y/t.wav?token=abc')).toBe(true);
    expect(isAudioUrl('https://x/y/clip.m4a#hash')).toBe(true);
    expect(isAudioUrl('https://x/y/video.mp4')).toBe(false);
    expect(isAudioUrl(null)).toBe(false);
  });

  it('guessAudioMime returns expected MIME by extension', () => {
    expect(guessAudioMime('file.mp3')).toBe('audio/mpeg');
    expect(guessAudioMime('file.wav')).toBe('audio/wav');
    expect(guessAudioMime('file.m4a')).toBe('audio/mp4');
    expect(guessAudioMime('file.aac')).toBe('audio/aac');
    expect(guessAudioMime('file.ogg')).toBe('audio/ogg');
    expect(guessAudioMime('file.mp4')).toBeUndefined();
  });

  it('isAudioFromHints is true for explicit audio mediaValueType', () => {
    expect(isAudioFromHints({ mediaValueType: 'audio_voice' })).toBe(true);
    expect(isAudioFromHints({ mediaValueType: 'audio_music' })).toBe(true);
    expect(isAudioFromHints({ mediaValueType: 'gen_ai_voice' })).toBe(true);
  });

  it('isAudioFromHints is true for semanticType markers', () => {
    expect(isAudioFromHints({ semanticType: 'voiceover' })).toBe(true);
    expect(isAudioFromHints({ semanticType: 'music' })).toBe(true);
    expect(isAudioFromHints({ semanticType: 'sfx' })).toBe(true);
  });

  it('isAudioFromHints is true when contentType is audio/*', () => {
    expect(isAudioFromHints({ contentType: 'audio/mpeg' })).toBe(true);
  });

  it('isAudioFromHints is true when objectName shows audio extension', () => {
    expect(isAudioFromHints({ objectName: 'path/to/voice.aac' })).toBe(true);
  });

  it('deriveSourceAndMime prefers mappingUrl over direct fieldValue', () => {
    const { url, mime } = deriveSourceAndMime({ mappingUrl: 'https://cdn/x/song.mp3', fieldValue: 'https://other', contentType: null });
    expect(url).toBe('https://cdn/x/song.mp3');
    expect(mime).toBe('audio/mpeg');
  });

  it('deriveSourceAndMime uses direct URL when mapping is missing', () => {
    const { url, mime } = deriveSourceAndMime({ mappingUrl: null, fieldValue: 'https://cdn/x/song.wav', contentType: null });
    expect(url).toBe('https://cdn/x/song.wav');
    expect(mime).toBe('audio/wav');
  });
});
