const NS = 'http://www.w3.org/2000/svg';

export type Attrs = Record<string, string | number | undefined>;

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) node.setAttribute(key, String(value));
  }
  return node;
}

export function pointsToPath(pts: [number, number][], close = false): string {
  if (!pts.length) return '';
  const [first, ...rest] = pts;
  let d = `M${first[0].toFixed(2)} ${first[1].toFixed(2)}`;
  for (const [x, y] of rest) d += `L${x.toFixed(2)} ${y.toFixed(2)}`;
  return close ? `${d}Z` : d;
}

/** Catmull-Rom 转贝塞尔，得到柔和的古地图笔触 */
export function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return pointsToPath(pts);
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/** 稳定的伪随机，保证每次渲染山形一致 */
export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function cnNumber(n: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n <= 10) return n === 10 ? '十' : digits[n];
  if (n < 20) return `十${digits[n - 10]}`;
  const tens = Math.floor(n / 10);
  const rest = n % 10;
  return `${digits[tens]}十${rest ? digits[rest] : ''}`;
}
