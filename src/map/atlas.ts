import {
  CITIES,
  ERA_LEADERS,
  FACTIONS,
  LAND,
  MOUNTAINS,
  REGIONS,
  RIVERS,
  SEAS,
  TERRITORY_ERAS,
  factionColor,
} from '../data/map';
import { EVENTS, eventCoord, eventRoute, type HistoricalEvent } from '../data/events';
import { Projection, VIEW } from '../lib/projection';
import { pointsToPath, rand, smoothPath, svgEl } from '../lib/svg';

interface AtlasHandlers {
  onSelectEvent: (id: string) => void;
}

const CREAM = '#f7eedb';

/** 多段闭合环 → 单条 path（用于海岸线与州界） */
function ringsToPath(rings: [number, number][][], proj: Projection): string {
  return rings.map((r) => pointsToPath(r.map((p) => proj.project(p)), true)).join(' ');
}

/** 中原城池密集，手工调整标签方位避免压字 */
const LABEL_POS: Record<string, 't' | 'b' | 'l' | 'r'> = {
  洛阳: 't',
  长安: 'b',
  许昌: 'b',
  邺: 't',
  宛: 'l',
  陈留: 'l',
  濮阳: 'l',
  官渡: 'r',
  汝南: 'b',
  小沛: 'r',
  下邳: 'r',
  寿春: 'r',
  合肥: 'b',
  襄阳: 'l',
  江陵: 'l',
  夏口: 'r',
  长沙: 'b',
  汉中: 't',
  天水: 'l',
  街亭: 'l',
  祁山: 'b',
  五丈原: 'b',
  陈仓: 'l',
  潼关: 'l',
  弘农: 'r',
  虎牢关: 'r',
  冀州: 't',
  巨鹿: 't',
  易京: 't',
  蓟: 't',
  晋阳: 't',
  襄平: 't',
  北海: 't',
  广陵: 'r',
  吴郡: 'r',
  会稽: 'r',
  建业: 'r',
  曲阿: 'r',
  濡须口: 'r',
  庐江: 'l',
  皖城: 'r',
  建安: 'r',
  番禺: 'r',
  交趾: 'l',
  零陵: 'l',
  武陵: 'l',
  桂阳: 'r',
  成都: 't',
  江州: 'b',
  涪城: 't',
  剑阁: 'l',
  阴平: 'l',
  江油: 'l',
  绵竹: 'l',
  雒城: 'r',
  白帝城: 'b',
  赤壁: 'r',
  夷陵: 'l',
  上庸: 'r',
  麦城: 'l',
  武威: 't',
  金城: 't',
  白狼山: 't',
};

function sampleLine(pts: [number, number][], step: number): { at: [number, number]; angle: number }[] {
  const out: { at: [number, number]; angle: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / step));
    for (let j = 0; j < n; j++) {
      const t = j / n;
      out.push({ at: [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t], angle: Math.atan2(y2 - y1, x2 - x1) });
    }
  }
  return out;
}

export class AtlasMap {
  private proj = new Projection();
  private world: SVGGElement;
  private regionFills = new Map<string, SVGPathElement>();
  private pins = new Map<string, SVGGElement>();
  private leaderGroups: { year: number; g: SVGGElement }[] = [];
  private routeLayer: SVGGElement;
  private selectedId: string | null = null;
  private zoom = 1;
  private tx = 0;
  private ty = 0;
  private dragging = false;
  private dragStart: { x: number; y: number; tx: number; ty: number } | null = null;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly handlers: AtlasHandlers,
  ) {
    svg.setAttribute('viewBox', `0 0 ${VIEW.width} ${VIEW.height}`);
    this.buildDefs();
    this.buildSea();
    this.world = svgEl('g', { class: 'world' });
    svg.append(this.world);
    this.buildLand();
    this.buildTerritories();
    this.buildGrid();
    this.buildMountains();
    this.buildRivers();
    this.buildRegionBorders();
    this.buildRegionLabels();
    this.buildLeaders();
    this.buildCities();
    this.routeLayer = svgEl('g', { class: 'route-layer' });
    this.world.append(this.routeLayer);
    this.buildEvents();
    this.bindPanZoom();
  }

  /* ------------------------------------------------------------------ defs */

  private buildDefs(): void {
    const defs = svgEl('defs');

    const sea = svgEl('linearGradient', { id: 'seaGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
    sea.append(
      svgEl('stop', { offset: '0%', 'stop-color': '#e2e9dd' }),
      svgEl('stop', { offset: '55%', 'stop-color': '#d9e3d8' }),
      svgEl('stop', { offset: '100%', 'stop-color': '#cedbd2' }),
    );
    defs.append(sea);

    const land = svgEl('radialGradient', { id: 'landGrad', cx: '46%', cy: '38%', r: '78%' });
    land.append(
      svgEl('stop', { offset: '0%', 'stop-color': '#fdf7e8' }),
      svgEl('stop', { offset: '62%', 'stop-color': '#f9f0dd' }),
      svgEl('stop', { offset: '100%', 'stop-color': '#f0e3c9' }),
    );
    defs.append(land);

    const noise = svgEl('filter', {
      id: 'landInk',
      x: '-8%',
      y: '-8%',
      width: '116%',
      height: '116%',
    });
    noise.append(
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: '0.035',
        numOctaves: '2',
        seed: '11',
        result: 'noise',
      }),
      svgEl('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'noise',
        scale: '4',
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: 'rough',
      }),
      svgEl('feDropShadow', {
        in: 'rough',
        dx: '0',
        dy: '6',
        stdDeviation: '9',
        'flood-color': '#4a3620',
        'flood-opacity': '0.16',
      }),
    );
    defs.append(noise);

    const rough = svgEl('filter', { id: 'rough', x: '-6%', y: '-6%', width: '112%', height: '112%' });
    rough.append(
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: '0.05',
        numOctaves: '2',
        seed: '4',
        result: 'n2',
      }),
      svgEl('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'n2',
        scale: '2.4',
        xChannelSelector: 'R',
        yChannelSelector: 'G',
      }),
    );
    defs.append(rough);

    const wash = svgEl('filter', { id: 'wash', x: '-10%', y: '-10%', width: '120%', height: '120%' });
    wash.append(svgEl('feGaussianBlur', { stdDeviation: '5' }));
    defs.append(wash);

    const clip = svgEl('clipPath', { id: 'landClip' });
    clip.append(svgEl('path', { d: ringsToPath(LAND, this.proj) }));
    defs.append(clip);

    for (const f of FACTIONS) {
      const marker = svgEl('marker', {
        id: `arrow-${f.id}`,
        viewBox: '0 0 8 8',
        refX: '6.4',
        refY: '4',
        markerWidth: '5.2',
        markerHeight: '5.2',
        orient: 'auto-start-reverse',
      });
      marker.append(svgEl('path', { d: 'M0.5 1 L7 4 L0.5 7 Z', fill: f.color }));
      defs.append(marker);
    }

    this.svg.append(defs);
  }

  private buildSea(): void {
    const sea = svgEl('g', { class: 'sea' });
    sea.append(
      svgEl('rect', {
        x: 0,
        y: 0,
        width: VIEW.width,
        height: VIEW.height,
        fill: 'url(#seaGrad)',
      }),
    );

    const wavePositions: [number, number, number, number][] = [
      [122.4, 36.6, 0.9, 0],
      [124.2, 33.6, 1, -8],
      [123.0, 30.4, 0.9, 6],
      [123.4, 26.4, 0.85, 0],
      [120.6, 23.4, 0.8, -6],
      [116.0, 20.6, 0.9, 4],
      [111.0, 19.4, 0.85, 0],
      [107.2, 19.0, 0.8, -4],
      [125.0, 39.6, 0.8, 8],
      [119.0, 41.8, 0.7, -10],
      [121.4, 43.2, 0.7, 0],
      [106.0, 16.6, 0.75, 0],
    ];

    for (const [lon, lat, s, rot] of wavePositions) {
      const [x, y] = this.proj.project([lon, lat]);
      const g = svgEl('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
      for (let row = 0; row < 2; row++) {
        const path = svgEl('path', {
          d: `M${-26} ${row * 9} q6 -5 12 0 t12 0 t12 0 t12 0`,
          fill: 'none',
          stroke: '#7d948a',
          'stroke-width': '1',
          opacity: row === 0 ? '0.45' : '0.3',
          'stroke-linecap': 'round',
        });
        g.append(path);
      }
      sea.append(g);
    }

    for (const label of SEAS) {
      const [x, y] = this.proj.project(label.at);
      const t = svgEl('text', {
        x,
        y,
        class: 'sea-label',
        transform: `rotate(${label.rotate ?? 0} ${x} ${y})`,
      });
      t.textContent = label.name;
      sea.append(t);
    }

    this.svg.append(sea);
  }

  private buildLand(): void {
    const d = ringsToPath(LAND, this.proj);
    const g = svgEl('g', { class: 'land' });
    g.append(
      svgEl('path', {
        d,
        fill: 'url(#landGrad)',
        filter: 'url(#landInk)',
        stroke: '#5e492c',
        'stroke-width': '1.35',
        'stroke-opacity': '0.85',
      }),
      svgEl('path', {
        d,
        fill: 'none',
        stroke: '#7c6744',
        'stroke-width': '5',
        'stroke-opacity': '0.13',
      }),
    );
    this.world.append(g);
  }

  private buildTerritories(): void {
    const g = svgEl('g', { class: 'territories', 'clip-path': 'url(#landClip)', filter: 'url(#wash)' });
    for (const region of REGIONS) {
      const path = svgEl('path', {
        d: ringsToPath(region.rings, this.proj),
        fill: factionColor('han'),
        'fill-opacity': '0.14',
        class: 'region-fill',
      });
      this.regionFills.set(region.id, path);
      g.append(path);
    }
    this.world.append(g);
  }

  /** 计里画方：古地图常见的方格网 */
  private buildGrid(): void {
    const g = svgEl('g', { class: 'grid', 'clip-path': 'url(#landClip)' });
    for (let x = 40; x < VIEW.width; x += 64) {
      g.append(svgEl('line', { x1: x, y1: 0, x2: x, y2: VIEW.height, class: 'grid-line' }));
    }
    for (let y = 40; y < VIEW.height; y += 64) {
      g.append(svgEl('line', { x1: 0, y1: y, x2: VIEW.width, y2: y, class: 'grid-line' }));
    }
    this.world.append(g);
  }

  private buildMountains(): void {
    const g = svgEl('g', { class: 'mountains' });
    let seed = 1;
    for (const range of MOUNTAINS) {
      const pts = sampleLine(range.pts.map((p) => this.proj.project(p)), 11);
      for (const { at, angle } of pts) {
        const r1 = rand(seed++);
        const r2 = rand(seed++);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);
        const x = at[0] + perpX * (r1 - 0.5) * 13;
        const y = at[1] + perpY * (r2 - 0.5) * 13;
        const h = (7 + r1 * 5) * range.size;
        const w = (5.5 + r2 * 2.5) * range.size;
        g.append(
          svgEl('path', {
            d: `M${(x - w).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y - h).toFixed(1)}L${(x + w).toFixed(1)} ${y.toFixed(1)}`,
            class: 'mtn',
          }),
          svgEl('path', {
            d: `M${(x - w * 0.45).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y - h * 0.5).toFixed(1)}L${(x + w * 0.45).toFixed(1)} ${y.toFixed(1)}`,
            class: 'mtn mtn-in',
          }),
        );
      }
    }
    this.world.append(g);
  }

  private buildRivers(): void {
    const g = svgEl('g', { class: 'rivers' });
    for (const river of RIVERS) {
      const d = smoothPath(river.pts.map((p) => this.proj.project(p)));
      g.append(
        svgEl('path', {
          d,
          class: 'river-bleed',
          'stroke-width': river.width * 3.2,
        }),
        svgEl('path', {
          d,
          class: 'river',
          'stroke-width': river.width,
        }),
      );
    }
    this.world.append(g);
  }

  private buildRegionBorders(): void {
    const g = svgEl('g', { class: 'region-borders', filter: 'url(#rough)' });
    for (const region of REGIONS) {
      g.append(
        svgEl('path', {
          d: ringsToPath(region.rings, this.proj),
          class: 'region-border',
        }),
      );
    }
    this.world.append(g);
  }

  private buildRegionLabels(): void {
    const g = svgEl('g', { class: 'region-labels' });
    for (const region of REGIONS) {
      const [x, y] = this.proj.project(region.label);
      const text = svgEl('text', { x, y, class: 'region-label' });
      [...region.name].forEach((ch, i) => {
        const tspan = svgEl('tspan', {
          x,
          dy: i === 0 ? -((region.name.length - 1) * 16) / 2 : 16,
        });
        tspan.textContent = ch;
        text.append(tspan);
      });
      g.append(text);
    }

    const jing = [
      { name: '荆', at: [111.6, 32.4] as [number, number] },
      { name: '荆', at: [111.4, 27.5] as [number, number] },
    ];
    jing.forEach((item, idx) => {
      const [x, y] = this.proj.project(item.at);
      const text = svgEl('text', { x, y: y - 8, class: 'region-label' });
      text.textContent = item.name;
      g.append(text);
      const sub = svgEl('text', { x: x + 18, y: y + 6, class: 'region-sub' });
      sub.textContent = idx === 0 ? '北' : '南';
      g.append(sub);
    });
    this.world.append(g);
  }

  /** 势力主导者：随年份显示「谁在领导」 */
  private buildLeaders(): void {
    for (const era of ERA_LEADERS) {
      const g = svgEl('g', { class: 'leader-layer' });
      for (const leader of era.items) {
        const [x, y] = this.proj.project(leader.at);
        const text = svgEl('text', {
          x,
          y,
          class: 'leader-label',
          fill: factionColor(leader.faction),
        });
        text.textContent = leader.name;
        g.append(text);
      }
      this.world.append(g);
      this.leaderGroups.push({ year: era.year, g });
    }
  }

  private buildCities(): void {
    const g = svgEl('g', { class: 'cities' });
    for (const city of [...CITIES].sort((a, b) => a.tier - b.tier)) {
      const [x, y] = this.proj.project(city.at);
      const node = svgEl('g', { class: `city city-t${city.tier}`, transform: `translate(${x} ${y})` });
      node.append(
        svgEl('circle', { r: city.tier === 1 ? 4.6 : 3.6, class: 'city-halo' }),
        svgEl('circle', { r: city.tier === 1 ? 2.5 : 1.9, class: 'city-dot' }),
      );
      if (city.tier !== 3) {
        const pos = LABEL_POS[city.name] ?? 't';
        const dx = pos === 'l' ? -7 : pos === 'r' ? 7 : 0;
        const dy = pos === 'b' ? 15 : pos === 'l' || pos === 'r' ? 3.5 : -9;
        const anchor = pos === 'l' ? 'end' : pos === 'r' ? 'start' : 'middle';
        const label = svgEl('text', {
          x: dx,
          y: dy,
          'text-anchor': anchor,
          class: `city-label ${city.tier === 1 ? 'city-label-1' : 'city-label-2'}`,
        });
        label.textContent = city.name;
        node.append(label);
      }
      const title = svgEl('title');
      title.textContent = city.region ? `${city.name} · ${city.region}` : city.name;
      node.append(title);
      g.append(node);
    }
    this.world.append(g);
  }

  private buildEvents(): void {
    const g = svgEl('g', { class: 'events' });
    for (const ev of EVENTS) {
      const [x, y] = this.proj.project(eventCoord(ev));
      const color = factionColor(ev.factions[0]);
      const node = svgEl('g', {
        class: `event-pin imp-${ev.importance}`,
        'data-id': ev.id,
        transform: `translate(${x} ${y})`,
      });
      node.append(
        svgEl('circle', { r: 8.5, class: 'pin-halo', fill: color }),
        svgEl('circle', { r: 5.4, class: 'pin-ring', stroke: color }),
        svgEl('circle', { r: 2.4, class: 'pin-core', fill: color }),
        svgEl('circle', { r: 10.5, class: 'pin-sel', stroke: color }),
      );
      if (ev.importance === 3) {
        const label = svgEl('text', { y: -14, class: 'pin-label' });
        label.textContent = ev.title;
        node.append(label);
      }
      const hit = svgEl('circle', { r: 15, class: 'pin-hit' });
      node.append(hit);
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handlers.onSelectEvent(ev.id);
      });
      this.pins.set(ev.id, node);
      g.append(node);
    }
    this.world.append(g);
  }

  /* ------------------------------------------------------------------ state */

  setYear(year: number): void {
    const era = [...TERRITORY_ERAS].reverse().find((e) => e.year <= year) ?? TERRITORY_ERAS[0];
    for (const [id, path] of this.regionFills) {
      const owner = era.owners[id];
      if (!owner) continue;
      path.setAttribute('fill', factionColor(owner));
      path.setAttribute('fill-opacity', owner === 'han' ? '0.14' : '0.7');
    }

    const leaders = [...this.leaderGroups].reverse().find((item) => item.year <= year) ?? this.leaderGroups[0];
    for (const item of this.leaderGroups) {
      item.g.classList.toggle('is-on', item === leaders);
    }

    for (const ev of EVENTS) {
      const node = this.pins.get(ev.id);
      if (!node) continue;
      const past = ev.year <= year;
      const near = past && year - ev.year <= 2;
      node.classList.toggle('is-hidden', !past);
      node.classList.toggle('is-near', near);
      node.classList.toggle('is-past', past && !near);
      node.classList.toggle('is-selected', ev.id === this.selectedId);
    }
  }

  selectEvent(ev: HistoricalEvent | null): void {
    this.selectedId = ev?.id ?? null;
    for (const [id, node] of this.pins) {
      node.classList.toggle('is-selected', id === this.selectedId);
    }
    this.drawRoute(ev);
  }

  private drawRoute(ev: HistoricalEvent | null): void {
    this.routeLayer.replaceChildren();
    if (!ev) return;
    const coords = eventRoute(ev);
    if (!coords) return;
    const pts = coords.map((p) => this.proj.project(p));
    const color = factionColor(ev.factions[0]);
    const d = smoothPath(pts);

    this.routeLayer.append(
      svgEl('path', {
        d,
        fill: 'none',
        stroke: color,
        'stroke-width': '7',
        'stroke-opacity': '0.14',
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d,
        class: 'route-line',
        fill: 'none',
        stroke: color,
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'marker-end': `url(#arrow-${ev.factions[0]})`,
      }),
    );

    for (const [i, p] of pts.entries()) {
      if (i === 0) {
        const [x, y] = p;
        this.routeLayer.append(
          svgEl('circle', { cx: x, cy: y, r: 3.6, fill: CREAM, stroke: color, 'stroke-width': '1.6' }),
          svgEl('circle', { cx: x, cy: y, r: 1.4, fill: color, opacity: '0.8' }),
        );
      } else if (i < pts.length - 1) {
        this.routeLayer.append(
          svgEl('circle', { cx: p[0], cy: p[1], r: 2.2, fill: '#f7eedb', stroke: color, 'stroke-width': '1' }),
        );
      }
    }
  }

  setLabels(visible: boolean): void {
    this.svg.classList.toggle('labels-hidden', !visible);
  }

  resetView(): void {
    this.zoom = 1;
    this.tx = 0;
    this.ty = 0;
    this.applyTransform();
  }

  zoomBy(factor: number): void {
    this.zoomAt(factor, VIEW.width / 2, VIEW.height / 2);
  }

  private applyTransform(): void {
    this.world.setAttribute(
      'transform',
      `translate(${this.tx.toFixed(2)} ${this.ty.toFixed(2)}) scale(${this.zoom.toFixed(3)})`,
    );
    this.svg.classList.toggle('is-zoomed', this.zoom > 1.02);
  }

  private zoomAt(factor: number, cx: number, cy: number): void {
    const next = Math.min(3.2, Math.max(1, this.zoom * factor));
    if (next === this.zoom) return;
    const k = next / this.zoom;
    this.tx = cx - k * (cx - this.tx);
    this.ty = cy - k * (cy - this.ty);
    this.zoom = next;
    this.clampPan();
    this.applyTransform();
  }

  private clampPan(): void {
    const minX = VIEW.width * (1 - this.zoom);
    const minY = VIEW.height * (1 - this.zoom);
    this.tx = Math.min(0, Math.max(minX, this.tx));
    this.ty = Math.min(0, Math.max(minY, this.ty));
  }

  private toViewBox(clientX: number, clientY: number): [number, number] {
    const rect = this.svg.getBoundingClientRect();
    const scale = Math.min(rect.width / VIEW.width, rect.height / VIEW.height);
    const offsetX = (rect.width - VIEW.width * scale) / 2;
    const offsetY = (rect.height - VIEW.height * scale) / 2;
    return [(clientX - rect.left - offsetX) / scale, (clientY - rect.top - offsetY) / scale];
  }

  private bindPanZoom(): void {
    const svg = this.svg;
    svg.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const [x, y] = this.toViewBox(e.clientX, e.clientY);
        const factor = Math.exp(-e.deltaY * 0.0012);
        this.zoomAt(factor, x, y);
      },
      { passive: false },
    );

    svg.addEventListener('pointerdown', (e) => {
      if (this.zoom <= 1.02) return;
      this.dragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty };
      svg.setPointerCapture(e.pointerId);
      svg.classList.add('is-dragging');
    });

    svg.addEventListener('pointermove', (e) => {
      if (!this.dragging || !this.dragStart) return;
      const rect = svg.getBoundingClientRect();
      const scale = Math.min(rect.width / VIEW.width, rect.height / VIEW.height);
      this.tx = this.dragStart.tx + (e.clientX - this.dragStart.x) / scale;
      this.ty = this.dragStart.ty + (e.clientY - this.dragStart.y) / scale;
      this.clampPan();
      this.applyTransform();
    });

    const stop = () => {
      this.dragging = false;
      this.dragStart = null;
      svg.classList.remove('is-dragging');
    };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);
    svg.addEventListener('pointerleave', stop);
  }
}
