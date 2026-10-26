// Interface : territoire → ADN → réglages → 3 angles
import { territories, lexicon } from '../engine/data';
import { resolve, compileAll, MIN_LEN, MAX_LEN, type Settings, type Territory, type Output, type AngleId, type SliderId } from '../engine';
import { randomSeed } from '../engine/seed';
import { bucket } from '../engine/buckets';

const STORE = 'session-rack:v1';
const KEYS = ['any', ...['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].flatMap((n) => [`${n} minor`, `${n} major`])];
const ANGLE_INFO: Record<AngleId, { name: string; sub: string }> = {
  access: { name: 'Accessible', sub: 'à signature' },
  hybrid: { name: 'Hybride', sub: 'greffe proche' },
  risk: { name: 'Hors zone', sub: 'greffe lointaine' },
};

interface State { territory: string; settings: Settings; seed: number; angle: AngleId }

// --- utilitaires DOM
const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, any> = {}, ...kids: (Node | string | null | false)[]) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el && k !== 'list') (el as any)[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids) if (c !== null && c !== false) el.append(c);
  return el;
};
const byId = <T extends { id: string }>(list: T[], id: string | null | undefined) => list.find((x) => x.id === id);
const label = (list: { id: string; label: string }[], id: string | null) => byId(list, id)?.label ?? '—';
const first = (p: string | string[] | undefined) => (Array.isArray(p) ? p[0] : p ?? '');
const graftsOf = (t: Territory) => [...t.grafts, ...t.far];

// --- état
function load(): State {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (byId(territories, s.territory)) return s;
    }
  } catch { /* stockage indisponible */ }
  const t = territories[0];
  return { territory: t.id, settings: resolve(t, t.presets[0].id), seed: 1, angle: 'access' };
}
const state = load();
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* ignoré */ } };
const terr = (): Territory => byId(territories, state.territory)!;

// --- rendu
const app = document.getElementById('app')!;
const controls = h('div', { class: 'controls_wrapper' });
const output = h('section', { class: 'section_output', 'aria-live': 'polite' });
app.append(controls, output);

function block(ch: string, title: string, hint: string | null, ...body: Node[]) {
  return h('section', { class: 'block' },
    h('div', { class: 'block_head' }, h('span', { class: 'block_ch' }, ch), h('h2', { class: 'heading-style-h2' }, title)),
    hint ? h('p', { class: 'block_hint' }, hint) : null,
    ...body);
}

function renderControls() {
  const t = terr();
  const s = state.settings;
  controls.replaceChildren();

  // 1 · Territoire
  const grid = h('div', { class: 'territory_grid' });
  for (const x of territories) {
    grid.append(h('button', {
      type: 'button', class: `territory_btn${x.id === t.id ? ' is-active' : ''}`, 'aria-pressed': String(x.id === t.id),
      onclick: () => { state.territory = x.id; state.settings = resolve(x, x.presets[0].id); commit(true); },
    }, h('span', { class: 'territory_name' }, x.label), h('span', { class: 'territory_blurb' }, x.blurb)));
  }
  controls.append(block('CH1', 'Territoire', null, grid));

  // 2 · ADN
  const list = h('div', { class: 'preset_list' });
  const presetBtn = (id: string | null, name: string, ref: string, note: string) => h('button', {
    type: 'button', class: `preset_btn${s.preset === id ? ' is-active' : ''}`, 'aria-pressed': String(s.preset === id),
    onclick: () => { state.settings = resolve(t, id); commit(true); },
  }, h('span', { class: 'preset_label' }, name), h('span', { class: 'preset_ref' }, ref), h('span', { class: 'preset_note' }, note));
  t.presets.forEach((p) => list.append(presetBtn(p.id, p.label, p.ref, p.note)));
  list.append(presetBtn(null, 'Base du territoire', '—', 'Réglages par défaut, sans détail de preset.'));
  controls.append(block('CH2', 'ADN', 'La référence nomme le preset ; le prompt ne contient que des descripteurs.', list));

  // 3 · Réglages
  controls.append(block('CH3', 'Réglages', 'Sous chaque réglage, la phrase qu’il ajoute au prompt.',
    group('Forme', () => `${label(lexicon.signatures, s.signature)} · ${label(lexicon.arcs, s.arc)}`, [
      select('Signature à 30 s', lexicon.signatures, s.signature, (v) => (s.signature = v)),
      select('Arc', lexicon.arcs, s.arc, (v) => (s.arc = v)),
    ], true),
    group('Batterie', () => label(lexicon.drums, s.drums), [
      select('Caractère', lexicon.drums, s.drums, (v) => (s.drums = v), true),
      slider('placement', 'Placement', 'humain', 'machine'),
    ], true),
    group('Son', () => label(lexicon.eras, s.era), [
      select('Époque', lexicon.eras, s.era, (v) => (s.era = v), true),
      slider('grain', 'Grain / friction'),
      slider('saturation', 'Saturation'),
      slider('space', 'Espace'),
      slider('roots', 'Racines hard-rock'),
    ]),
    group('Harmonie & tempo', () => `${s.bpm} BPM · ${s.key === 'any' ? 'tonalité libre' : s.key}`, [
      h('div', { class: 'field_row' },
        field('Tempo', h('input', { type: 'number', id: 'bpm', min: 50, max: 180, value: s.bpm, oninput: (e: Event) => { const v = +(e.target as HTMLInputElement).value; if (v >= 50 && v <= 180) { s.bpm = v; commit(); } } })),
        field('Tonalité', h('select', { id: 'key', onchange: (e: Event) => { s.key = (e.target as HTMLSelectElement).value; commit(); } },
          ...KEYS.map((k) => h('option', { value: k, selected: k === s.key }, k === 'any' ? 'Libre' : k))))),
      slider('tension', 'Tension'),
      slider('hypnosis', 'Répétition hypnotique'),
    ]),
    group('Couleur', () => `${s.moods.length} mood · ${s.instruments.length} instr.`, [
      chips('Moods (max 2)', lexicon.moods, () => s.moods, 2),
      chips('Instruments (max 4)', lexicon.instruments, () => s.instruments, 4),
    ]),
    group('Greffe & voix', () => (s.graft ? label(graftsOf(t), s.graft) : 'aucune') + (s.voiceRoom ? ' · place voix' : ''), [
      selectGraft(t, s),
      h('label', { class: 'toggle' },
        h('input', { type: 'checkbox', id: 'voiceRoom', checked: s.voiceRoom, onchange: (e: Event) => { s.voiceRoom = (e.target as HTMLInputElement).checked; commit(); } }),
        'Laisser de la place pour une voix (topline Sonora)'),
    ]),
  ));
}

// --- composants de réglage
const summaries: { el: HTMLElement; fn: () => string }[] = [];
function group(title: string, sum: () => string, kids: Node[], open = false) {
  const el = h('span', { class: 'group_summary' }, sum());
  summaries.push({ el, fn: sum });
  return h('details', { class: 'group', open }, h('summary', {}, title, el), h('div', { class: 'group_body' }, ...kids));
}
function field(name: string, control: Node, value?: HTMLElement) {
  return h('label', { class: 'field' }, h('span', { class: 'field_label' }, name, value ?? null), control);
}
function hint(text: string) {
  return h('span', { class: 'field_hint' }, text ? `→ ${text}` : '→ rien d’ajouté au prompt');
}
function select(name: string, list: { id: string; label: string; phrase?: string | string[] }[], current: string, set: (v: string) => void, preview = false) {
  const id = 'sel-' + name.toLowerCase().replace(/[^a-z]+/g, '-');
  const hn = preview ? hint(first(byId(list, current)?.phrase)) : null;
  const f = field(name, h('select', { id, onchange: (e: Event) => { const v = (e.target as HTMLSelectElement).value; set(v); if (hn) hn.textContent = `→ ${first(byId(list, v)?.phrase)}`; commit(); } },
    ...list.map((x) => h('option', { value: x.id, selected: x.id === current }, x.label))));
  if (hn) f.append(hn);
  return f;
}
function selectGraft(t: Territory, s: Settings) {
  const opt = (g: { id: string; label: string }) => h('option', { value: g.id, selected: s.graft === g.id }, g.label);
  const hn = hint(first(byId(graftsOf(t), s.graft)?.phrase));
  const f = field('Greffe (angle accessible)', h('select', { id: 'graft', onchange: (e: Event) => { const v = (e.target as HTMLSelectElement).value; s.graft = v || null; hn.textContent = s.graft ? `→ ${first(byId(graftsOf(t), v)?.phrase)}` : '→ rien d’ajouté au prompt'; commit(); } },
    h('option', { value: '', selected: !s.graft }, 'Aucune'),
    h('optgroup', { label: 'Proches du territoire' }, ...t.grafts.map(opt)),
    h('optgroup', { label: 'Lointaines (hors zone)' }, ...t.far.map(opt))));
  f.append(hn);
  return f;
}
function slider(key: SliderId, name: string, lo = '', hi = '') {
  const s = state.settings;
  const val = h('span', { class: 'field_value' }, String(s.sliders[key]));
  const hn = hint(bucket(lexicon.sliders[key], s.sliders[key]));
  const input = h('input', { type: 'range', id: 'sl-' + key, min: 0, max: 100, step: 5, value: s.sliders[key],
    oninput: (e: Event) => { s.sliders[key] = +(e.target as HTMLInputElement).value; val.textContent = String(s.sliders[key]); const b = bucket(lexicon.sliders[key], s.sliders[key]); hn.textContent = b ? `→ ${b}` : '→ rien d’ajouté au prompt'; commit(); } });
  const f = field(name, input, val);
  if (lo || hi) f.append(h('span', { class: 'text-size-small', style: 'display:flex;justify-content:space-between' }, h('span', {}, lo), h('span', {}, hi)));
  f.append(hn);
  return f;
}
function chips(name: string, list: { id: string; label: string }[], get: () => string[], max: number) {
  const wrap = h('div', { class: 'chip_list' });
  const draw = () => {
    const cur = get();
    wrap.replaceChildren(...list.map((x) => {
      const on = cur.includes(x.id);
      return h('button', { type: 'button', class: `chip${on ? ' is-active' : ''}`, 'aria-pressed': String(on), disabled: !on && cur.length >= max,
        onclick: () => { const i = cur.indexOf(x.id); if (i >= 0) cur.splice(i, 1); else if (cur.length < max) cur.push(x.id); draw(); commit(); } }, x.label);
    }));
  };
  draw();
  return h('div', { class: 'field' }, h('span', { class: 'field_label' }, name), wrap);
}

// --- sortie
async function copy(btn: HTMLButtonElement, text: string, src: HTMLElement) {
  try { await navigator.clipboard.writeText(text); }
  catch { const r = document.createRange(); r.selectNodeContents(src); const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r); }
  btn.textContent = 'Copié'; btn.classList.add('is-done');
  setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('is-done'); }, 1400);
}
function outBox(title: string, text: string, opts: { main?: boolean; note?: string } = {}) {
  const pre = h('pre', { class: 'out_text' }, text);
  const btn = h('button', { type: 'button', class: 'btn_copy' }, 'Copier') as HTMLButtonElement;
  btn.addEventListener('click', () => copy(btn, text, pre));
  const tools = h('div', { class: 'out_tools' });
  if (opts.main) {
    const len = text.length;
    const cls = len > MAX_LEN ? 'is-err' : len < MIN_LEN ? 'is-warn' : 'is-ok';
    tools.append(h('span', { class: `meter ${cls}` }, `${len} / ${MAX_LEN}`));
  }
  tools.append(btn);
  const box = h('div', { class: `out${opts.main ? ' is-main' : ''}` },
    h('div', { class: 'out_head' }, h('span', { class: 'out_title' }, title, opts.note ? h('small', {}, ` · ${opts.note}`) : null), tools));
  if (opts.main) box.append(h('div', { class: 'vu' }, h('div', { class: 'vu_fill', style: `width:${Math.min(100, (text.length / MAX_LEN) * 100)}%` })));
  box.append(pre);
  return box;
}
function diff(o: Output, base: Settings) {
  const parts: (Node | string)[] = [];
  if (o.settings.graft !== base.graft) parts.push('Greffe : ', h('strong', {}, label(graftsOf(terr()), o.settings.graft)));
  if (o.settings.arc !== base.arc) parts.push(parts.length ? ' · ' : '', 'Arc : ', h('strong', {}, label(lexicon.arcs, o.settings.arc)));
  if (o.settings.signature !== base.signature) parts.push(' · Signature : ', h('strong', {}, label(lexicon.signatures, o.settings.signature)));
  return parts.length ? parts : ['Tes réglages, tels quels.'];
}

function renderOutput() {
  const t = terr();
  const outs = compileAll(state.settings, t, lexicon, state.seed);
  const o = outs.find((x) => x.angle === state.angle)!;
  const tabs = h('div', { class: 'angle_tabs', role: 'tablist' }, ...outs.map((x) => h('button', {
    type: 'button', role: 'tab', class: `angle_tab${x.angle === state.angle ? ' is-active' : ''}`, 'aria-selected': String(x.angle === state.angle),
    onclick: () => { state.angle = x.angle; save(); renderOutput(); },
  }, h('span', { class: 'angle_name' }, ANGLE_INFO[x.angle].name), h('span', { class: 'angle_sub' }, ANGLE_INFO[x.angle].sub))));

  const issues = o.lint.length ? o.lint : [{ level: 'ok', message: 'Aucun anti-attracteur détecté' }];
  output.replaceChildren(
    block('OUT', 'Sortie', null, tabs, h('p', { class: 'angle_diff' }, ...diff(o, state.settings))),
    outBox('Style prompt', o.prompt, { main: true, note: 'champ Style' }),
    h('div', { class: 'output_actions' },
      h('button', { type: 'button', class: 'btn_secondary', onclick: () => { state.seed = randomSeed(); save(); renderOutput(); } }, 'Nouveau tirage'),
      h('span', { class: 'text-size-small', style: 'align-self:center' }, `seed ${state.seed}`)),
    h('div', { class: 'out_grid' },
      outBox('Structure', o.structure, { note: 'champ Lyrics · mode Instrumental activé' }),
      h('div', { style: 'display:grid;gap:14px;min-width:0' },
        outBox('Exclude styles', o.exclude),
        outBox('Style tags', o.styleTags, { note: 'version courte' }))),
    h('ul', { class: 'lint_list' }, ...issues.map((i) => h('li', { class: `lint_item is-${i.level}` }, h('span', { class: 'lint_dot' }), i.message))),
  );
}

function commit(full = false) {
  save();
  if (full) { summaries.length = 0; renderControls(); }
  else summaries.forEach((x) => (x.el.textContent = x.fn()));
  renderOutput();
}

renderControls();
renderOutput();
