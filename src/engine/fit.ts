// Ajustement de longueur : cible 900–990 caractères
import { render, type Slot } from './assemble';
import { shuffle, type Rng } from './seed';

export const MIN_LEN = 900;
export const MAX_LEN = 990;

export function fit(slots: Slot[], fillers: string[], rng: Rng): Slot[] {
  let out = [...slots];

  // 1. Trop long : on retire les slots non essentiels, priorité la plus basse d'abord
  while (render(out).length > MAX_LEN) {
    const removable = out.filter((x) => !x.core).sort((a, b) => a.priority - b.priority)[0];
    if (!removable) break;
    out = out.filter((x) => x !== removable);
  }

  // 2. Trop court : on ajoute des descripteurs tant que ça tient sous le plafond
  const pool = shuffle(fillers, rng);
  let i = 0;
  for (const f of pool) {
    if (render(out).length >= MIN_LEN) break;
    const text = f.charAt(0).toUpperCase() + f.slice(1).replace(/\.$/, '') + '.';
    if (out.some((x) => x.text === text)) continue;
    const candidate: Slot = { key: `filler${i}`, order: 70 + i * 0.1, priority: 10, core: false, text };
    if (render([...out, candidate]).length <= MAX_LEN) {
      out.push(candidate);
      i++;
    }
  }
  return out;
}
