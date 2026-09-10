import { detectAll } from 'tinyld';
import { languageSubtag, normalizeTag } from './bcp47';

export const DETECT_MIN_CHARS = 40;
export const DETECT_MIN_ACCURACY = 0.55;

export interface Detection {
  language: string;
  accuracy: number;
}

export function detectLanguage(text: string): Detection | null {
  const sample = text.replace(/\s+/g, ' ').trim();
  if (sample.length < DETECT_MIN_CHARS) return null;

  const results = detectAll(sample);
  const top = results[0];
  if (!top?.lang || top.accuracy < DETECT_MIN_ACCURACY) return null;

  return { language: top.lang, accuracy: top.accuracy };
}

export function languageLooksMismatched(
  text: string,
  declaredTag: string,
): { detection: Detection; declaredLanguage: string } | null {
  if (!declaredTag.trim()) return null;
  const detection = detectLanguage(text);
  if (!detection) return null;
  const declaredLanguage = languageSubtag(declaredTag);
  if (!declaredLanguage || declaredLanguage === 'und') return null;
  if (normalizeTag(detection.language) === declaredLanguage) return null;
  return { detection, declaredLanguage };
}
