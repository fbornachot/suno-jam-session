// Types partagés du moteur
export type Phrase = string | string[];

export type SliderId = 'grain' | 'saturation' | 'space' | 'tension' | 'hypnosis' | 'roots' | 'placement';
export const SLIDER_IDS: SliderId[] = ['grain', 'saturation', 'space', 'tension', 'hypnosis', 'roots', 'placement'];

export interface LexItem { id: string; label: string; phrase: Phrase; short?: string }
export interface Arc extends LexItem { tags: string[] }
export interface Instrument extends LexItem { role: 'lead' | 'support' | 'low' | 'texture'; solo?: string }
export interface Bucket { max: number; phrase: string }
export interface SliderDef { label: string; buckets: Bucket[] }

export interface Settings {
  territory: string;
  preset: string | null;
  era: string;
  drums: string;
  arc: string;
  signature: string;
  moods: string[];
  bpm: number;
  key: string;
  sliders: Record<SliderId, number>;
  instruments: string[];
  graft: string | null;
  voiceRoom: boolean;
}

export interface Preset {
  id: string;
  label: string;
  ref: string;
  note: string;
  set: Partial<Omit<Settings, 'sliders'>> & { sliders?: Partial<Record<SliderId, number>> };
  detail: string[];
}

export interface Territory {
  id: string;
  label: string;
  blurb: string;
  core: string[];
  tags: string[];
  exclude: string[];
  defaults: Omit<Settings, 'territory' | 'preset' | 'graft' | 'voiceRoom'>;
  grafts: LexItem[];
  far: LexItem[];
  extra: string[];
  presets: Preset[];
}

export interface BannedRule { pattern: string; reason: string }
export interface Rules {
  voiceRoom: string;
  closer: string[];
  closerNoDrums: string;
  fillers: string[];
  banned: BannedRule[];
  artistGuard: string[];
}

export interface Lexicon {
  eras: LexItem[];
  drums: LexItem[];
  arcs: Arc[];
  signatures: LexItem[];
  moods: LexItem[];
  instruments: Instrument[];
  sliders: Record<SliderId, SliderDef>;
  rules: Rules;
}

export type AngleId = 'access' | 'hybrid' | 'risk';

export interface LintIssue { level: 'error' | 'warn'; message: string }

export interface Output {
  angle: AngleId;
  settings: Settings;
  prompt: string;
  styleTags: string;
  structure: string;
  exclude: string;
  lint: LintIssue[];
}
