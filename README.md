# 三国历史地图 · 事件图

以一张宣纸古地图，重读公元 184—280 年的三国。

**[在线预览 →](https://yut-cyber.github.io/three-kingdoms-atlas/)**

从黄巾之乱到三家归晋，五十个关键事件按时间轴次第展开：势力版图随年代晕染变化，城池、山川、州界皆为手绘式矢量；点击事件可查看始末、人物与结果，官渡、赤壁、夷陵、北伐、灭蜀、灭吴等战役还会在地图上绘出行军路线。

## 特性

- **古地图视觉**：宣纸底纹、水墨山形、朱砂印章、宋楷字体，州界与水系均为简化矢量，不依赖在线地图瓦片。
- **时间轴 184—280**：拖动、播放或键盘左右键推进；版图按「汉室倾颓 → 群雄并起 → 赤壁三分 → 三家归晋」十个关键帧平滑过渡。
- **事件图谱**：50 个关键事件，含年号、地点、阵营、人物、经过与结果；当前年份附近的事件以脉冲标出。
- **行军路线**：官渡、赤壁、夷陵、五丈原、灭蜀、灭吴等战役以动态虚线呈现行军方向。
- **交互**：滚轮缩放、拖拽平移、州名/地名开关、阵营筛选与事件索引。
- **纯静态**：零运行时依赖，Vite 构建后可直接托管在 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物输出到 dist/
npm run preview
```

## 部署

站点通过 GitHub Pages 发布，源为 `gh-pages` 分支（仓库 **Settings → Pages → Source: Deploy from a branch**）。

更新内容后重新构建并发布：

```bash
GITHUB_ACTIONS=true npm run build   # base 自动变为 /three-kingdoms-atlas/
git worktree add --detach /tmp/ghp
cd /tmp/ghp && git checkout --orphan gh-pages && git rm -rf .
cp -r <项目目录>/dist/. . && touch .nojekyll
git add -A && git commit -m "deploy" && git push origin gh-pages -f
```

也可以改用 GitHub Actions 自动部署：在仓库里添加构建 + 发布 Pages 的工作流，并把 Pages 源切换为 **GitHub Actions**。

## 目录

```
src/
  data/map.ts       # 疆域、十三州、水系、山脉、城池、版图关键帧
  data/geo.ts       # 真实经纬度海岸线与州界几何（简化自 jiangshan-map）
  data/events.ts    # 五十个历史事件与战役路线
  lib/projection.ts # 等距圆柱投影（含中纬度经度压缩）
  lib/svg.ts        # SVG 节点构造与柔和曲线辅助
  map/atlas.ts      # 地图渲染、版图着色、事件与路线图层、缩放平移
  main.ts           # 状态、时间轴、索引与详情面板
  style.css         # 古地图视觉
```

## 数据说明

- 海岸线与州界矢量取自开源项目 [DeanChensj/jiangshan-map](https://github.com/DeanChensj/jiangshan-map) 的 `s_sanguo_a.geojson`（GPL-3.0），按本图视野做了简化、接缝缝合，并将荆州按南北拆分。
- 水系、山脉为示意性简化几何，用于呈现历史地理关系，不作精确测绘依据。
- 事件年份、年号与人物依据常见史料整理；部分战役地点取后世通行的定位。
- 所有数据均以 TypeScript 常量维护，欢迎提交 Issue 指正。

## 许可

本项目以 **GPL-3.0** 发布：底图几何衍生自同样采用 GPL-3.0 的 jiangshan-map，需保持同一许可。历史文本与自制矢量图形可自由用于学习与研究。
