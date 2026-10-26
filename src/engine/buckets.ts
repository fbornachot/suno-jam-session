// Slider 0–100 → palier lexical
import type { SliderDef } from './types';

export function bucket(def: SliderDef, value: number): string {
  const v = Math.max(0, Math.min(100, value));
  const b = def.buckets.find((x) => v <= x.max) ?? def.buckets[def.buckets.length - 1];
  return b.phrase;
}
