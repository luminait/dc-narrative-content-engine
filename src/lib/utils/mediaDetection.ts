// Shared media detection helpers used by both server and client code

export type AudioishParams = {
  mediaValueType?: string | null;
  semanticType?: string | null;
  contentType?: string | null;
  objectName?: string | null;
  url?: string | null;
};

// Detect audio by file extension in URL (ignores query string)
export const isAudioUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const base = url.split('?')[0] ?? '';
  return /\.(mp3|wav|m4a|aac|ogg)$/i.test(base);
};

// Guess audio MIME by extension (from URL)
export const guessAudioMime = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const lower = (url.split('?')[0] ?? '').toLowerCase();
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  return undefined;
};

export const isAudioFromObjectName = (name?: string | null): boolean => {
  if (!name) return false;
  return /\.(mp3|wav|m4a|aac|ogg)$/i.test(name);
};

// Liberal predicate to decide whether something is audio using any available hints
export const isAudioFromHints = ({ mediaValueType, semanticType, contentType, objectName, url }: AudioishParams): boolean => {
  if (contentType && contentType.startsWith('audio/')) return true;
  if (mediaValueType && ['audio_music', 'audio_voice', 'gen_ai_voice'].includes(mediaValueType)) return true;
  if (semanticType && ['voiceover', 'music', 'sfx'].includes(semanticType)) return true;
  if (isAudioFromObjectName(objectName)) return true;
  if (isAudioUrl(url)) return true;
  return false;
};

export type DeriveSourceParams = {
  mappingUrl?: string | null;
  fieldValue?: string | null; // might be a direct URL or an asset_ref
  contentType?: string | null;
};

// Returns best URL and MIME for a media element <source>
export const deriveSourceAndMime = ({ mappingUrl, fieldValue, contentType }: DeriveSourceParams): { url?: string; mime?: string } => {
  const directUrl = fieldValue && /^(https?:)?\/\//i.test(fieldValue) ? fieldValue : undefined;
  const url = mappingUrl || directUrl;
  if (!url) return {};
  const mime = contentType || guessAudioMime(url);
  return { url, mime };
};
