// Chargement de la palette (JSON embarqués au build)
import type { Lexicon, Territory } from './types';
import eras from '../../data/lexicon/eras.json';
import drums from '../../data/lexicon/drums.json';
import arcs from '../../data/lexicon/arcs.json';
import signatures from '../../data/lexicon/signatures.json';
import moods from '../../data/lexicon/moods.json';
import instruments from '../../data/lexicon/instruments.json';
import sliders from '../../data/lexicon/sliders.json';
import rules from '../../data/lexicon/rules.json';

const files = import.meta.glob('../../data/territories/*.json', { eager: true, import: 'default' });

export const territories: Territory[] = Object.keys(files)
  .sort()
  .map((k) => files[k] as Territory);

export const lexicon = {
  eras, drums, arcs, signatures, moods, instruments, sliders, rules,
} as unknown as Lexicon;
