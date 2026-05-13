/**
 * 精灵图拼接工具
 * 将 source/_sprites/ 下的角色图片合并为 15×7 的精灵图
 *
 * 用法:
 *   node tools/sprite-sheet.js                  # 原尺寸不缩放
 *   node tools/sprite-sheet.js --size 120       # 等比例缩放到 120×120 格内
 *   node tools/sprite-sheet.js --size 120 --webp  # 输出 webp 格式
 *
 * 输入: source/_sprites/*.{png,webp,jpg}
 * 输出: sprite-sheet.png 或 sprite-sheet.webp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const COLS = 15;
const ROWS = 7;
const MAX_CELLS = COLS * ROWS;
const INPUT_DIR = path.resolve(__dirname, '../source/_sprites');
const OUTPUT_DIR = path.resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  const sizeArg = args.find((a) => a.startsWith('--size='));
  const targetSize = sizeArg ? parseInt(sizeArg.split('=')[1], 10) : null;
  const useWebp = args.includes('--webp');
  const ext = useWebp ? 'webp' : 'png';
  const OUTPUT = path.join(OUTPUT_DIR, `sprite-sheet.${ext}`);

  // 读取输入文件
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(png|webp|jpg|jpeg)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`错误: ${INPUT_DIR} 目录下没有图片文件`);
    console.error('支持的格式: PNG, WebP, JPG');
    process.exit(1);
  }

  if (files.length > MAX_CELLS) {
    console.warn(`警告: 有 ${files.length} 张图，超过 ${MAX_CELLS} 张，只取前 ${MAX_CELLS} 张`);
  }

  const selected = files.slice(0, MAX_CELLS);
  console.log(`找到 ${files.length} 张图片，使用 ${selected.length} 张`);

  // 读取尺寸
  const metadatas = await Promise.all(
    selected.map((f) => sharp(path.join(INPUT_DIR, f)).metadata())
  );

  // 确定单元格尺寸
  let cellW, cellH;
  if (targetSize) {
    cellW = targetSize;
    cellH = targetSize;
    console.log(`目标单元格: ${cellW}×${cellH}px (等比例缩放 + 透明填充)`);
  } else {
    cellW = Math.max(...metadatas.map((m) => m.width));
    cellH = Math.max(...metadatas.map((m) => m.height));
    console.log(`单元格: ${cellW}×${cellH}px (不缩放，取最大尺寸对齐)`);
  }

  const sizes = metadatas.map((m) => `${m.width}x${m.height}`);
  const uniqueSizes = [...new Set(sizes)];
  if (uniqueSizes.length > 1) {
    console.log(`检测到 ${uniqueSizes.length} 种尺寸`);
  }
  console.log(`精灵图总尺寸: ${cellW * COLS}×${cellH * ROWS}px`);

  // 处理每张图：等比例缩放 + 居中透明填充
  const composites = [];
  for (let i = 0; i < selected.length; i++) {
    const filePath = path.join(INPUT_DIR, selected[i]);
    const meta = metadatas[i];

    let input;
    if (targetSize) {
      // 等比例缩放到单元格内，居中填充透明背景
      input = await sharp(filePath)
        .resize(cellW, cellH, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    } else if (meta.width === cellW && meta.height === cellH) {
      input = filePath;
    } else {
      // 不缩放，居中放在透明底板上
      const left = Math.round((cellW - meta.width) / 2);
      const top = Math.round((cellH - meta.height) / 2);
      input = await sharp({
        create: { width: cellW, height: cellH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: filePath, left, top }])
        .png()
        .toBuffer();
    }

    composites.push({
      input,
      left: (i % COLS) * cellW,
      top: Math.floor(i / COLS) * cellH,
    });
  }

  // 不足 105 格时循环填充
  const padCount = MAX_CELLS - selected.length;
  for (let i = 0; i < padCount; i++) {
    const srcIdx = i % selected.length;
    const idx = selected.length + i;
    composites.push({
      input: composites[srcIdx].input,
      left: (idx % COLS) * cellW,
      top: Math.floor(idx / COLS) * cellH,
    });
  }

  // 输出
  let pipeline = sharp({
    create: { width: COLS * cellW, height: ROWS * cellH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(composites);

  if (useWebp) {
    pipeline = pipeline.webp({ lossless: true });
  } else {
    pipeline = pipeline.png();
  }

  await pipeline.toFile(OUTPUT);

  // 输出文件大小
  const stats = fs.statSync(OUTPUT);
  const fileSize = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`\n完成! 精灵图已生成: ${OUTPUT} (${fileSize} MB)`);
  console.log(`共 ${composites.length} 格 (${COLS}列×${ROWS}行)${targetSize ? ', 等比例缩放' : ''}`);
  if (padCount > 0) console.log(`填充: ${padCount} 格重复图片`);

  console.log('\n下一步: 将 sprite-sheet.' + ext + ' 上传到图床，');
  console.log('然后把 URL 填入 _config.anzhiyu.yml 的 peoplecanvas.imgs 列表中');
}

main().catch((err) => {
  console.error('生成失败:', err);
  process.exit(1);
});
