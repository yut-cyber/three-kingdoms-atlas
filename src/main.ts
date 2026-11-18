import './style.css';
import { CHAPTERS, factionColor, factionName } from './data/map';
import { EVENTS, type EventFaction, type HistoricalEvent } from './data/events';
import { AtlasMap } from './map/atlas';
import { cnNumber } from './lib/svg';

const YEAR_MIN = 184;
const YEAR_MAX = 280;

const $ = <T extends Element>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`missing element: ${selector}`);
  return node;
};

const svg = $<SVGSVGElement>('#atlas');
const yearEl = $<HTMLElement>('#year');
const reignEl = $<HTMLElement>('#reign');
const rangeEl = $<HTMLInputElement>('#range');
const listEl = $<HTMLElement>('#event-list');
const chaptersEl = $<HTMLElement>('#chapters');
const detailEl = $<HTMLElement>('#detail');
const dockEl = $<HTMLElement>('#dock');
const dockCountEl = $<HTMLElement>('#dock-count');
const filtersEl = $<HTMLElement>('#filters');
const playBtn = $<HTMLButtonElement>('#play');
const hintEl = $<HTMLElement>('#hint');
const eraBadgeEl = $<HTMLElement>('#era-badge');
const scaleEl = $<HTMLElement>('#scale');
const warStripEl = $<HTMLElement>('#war-strip');
const dockToggle = $<HTMLButtonElement>('#dock-toggle');

type Filter = 'all' | EventFaction;

const state = {
  year: 208,
  selected: null as string | null,
  filter: 'all' as Filter,
  playing: false,
  labels: true,
  hintDone: false,
};

const atlas = new AtlasMap(svg, {
  onSelectEvent: (id) => selectEvent(id),
});

/* ------------------------------------------------------------------ 年号 */

const REIGNS: [number, string][] = [
  [184, '中平'],
  [190, '初平'],
  [194, '兴平'],
  [196, '建安'],
  [220, '黄初'],
  [226, '太和'],
  [233, '青龙'],
  [237, '景初'],
  [240, '正始'],
  [249, '嘉平'],
  [254, '正元'],
  [256, '甘露'],
  [260, '景元'],
  [264, '咸熙'],
  [265, '泰始'],
  [275, '咸宁'],
  [280, '太康'],
];

function reignOf(year: number): string {
  let seg = REIGNS[0];
  for (const item of REIGNS) {
    if (year >= item[0]) seg = item;
  }
  const n = year - seg[0] + 1;
  return `${seg[1]}${n === 1 ? '元年' : `${cnNumber(n)}年`}`;
}

function chapterOf(year: number) {
  return CHAPTERS.find((c) => year >= c.from && year <= c.to) ?? CHAPTERS[CHAPTERS.length - 1];
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'wei', label: '魏' },
  { id: 'shu', label: '蜀' },
  { id: 'wu', label: '吴' },
  { id: 'qun', label: '群雄' },
  { id: 'jin', label: '晋' },
];

/* ------------------------------------------------------------------ list */

function matches(ev: HistoricalEvent): boolean {
  return state.filter === 'all' || ev.factions.includes(state.filter);
}

function renderFilters(): void {
  filtersEl.innerHTML = '';
  for (const f of FILTERS) {
    const btn = document.createElement('button');
    btn.className = `filter${state.filter === f.id ? ' on' : ''}`;
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      state.filter = f.id;
      renderFilters();
      renderList();
    });
    filtersEl.append(btn);
  }
}

function renderList(): void {
  listEl.innerHTML = '';
  const visible = EVENTS.filter(matches);
  dockCountEl.textContent = `${visible.length} 事`;

  let lastChapter = -1;
  for (const ev of visible) {
    const chapterIndex = CHAPTERS.findIndex((c) => ev.year >= c.from && ev.year <= c.to);
    if (chapterIndex !== lastChapter) {
      const chapter = CHAPTERS[chapterIndex] ?? CHAPTERS[0];
      const block = document.createElement('div');
      block.className = 'chapter-block';
      block.dataset.chapter = String(chapterIndex);
      block.innerHTML = `<div class="chapter-title"><span>${chapter.label}</span><em>${chapter.from} — ${chapter.to}</em></div>`;
      listEl.append(block);
      lastChapter = chapterIndex;
    }
    const block = listEl.lastElementChild as HTMLElement;
    const row = document.createElement('button');
    row.className = 'ev-row';
    row.dataset.id = ev.id;
    row.innerHTML = `<span class="ev-year">${ev.year}</span><span class="ev-name">${ev.title}</span><span class="ev-dot" style="background:${factionColor(ev.factions[0])}"></span>`;
    row.addEventListener('click', () => {
      jumpTo(ev);
    });
    block.append(row);
  }
  syncList();
}

function syncList(): void {
  for (const row of listEl.querySelectorAll<HTMLElement>('.ev-row')) {
    const ev = EVENTS.find((e) => e.id === row.dataset.id);
    if (!ev) continue;
    row.classList.toggle('future', ev.year > state.year);
    row.classList.toggle('on', ev.id === state.selected);
  }
}

/* ------------------------------------------------------------------ chapters */

function renderChapters(): void {
  chaptersEl.innerHTML = '';
  for (const chapter of CHAPTERS) {
    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.textContent = chapter.label;
    btn.style.flexGrow = String(chapter.to - chapter.from + 1);
    btn.addEventListener('click', () => {
      setYear(chapter.from);
      scrollListToChapter(chapter.from);
    });
    chaptersEl.append(btn);
  }

  scaleEl.innerHTML = '';
  for (const year of [184, 200, 220, 240, 260, 280]) {
    const tick = document.createElement('span');
    tick.className = 'tl-tick';
    tick.textContent = String(year);
    tick.style.left = `${((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`;
    scaleEl.append(tick);
  }
}

function scrollListToChapter(year: number): void {
  const idx = CHAPTERS.findIndex((c) => year >= c.from && year <= c.to);
  const block = listEl.querySelector<HTMLElement>(`.chapter-block[data-chapter="${idx}"]`);
  if (block) listEl.scrollTop = Math.max(0, block.offsetTop - 4);
}

/* ------------------------------------------------------------------ detail */

function renderDetail(ev: HistoricalEvent): void {
  const factions = ev.factions
    .map(
      (f) =>
        `<span class="dt-faction"><i style="background:${factionColor(f)}"></i>${factionName(f)}</span>`,
    )
    .join('');
  const figures = ev.figures
    .map((name) => `<span class="dt-figure">${name}</span>`)
    .join('');

  detailEl.innerHTML = `
    <button class="detail-close" aria-label="关闭详情">✕</button>
    <div class="dt-head">
      <div class="dt-year">${ev.year}<span>年</span></div>
      <div class="dt-meta">
        <span class="dt-reign">${ev.reign}</span>
        <div class="dt-factions">${factions}</div>
      </div>
    </div>
    <h3>${ev.title}</h3>
    <div class="dt-place">${ev.place}</div>
    ${
      ev.attacker && ev.defender
        ? `<div class="dt-war"><span class="dw-side">攻</span>${ev.attacker}<span class="dw-arrow">→</span><span class="dw-side">守</span>${ev.defender}</div>`
        : ''
    }
    <div class="dt-divider"></div>
    <p class="dt-summary">${ev.summary}</p>
    <div class="dt-result"><span>结 果</span><p>${ev.result}</p></div>
    <div class="dt-figures"><b>人物</b>${figures}</div>
    ${
      ev.route
        ? `<div class="dt-route-note"><i></i>地图已标注此役行军路线</div>`
        : ''
    }
    <div class="dt-stamp">史</div>
  `;

  detailEl.hidden = false;
  detailEl.querySelector('.detail-close')?.addEventListener('click', closeDetail);
}

function closeDetail(): void {
  state.selected = null;
  detailEl.hidden = true;
  atlas.selectEvent(null);
  syncList();
}

function selectEvent(id: string): void {
  const ev = EVENTS.find((e) => e.id === id);
  if (!ev) return;
  state.selected = ev.id;
  if (ev.year !== state.year) setYear(ev.year);
  atlas.selectEvent(ev);
  renderDetail(ev);
  syncList();
  markHintDone();
}

function jumpTo(ev: HistoricalEvent): void {
  setYear(ev.year);
  selectEvent(ev.id);
  if (window.innerWidth <= 900) {
    dockEl.classList.remove('open');
  }
}

/* ------------------------------------------------------------------ 本年战事 */

/** 当前年份的出兵/对阵，依据史书所载攻守双方 */
function renderWarStrip(year: number): void {
  const todays = EVENTS.filter((ev) => ev.year === year);
  const chips: string[] = [];

  if (todays.length) {
    for (const ev of todays) {
      const war =
        ev.attacker && ev.defender
          ? `<span class="war-side">${ev.attacker}</span><span class="war-arrow">攻</span><span class="war-side">${ev.defender}</span>`
          : `<span class="war-side">${ev.place}</span>`;
      chips.push(
        `<button class="war-chip" data-id="${ev.id}" title="${ev.place} · ${ev.result}">` +
          `<span class="war-title">${ev.title}</span>${war}</button>`,
      );
    }
  } else {
    const prev = [...EVENTS].reverse().find((ev) => ev.year <= year);
    chips.push(
      `<span class="war-none">本年无大战${
        prev ? ` · 上一役 ${prev.year} 年 ${prev.title}` : ''
      }</span>`,
    );
  }

  warStripEl.innerHTML = `<span class="war-label">战事</span><div class="war-body">${chips.join('')}</div>`;
  for (const node of warStripEl.querySelectorAll<HTMLElement>('.war-chip')) {
    node.addEventListener('click', () => {
      const id = node.dataset.id;
      if (id) selectEvent(id);
    });
  }
}

/* ------------------------------------------------------------------ year */

function setYear(year: number): void {
  const next = Math.min(YEAR_MAX, Math.max(YEAR_MIN, year));
  state.year = next;
  rangeEl.value = String(next);
  rangeEl.style.setProperty('--p', `${((next - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%`);
  yearEl.textContent = String(next);
  reignEl.textContent = reignOf(next);
  atlas.setYear(next);

  const chapter = chapterOf(next);
  eraBadgeEl.textContent = chapter.label;
  renderWarStrip(next);
  for (const btn of chaptersEl.querySelectorAll<HTMLElement>('.chapter-btn')) {
    const label = btn.textContent ?? '';
    btn.classList.toggle('on', label === chapter.label);
    const c = CHAPTERS.find((item) => item.label === label);
    btn.classList.toggle('passed', !!c && c.to < next);
  }
  syncList();
}

/* ------------------------------------------------------------------ playback */

let timer: number | undefined;

function setPlaying(on: boolean): void {
  state.playing = on;
  playBtn.classList.toggle('is-playing', on);
  const text = playBtn.querySelector('.play-text');
  if (text) text.textContent = on ? '暂停' : '播放';
  playBtn.setAttribute('aria-label', on ? '暂停时间轴' : '播放时间轴');

  if (on) {
    if (state.year >= YEAR_MAX) setYear(YEAR_MIN);
    timer = window.setInterval(() => {
      if (state.year >= YEAR_MAX) {
        setPlaying(false);
        return;
      }
      setYear(state.year + 1);
    }, 120);
    markHintDone();
  } else if (timer) {
    window.clearInterval(timer);
    timer = undefined;
  }
}

/* ------------------------------------------------------------------ ui bindings */

function markHintDone(): void {
  if (state.hintDone) return;
  state.hintDone = true;
  hintEl.classList.add('gone');
}

rangeEl.addEventListener('input', () => {
  setYear(Number(rangeEl.value));
  markHintDone();
});

playBtn.addEventListener('click', () => setPlaying(!state.playing));

document.querySelectorAll<HTMLButtonElement>('.tools button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const act = btn.dataset.act;
    if (act === 'zoom-in') atlas.zoomBy(1.35);
    if (act === 'zoom-out') atlas.zoomBy(1 / 1.35);
    if (act === 'reset') atlas.resetView();
    if (act === 'labels') {
      state.labels = !state.labels;
      atlas.setLabels(state.labels);
      btn.classList.toggle('on', state.labels);
    }
    markHintDone();
  });
});

dockToggle.addEventListener('click', () => {
  dockEl.classList.toggle('open');
});

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === 'ArrowRight') {
    setYear(state.year + (e.shiftKey ? 10 : 1));
    markHintDone();
  } else if (e.key === 'ArrowLeft') {
    setYear(state.year - (e.shiftKey ? 10 : 1));
    markHintDone();
  } else if (e.code === 'Space') {
    e.preventDefault();
    setPlaying(!state.playing);
  } else if (e.key === 'Escape') {
    closeDetail();
  }
});

window.setTimeout(markHintDone, 9000);

/* ------------------------------------------------------------------ start */

renderFilters();
renderChapters();
renderList();
setYear(state.year);
scrollListToChapter(state.year);

if (window.innerWidth <= 900) {
  // 移动端默认收起索引，先看地图
  dockEl.classList.remove('open');
}
