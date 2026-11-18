export type LonLat = [number, number];

/** 地图投影范围（经度 91.5–126.5，纬度 17.5–44.5） */
export const EXTENT = { lon0: 91.5, lon1: 126.5, lat0: 17.5, lat1: 44.5 };

import { LAND_RINGS, STATES } from './geo';

/** 真实海岸线（多段闭合环，含台湾、海南等岛屿） */
export const LAND: LonLat[][] = LAND_RINGS;

export interface Region {
  id: string;
  name: string;
  label: LonLat;
  /** 州界多边形（可能含多段，如沿海岛屿） */
  rings: LonLat[][];
}

/** 十三州与辽东、夷洲：州界取自真实历史政区数据（约 262 年），荆州按南北拆分 */
export const REGIONS: Region[] = STATES.map((s) => ({
  id: s.id,
  name: s.name,
  label: s.label,
  rings: s.rings,
}));

export interface River {
  name: string;
  pts: LonLat[];
  width: number;
}

export const RIVERS: River[] = [
  {
    name: '黄河',
    width: 2.2,
    pts: [
      [96.0, 35.0], [98.5, 35.2], [100.5, 35.8], [102.4, 36.1], [103.8, 36.1],
      [105.4, 37.2], [106.6, 38.3], [107.4, 39.8], [109.2, 40.7], [110.7, 40.5],
      [110.9, 39.4], [110.8, 38.0], [110.5, 36.7], [110.4, 35.6], [110.6, 34.7],
      [112.0, 34.8], [113.4, 34.9], [115.0, 35.1], [116.6, 36.2], [117.6, 37.2],
      [118.4, 37.8], [119.1, 37.9],
    ],
  },
  {
    name: '长江',
    width: 2.4,
    pts: [
      [97.4, 32.6], [98.8, 31.0], [100.4, 29.8], [102.0, 28.6], [103.4, 27.6],
      [104.4, 28.6], [105.4, 28.9], [106.5, 29.6], [107.8, 30.4], [109.4, 31.0],
      [110.8, 31.0], [111.6, 30.5], [112.6, 30.3], [114.0, 30.6], [115.5, 30.0],
      [117.0, 30.5], [118.4, 31.3], [119.5, 32.0], [121.0, 31.9], [121.8, 31.4],
    ],
  },
  {
    name: '淮水',
    width: 1.4,
    pts: [
      [113.5, 32.3], [115.0, 32.5], [116.5, 32.6], [118.0, 32.8], [119.4, 33.2],
      [120.2, 33.6],
    ],
  },
  {
    name: '汉水',
    width: 1.4,
    pts: [
      [106.4, 33.2], [108.0, 32.9], [109.4, 32.6], [110.6, 32.3], [111.6, 32.1],
      [112.1, 31.4], [112.5, 30.7], [113.1, 30.5],
    ],
  },
  {
    name: '渭水',
    width: 1.1,
    pts: [
      [104.6, 35.0], [106.4, 34.6], [107.8, 34.3], [109.2, 34.4], [110.2, 34.6],
    ],
  },
  {
    name: '珠江',
    width: 1.3,
    pts: [
      [104.6, 24.5], [106.4, 24.0], [108.4, 23.6], [110.4, 23.1], [112.4, 22.8],
      [113.6, 22.3],
    ],
  },
  {
    name: '辽水',
    width: 1.1,
    pts: [
      [121.0, 42.6], [122.2, 42.2], [123.0, 41.6], [123.3, 40.9], [122.8, 40.4],
    ],
  },
];

/** 山脉走向，用于生成水墨山形 */
export const MOUNTAINS: { pts: LonLat[]; size: number; density: number }[] = [
  // 太行山
  { pts: [[113.0, 35.6], [113.6, 36.4], [113.9, 37.4], [114.0, 38.5], [114.3, 39.6]], size: 1, density: 1 },
  // 秦岭
  { pts: [[105.2, 34.0], [106.8, 33.9], [108.4, 33.9], [109.8, 34.2], [111.0, 34.3]], size: 1.15, density: 1.1 },
  // 大巴山
  { pts: [[106.4, 32.4], [107.8, 32.2], [109.2, 31.8], [110.2, 31.4]], size: 0.9, density: 1 },
  // 阴山
  { pts: [[107.8, 41.0], [109.6, 41.2], [111.4, 41.1], [113.2, 40.9]], size: 0.95, density: 0.9 },
  // 燕山
  { pts: [[115.0, 40.7], [116.4, 40.9], [117.8, 40.7], [119.0, 40.4]], size: 0.85, density: 1 },
  // 横断山
  { pts: [[99.0, 30.0], [99.8, 28.4], [100.6, 26.8], [101.4, 25.4]], size: 1.2, density: 1 },
  // 巫山
  { pts: [[109.0, 31.8], [109.8, 31.2], [110.4, 30.6]], size: 0.9, density: 1.2 },
  // 大别山
  { pts: [[114.0, 31.7], [115.2, 31.6], [116.4, 31.5]], size: 0.75, density: 1 },
  // 泰山
  { pts: [[116.9, 36.4], [117.9, 36.3], [118.6, 36.5]], size: 0.7, density: 1.3 },
  // 华山
  { pts: [[109.8, 34.5], [110.6, 34.6], [111.4, 34.4]], size: 0.75, density: 1.2 },
  // 嵩山
  { pts: [[112.6, 34.4], [113.4, 34.5], [114.2, 34.3]], size: 0.6, density: 1.2 },
  // 五岭
  { pts: [[110.6, 25.4], [112.0, 25.2], [113.4, 25.0], [114.8, 24.8]], size: 0.8, density: 1 },
  // 武夷山
  { pts: [[117.0, 27.8], [117.4, 26.8], [118.0, 25.8]], size: 0.8, density: 1 },
  // 峨眉山
  { pts: [[102.8, 30.0], [103.4, 29.4], [104.0, 28.8]], size: 1.0, density: 0.8 },
  // 岷山
  { pts: [[103.0, 33.4], [103.6, 32.6], [104.0, 31.8]], size: 1.1, density: 0.9 },
  // 昆仑余脉
  { pts: [[95.0, 39.4], [97.0, 38.4], [99.0, 37.4]], size: 1.2, density: 0.8 },
];

export const SEAS: { name: string; at: LonLat; rotate?: number }[] = [
  { name: '渤 海', at: [120.4, 39.2], rotate: -20 },
  { name: '黄 海', at: [123.4, 35.2] },
  { name: '东 海', at: [124.4, 30.2] },
  { name: '南 海', at: [115.4, 19.4] },
];

export type CityTier = 1 | 2 | 3;

export interface City {
  name: string;
  at: LonLat;
  tier: CityTier;
  /** 所属州，用于悬浮提示 */
  region?: string;
}

export const CITIES: City[] = [
  { name: '洛阳', at: [112.45, 34.62], tier: 1, region: '司隶' },
  { name: '长安', at: [108.94, 34.34], tier: 1, region: '司隶' },
  { name: '许昌', at: [113.85, 34.04], tier: 1, region: '豫州' },
  { name: '邺', at: [114.35, 36.33], tier: 1, region: '冀州' },
  { name: '成都', at: [104.07, 30.67], tier: 1, region: '益州' },
  { name: '建业', at: [118.80, 32.06], tier: 1, region: '扬州' },
  { name: '襄阳', at: [112.14, 32.04], tier: 1, region: '荆州北' },
  { name: '江陵', at: [112.19, 30.35], tier: 1, region: '荆州北' },
  { name: '寿春', at: [116.79, 32.58], tier: 1, region: '扬州' },
  { name: '合肥', at: [117.27, 31.86], tier: 1, region: '扬州' },
  { name: '宛', at: [112.53, 33.00], tier: 1, region: '荆州北' },
  { name: '蓟', at: [116.40, 39.90], tier: 1, region: '幽州' },
  { name: '晋阳', at: [112.55, 37.87], tier: 1, region: '并州' },
  { name: '襄平', at: [123.17, 41.27], tier: 1, region: '幽州' },
  { name: '汉中', at: [107.03, 33.07], tier: 1, region: '益州' },

  { name: '下邳', at: [117.96, 34.31], tier: 2, region: '徐州' },
  { name: '小沛', at: [116.94, 34.72], tier: 2, region: '徐州' },
  { name: '濮阳', at: [115.03, 35.76], tier: 2, region: '兖州' },
  { name: '陈留', at: [114.31, 34.80], tier: 2, region: '兖州' },
  { name: '汝南', at: [114.36, 33.00], tier: 2, region: '豫州' },
  { name: '潼关', at: [110.24, 34.54], tier: 2, region: '司隶' },
  { name: '官渡', at: [114.05, 34.55], tier: 2, region: '兖州' },
  { name: '赤壁', at: [113.90, 29.72], tier: 2, region: '荆州北' },
  { name: '夷陵', at: [111.29, 30.69], tier: 2, region: '荆州北' },
  { name: '白帝城', at: [109.46, 31.02], tier: 2, region: '益州' },
  { name: '涪城', at: [104.68, 31.47], tier: 2, region: '益州' },
  { name: '剑阁', at: [105.53, 32.29], tier: 2, region: '益州' },
  { name: '江州', at: [106.55, 29.56], tier: 2, region: '益州' },
  { name: '长沙', at: [112.94, 28.23], tier: 2, region: '荆州南' },
  { name: '吴郡', at: [120.62, 31.30], tier: 2, region: '扬州' },
  { name: '会稽', at: [120.58, 30.00], tier: 2, region: '扬州' },
  { name: '番禺', at: [113.26, 23.13], tier: 2, region: '交州' },
  { name: '交趾', at: [105.85, 21.03], tier: 2, region: '交州' },
  { name: '武威', at: [102.64, 37.93], tier: 2, region: '凉州' },
  { name: '天水', at: [105.72, 34.58], tier: 2, region: '凉州' },
  { name: '陈仓', at: [107.14, 34.36], tier: 2, region: '司隶' },
  { name: '街亭', at: [105.67, 35.00], tier: 2, region: '凉州' },
  { name: '五丈原', at: [107.65, 34.34], tier: 2, region: '司隶' },
  { name: '定军山', at: [106.90, 33.00], tier: 2, region: '益州' },
  { name: '濡须口', at: [117.70, 31.50], tier: 2, region: '扬州' },
  { name: '广陵', at: [119.42, 32.39], tier: 2, region: '徐州' },
  { name: '北海', at: [119.10, 36.71], tier: 2, region: '青州' },
  { name: '零陵', at: [111.62, 26.42], tier: 2, region: '荆州南' },
  { name: '武陵', at: [111.70, 29.03], tier: 2, region: '荆州南' },
  { name: '曲阿', at: [119.60, 32.00], tier: 2, region: '扬州' },
  { name: '夏口', at: [114.30, 30.60], tier: 2, region: '荆州北' },
  { name: '上庸', at: [110.00, 32.30], tier: 2, region: '荆州北' },
  { name: '麦城', at: [111.80, 30.80], tier: 2, region: '荆州北' },
  { name: '阴平', at: [104.30, 32.90], tier: 2, region: '凉州' },
  { name: '白狼山', at: [120.20, 41.20], tier: 2, region: '幽州' },
  { name: '滇池', at: [102.72, 25.00], tier: 2, region: '益州' },

  { name: '巨鹿', at: [115.03, 37.22], tier: 3, region: '冀州' },
  { name: '界桥', at: [115.45, 37.15], tier: 3, region: '冀州' },
  { name: '易京', at: [116.10, 38.98], tier: 3, region: '幽州' },
  { name: '虎牢关', at: [113.20, 34.85], tier: 3, region: '司隶' },
  { name: '白马', at: [114.60, 35.50], tier: 3, region: '兖州' },
  { name: '延津', at: [114.20, 35.30], tier: 3, region: '兖州' },
  { name: '弘农', at: [110.85, 34.52], tier: 3, region: '司隶' },
  { name: '琅琊', at: [118.35, 35.05], tier: 3, region: '徐州' },
  { name: '庐江', at: [117.29, 31.25], tier: 3, region: '扬州' },
  { name: '皖城', at: [116.90, 30.60], tier: 3, region: '扬州' },
  { name: '建安', at: [119.30, 26.08], tier: 3, region: '扬州' },
  { name: '桂阳', at: [113.02, 25.77], tier: 3, region: '荆州南' },
  { name: '祁山', at: [105.18, 34.19], tier: 3, region: '凉州' },
  { name: '金城', at: [103.83, 36.06], tier: 3, region: '凉州' },
  { name: '阳平关', at: [106.05, 33.16], tier: 3, region: '益州' },
  { name: '江油', at: [104.75, 31.78], tier: 3, region: '益州' },
  { name: '绵竹', at: [104.20, 31.34], tier: 3, region: '益州' },
  { name: '雒城', at: [104.40, 30.98], tier: 3, region: '益州' },
  { name: '西陵', at: [111.30, 30.70], tier: 3, region: '荆州北' },
  { name: '沓中', at: [103.20, 34.10], tier: 3, region: '凉州' },
  { name: '酸枣', at: [114.30, 35.20], tier: 3, region: '兖州' },
  { name: '广宗', at: [115.10, 37.07], tier: 3, region: '冀州' },
];

export type OwnerId = 'han' | 'cao' | 'shao' | 'liu' | 'sun' | 'qun' | 'wei' | 'shu' | 'wu' | 'jin';

export interface FactionMeta {
  id: OwnerId;
  name: string;
  color: string;
}

export const FACTIONS: FactionMeta[] = [
  { id: 'han', name: '汉室', color: '#a8823f' },
  { id: 'cao', name: '曹操', color: '#3d6d8c' },
  { id: 'wei', name: '曹魏', color: '#3d6d8c' },
  { id: 'shao', name: '袁绍', color: '#7b5c8a' },
  { id: 'liu', name: '刘氏', color: '#a94a33' },
  { id: 'shu', name: '蜀汉', color: '#a94a33' },
  { id: 'sun', name: '孙吴', color: '#457a5b' },
  { id: 'wu', name: '东吴', color: '#457a5b' },
  { id: 'qun', name: '群雄', color: '#8a7a60' },
  { id: 'jin', name: '西晋', color: '#6a5a80' },
];

export function factionColor(id: OwnerId): string {
  return FACTIONS.find((f) => f.id === id)?.color ?? '#8a7a60';
}

export function factionName(id: OwnerId): string {
  return FACTIONS.find((f) => f.id === id)?.name ?? '群雄';
}

export interface EraTerritory {
  year: number;
  label: string;
  owners: Partial<Record<string, OwnerId>>;
}

export const TERRITORY_ERAS: EraTerritory[] = [
  {
    year: 184,
    label: '汉室倾颓',
    owners: {
      you: 'han',
      ji: 'han',
      bing: 'han',
      si: 'han',
      yong: 'han',
      liang: 'han',
      qing: 'han',
      yan: 'han',
      xu: 'han',
      yu: 'han',
      yi: 'han',
      nanzhong: 'han',
      jingbei: 'han',
      jingnan: 'han',
      yang: 'han',
      guang: 'han',
      jiao: 'han',
      liaodong: 'han',
      yizhou: 'han',
      xiyu: 'han',
    },
  },
  {
    year: 190,
    label: '群雄讨董',
    owners: {
      you: 'han',
      ji: 'han',
      bing: 'han',
      si: 'qun',
      yong: 'han',
      liang: 'han',
      qing: 'han',
      yan: 'han',
      xu: 'han',
      yu: 'han',
      yi: 'han',
      nanzhong: 'han',
      jingbei: 'han',
      jingnan: 'han',
      yang: 'han',
      guang: 'han',
      jiao: 'han',
      liaodong: 'han',
      yizhou: 'han',
      xiyu: 'han',
    },
  },
  {
    year: 196,
    label: '挟天子以令诸侯',
    owners: {
      you: 'shao',
      ji: 'shao',
      bing: 'shao',
      si: 'cao',
      yong: 'qun',
      liang: 'qun',
      qing: 'shao',
      yan: 'cao',
      xu: 'qun',
      yu: 'cao',
      yi: 'liu',
      nanzhong: 'liu',
      jingbei: 'liu',
      jingnan: 'liu',
      yang: 'sun',
      guang: 'qun',
      jiao: 'qun',
      liaodong: 'qun',
      yizhou: 'qun',
      xiyu: 'han',
    },
  },
  {
    year: 200,
    label: '官渡对峙',
    owners: {
      you: 'shao',
      ji: 'shao',
      bing: 'shao',
      si: 'cao',
      yong: 'qun',
      liang: 'qun',
      qing: 'shao',
      yan: 'cao',
      xu: 'cao',
      yu: 'cao',
      yi: 'liu',
      nanzhong: 'liu',
      jingbei: 'liu',
      jingnan: 'liu',
      yang: 'sun',
      guang: 'qun',
      jiao: 'qun',
      liaodong: 'qun',
      yizhou: 'qun',
      xiyu: 'han',
    },
  },
  {
    year: 208,
    label: '赤壁鏖兵',
    owners: {
      you: 'cao',
      ji: 'cao',
      bing: 'cao',
      si: 'cao',
      yong: 'cao',
      liang: 'cao',
      qing: 'cao',
      yan: 'cao',
      xu: 'cao',
      yu: 'cao',
      yi: 'liu',
      nanzhong: 'liu',
      jingbei: 'liu',
      jingnan: 'liu',
      yang: 'sun',
      guang: 'sun',
      jiao: 'sun',
      liaodong: 'cao',
      yizhou: 'sun',
      xiyu: 'han',
    },
  },
  {
    year: 219,
    label: '三分之势',
    owners: {
      you: 'wei',
      ji: 'wei',
      bing: 'wei',
      si: 'wei',
      yong: 'wei',
      liang: 'wei',
      qing: 'wei',
      yan: 'wei',
      xu: 'wei',
      yu: 'wei',
      yi: 'shu',
      nanzhong: 'shu',
      jingbei: 'wei',
      jingnan: 'wu',
      yang: 'wu',
      guang: 'wu',
      jiao: 'wu',
      liaodong: 'wei',
      yizhou: 'wu',
      xiyu: 'wei',
    },
  },
  {
    year: 234,
    label: '诸葛亮北伐',
    owners: {
      you: 'wei',
      ji: 'wei',
      bing: 'wei',
      si: 'wei',
      yong: 'wei',
      liang: 'wei',
      qing: 'wei',
      yan: 'wei',
      xu: 'wei',
      yu: 'wei',
      yi: 'shu',
      nanzhong: 'shu',
      jingbei: 'wei',
      jingnan: 'wu',
      yang: 'wu',
      guang: 'wu',
      jiao: 'wu',
      liaodong: 'wei',
      yizhou: 'wu',
      xiyu: 'wei',
    },
  },
  {
    year: 249,
    label: '高平陵之变',
    owners: {
      you: 'wei',
      ji: 'wei',
      bing: 'wei',
      si: 'wei',
      yong: 'wei',
      liang: 'wei',
      qing: 'wei',
      yan: 'wei',
      xu: 'wei',
      yu: 'wei',
      yi: 'shu',
      nanzhong: 'shu',
      jingbei: 'wei',
      jingnan: 'wu',
      yang: 'wu',
      guang: 'wu',
      jiao: 'wu',
      liaodong: 'wei',
      yizhou: 'wu',
      xiyu: 'wei',
    },
  },
  {
    year: 263,
    label: '魏灭蜀汉',
    owners: {
      you: 'wei',
      ji: 'wei',
      bing: 'wei',
      si: 'wei',
      yong: 'wei',
      liang: 'wei',
      qing: 'wei',
      yan: 'wei',
      xu: 'wei',
      yu: 'wei',
      yi: 'wei',
      nanzhong: 'wei',
      jingbei: 'wei',
      jingnan: 'wu',
      yang: 'wu',
      guang: 'wu',
      jiao: 'wu',
      liaodong: 'wei',
      yizhou: 'wu',
      xiyu: 'wei',
    },
  },
  {
    year: 280,
    label: '三家归晋',
    owners: {
      you: 'jin',
      ji: 'jin',
      bing: 'jin',
      si: 'jin',
      yong: 'jin',
      liang: 'jin',
      qing: 'jin',
      yan: 'jin',
      xu: 'jin',
      yu: 'jin',
      yi: 'jin',
      nanzhong: 'jin',
      jingbei: 'jin',
      jingnan: 'jin',
      yang: 'jin',
      guang: 'jin',
      jiao: 'jin',
      liaodong: 'jin',
      yizhou: 'jin',
      xiyu: 'jin',
    },
  },
];

export interface TimelineChapter {
  from: number;
  to: number;
  label: string;
}

/** 时间轴章节 */
export const CHAPTERS: TimelineChapter[] = [
  { from: 184, to: 189, label: '汉室倾颓' },
  { from: 190, to: 199, label: '群雄并起' },
  { from: 200, to: 207, label: '官渡河北' },
  { from: 208, to: 220, label: '赤壁三分' },
  { from: 221, to: 234, label: '夷陵北伐' },
  { from: 235, to: 263, label: '司马代兴' },
  { from: 264, to: 280, label: '三家归晋' },
];
