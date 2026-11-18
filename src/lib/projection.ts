import type { LonLat } from '../data/map';
import { EXTENT } from '../data/map';

export const VIEW = { width: 1200, height: 1080 };

/**
 * 极简等距圆柱投影（按中纬度余弦压缩经度）。
 * 不使用在线瓦片，保证古地图观感与离线可用。
 */
export class Projection {
  readonly scale: number;
  private readonly lon0 = EXTENT.lon0;
  private readonly lat1 = EXTENT.lat1;
  private readonly offX: number;
  private readonly offY: number;
  private readonly k = Math.cos((31 * Math.PI) / 180);

  constructor(padX = 44, padY = 34) {
    const spanX = (EXTENT.lon1 - EXTENT.lon0) * this.k;
    const spanY = EXTENT.lat1 - EXTENT.lat0;
    this.scale = Math.min((VIEW.width - padX * 2) / spanX, (VIEW.height - padY * 2) / spanY);
    this.offX = (VIEW.width - spanX * this.scale) / 2;
    this.offY = (VIEW.height - spanY * this.scale) / 2;
  }

  project([lon, lat]: LonLat): [number, number] {
    return [
      this.offX + (lon - this.lon0) * this.k * this.scale,
      this.offY + (this.lat1 - lat) * this.scale,
    ];
  }
}
