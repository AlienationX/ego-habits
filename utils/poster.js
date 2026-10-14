/**
 * EgoHabits - Canvas 2D Share Poster Generator
 * Generates MORU-aesthetic posters with real statistics and mini charts
 */

const i18n = require('./i18n.js');

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawMedalBadge(ctx, cx, cy) {
  ctx.save();
  // Ribbons
  ctx.fillStyle = '#BAD8BE';
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 10);
  ctx.lineTo(cx - 15, cy + 30);
  ctx.lineTo(cx - 9, cy + 26);
  ctx.lineTo(cx - 3, cy + 30);
  ctx.lineTo(cx - 2, cy + 12);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 7, cy + 10);
  ctx.lineTo(cx + 15, cy + 30);
  ctx.lineTo(cx + 9, cy + 26);
  ctx.lineTo(cx + 3, cy + 30);
  ctx.lineTo(cx + 2, cy + 12);
  ctx.closePath();
  ctx.fill();

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#DCE8BD';
  ctx.fill();

  // Inner green circle
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#4FA65A';
  ctx.fill();

  // White star in center
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  const spikes = 5;
  const outerR = 6.5;
  const innerR = 3.2;
  let rot = (Math.PI / 2) * 3;
  ctx.moveTo(cx, cy - outerR);
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes; i++) {
    let sx = cx + Math.cos(rot) * outerR;
    let sy = cy + Math.sin(rot) * outerR;
    ctx.lineTo(sx, sy);
    rot += step;
    sx = cx + Math.cos(rot) * innerR;
    sy = cy + Math.sin(rot) * innerR;
    ctx.lineTo(sx, sy);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Main poster rendering dispatcher
 */
function renderPoster(canvas, options) {
  const isWeek = options.type === 'week' || Array.isArray(options.bars);
  if (isWeek) {
    renderWeekPoster(canvas, options);
  } else {
    renderSingleHabitPoster(canvas, options);
  }
}

/**
 * Render Weekly Report Poster with 7-Day Mini Bar Chart & Real Rankings
 */
function renderWeekPoster(canvas, options) {
  const ctx = canvas.getContext('2d');
  const dpr = wx.getWindowInfo ? (wx.getWindowInfo().pixelRatio || 2) : 2;
  const w = 360;
  const h = 560;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  // 1. Warm Cream Canvas Background
  ctx.fillStyle = '#F6F5EE';
  ctx.fillRect(0, 0, w, h);

  // 2. White Center Card
  drawRoundedRect(ctx, 18, 18, w - 36, h - 36, 24, '#FFFFFF', 'rgba(35, 35, 35, 0.05)');

  // 3. Top Tag & Headline
  ctx.fillStyle = '#8F948C';
  ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(options.tag || 'EGOHABITS / WEEKLY REPORT', 38, 48);

  ctx.fillStyle = '#232323';
  ctx.font = 'bold 21px sans-serif';
  ctx.fillText(options.title || '本周生活微步周报', 38, 76);

  // User meta
  ctx.fillStyle = '#6B7068';
  ctx.font = '12px sans-serif';
  const nameText = options.nickname ? `记录者：${options.nickname}` : '慢调自律，向内生长';
  ctx.fillText(nameText, 38, 98);

  ctx.fillStyle = '#9DA39A';
  ctx.font = '11px sans-serif';
  ctx.fillText(options.dateStr || '', 38, 114);

  // Decorative Medal Badge on Top Right
  drawMedalBadge(ctx, 298, 66);

  // Horizontal Divider
  ctx.strokeStyle = 'rgba(35, 35, 35, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(38, 126);
  ctx.lineTo(w - 38, 126);
  ctx.stroke();

  // 4. Section: 7-Day Rhythm Mini Chart Box
  const chartBoxY = 138;
  const chartBoxH = 114;
  drawRoundedRect(ctx, 36, chartBoxY, w - 72, chartBoxH, 16, '#F8F7F0', null);

  // Chart Header inside box (7-Day Rhythm on left, total on right)
  ctx.fillStyle = '#232323';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(options.rhythmTitle || '7-Day Rhythm', 52, chartBoxY + 22);

  const totalText = options.streakText || `${options.total || 0} 次微习惯达成`;
  ctx.fillStyle = '#4FA65A';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(totalText, w - 52, chartBoxY + 22);
  ctx.textAlign = 'left';

  // Draw 7-Day Bars (proper clearance: bar numbers stay at y>=184, header stays at y<=163)
  const bars = options.bars || [];
  const barCount = 7;
  const barAreaLeft = 52;
  const barAreaW = w - 104;
  const colW = barAreaW / barCount;
  const barW = 14;
  const maxTrackH = 34;
  const barBottomY = chartBoxY + 84;

  // Find max count to scale heights
  let maxCount = 1;
  bars.forEach(b => { if (b.count > maxCount) maxCount = b.count; });

  bars.forEach((b, i) => {
    const cx = barAreaLeft + i * colW + colW / 2;
    const bx = cx - barW / 2;
    const by = barBottomY - maxTrackH;

    // Track
    drawRoundedRect(ctx, bx, by, barW, maxTrackH, 7, '#EAE9DF', null);

    // Fill
    if (b.count > 0) {
      const fillH = Math.min(maxTrackH, Math.max(10, Math.round((b.count / maxCount) * maxTrackH)));
      const fillY = barBottomY - fillH;
      const fillColor = b.active ? '#4FA65A' : '#7AB883';
      drawRoundedRect(ctx, bx, fillY, barW, fillH, 7, fillColor, null);

      // Value label on top of bar (completely inside safe zone, zero collision with 7-Day Rhythm)
      ctx.fillStyle = b.active ? '#34783D' : '#657062';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(b.count), cx, fillY - 4);
    }

    // Day of week label
    ctx.fillStyle = b.active ? '#232323' : '#8F948C';
    ctx.font = b.active ? 'bold 10px sans-serif' : '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.day || '', cx, barBottomY + 16);
  });
  ctx.textAlign = 'left';

  // 5. Section: Highlighted Habits Ranking
  const rankStartY = chartBoxY + chartBoxH + 15;
  ctx.fillStyle = '#232323';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(options.topHabitsTitle || 'Top Habits', 38, rankStartY);

  const habits = options.habits || [];
  let itemY = rankStartY + 10;
  const itemH = 42;
  const itemGap = 8;

  habits.slice(0, 3).forEach((h, idx) => {
    // Container
    drawRoundedRect(ctx, 36, itemY, w - 72, itemH, 12, '#FAF9F3', null);

    // Rank pill on left
    const rankBg = idx === 0 ? '#DCE8BD' : '#EBEAE0';
    const rankColor = idx === 0 ? '#34783D' : '#6B7068';
    drawRoundedRect(ctx, 46, itemY + 10, 22, 22, 11, rankBg, null);
    ctx.fillStyle = rankColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(idx + 1), 57, itemY + 25);
    ctx.textAlign = 'left';

    // Habit Title
    ctx.fillStyle = '#232323';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(h.name || '微习惯', 78, itemY + 20);

    // Habit Sub / Note
    ctx.fillStyle = '#7A8077';
    ctx.font = '11px sans-serif';
    ctx.fillText(h.amount || h.sub || '持续前行', 78, itemY + 34);

    // Count badge on right
    if (h.count > 0) {
      const badgeText = `${h.count} 次`;
      drawRoundedRect(ctx, w - 88, itemY + 11, 42, 20, 10, '#E9F2EA', null);
      ctx.fillStyle = '#2E6838';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, w - 67, itemY + 25);
      ctx.textAlign = 'left';
    } else {
      drawRoundedRect(ctx, w - 104, itemY + 11, 58, 20, 10, '#F0EFE7', null);
      ctx.fillStyle = '#8F948C';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.noCheckinsYet || '开启中', w - 75, itemY + 25);
      ctx.textAlign = 'left';
    }

    itemY += itemH + itemGap;
  });

  // 6. Section: Category Energy Badges
  const energyY = 416;
  const pillW = (w - 72 - 12) / 2;

  // Rest category pill
  drawRoundedRect(ctx, 36, energyY, pillW, 30, 15, '#E8F2F5', null);
  ctx.fillStyle = '#2B5E6B';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${options.restLabel || '休憩'} ${options.restCount || 0} 次`, 36 + pillW / 2, energyY + 19);

  // Move / Focus category pill
  drawRoundedRect(ctx, 36 + pillW + 12, energyY, pillW, 30, 15, '#EBF3EC', null);
  ctx.fillStyle = '#2E6838';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`${options.moveFocusLabel || '活力/专注'} ${options.moveCount || 0} 次`, 36 + pillW + 12 + pillW / 2, energyY + 19);
  ctx.textAlign = 'left';

  // 7. Footer Divider & Brand Seal
  ctx.strokeStyle = 'rgba(35, 35, 35, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(38, 464);
  ctx.lineTo(w - 38, 464);
  ctx.stroke();

  // Quote
  ctx.fillStyle = '#8F948C';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('微习惯，慢慢成长。 · Small habits. Room to grow.', w / 2, 488);

  // Seal mark
  drawRoundedRect(ctx, w / 2 - 64, 502, 128, 22, 11, '#F6F5EE', 'rgba(79, 166, 90, 0.3)');
  ctx.fillStyle = '#4FA65A';
  ctx.font = '600 10px sans-serif';
  ctx.fillText('EgoHabits · 生活微步', w / 2, 517);
  ctx.textAlign = 'left';
}

/**
 * Render Single Habit Completion Poster
 */
function renderSingleHabitPoster(canvas, options) {
  const ctx = canvas.getContext('2d');
  const dpr = wx.getWindowInfo ? (wx.getWindowInfo().pixelRatio || 2) : 2;
  const w = 360;
  const h = 540;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  // 1. Background
  ctx.fillStyle = '#F6F5EE';
  ctx.fillRect(0, 0, w, h);

  // 2. Main Center Card
  drawRoundedRect(ctx, 20, 20, w - 40, h - 40, 24, '#FFFFFF', 'rgba(35, 35, 35, 0.06)');

  // 3. Header Tag & Title
  ctx.fillStyle = '#8F948C';
  ctx.font = '600 11px sans-serif';
  ctx.fillText(options.tag || 'EGOHABITS / GENTLE STEPS', 40, 50);

  ctx.fillStyle = '#232323';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(options.title || '今日微习惯达成', 40, 78);

  // 4. User Meta
  ctx.fillStyle = '#6B7068';
  ctx.font = '13px sans-serif';
  const nameText = options.nickname ? `记录者：${options.nickname}` : '从容前行，按你自己的节奏';
  ctx.fillText(nameText, 40, 104);

  ctx.fillStyle = '#9DA39A';
  ctx.font = '12px sans-serif';
  ctx.fillText(options.dateStr || '', 40, 124);

  // Top right medal
  drawMedalBadge(ctx, 298, 66);

  // Divider
  ctx.strokeStyle = 'rgba(35, 35, 35, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.lineTo(w - 40, 140);
  ctx.stroke();

  // 5. Habits List
  const habits = options.habits || [];
  let startY = 154;
  const itemHeight = 48;
  const itemGap = 10;
  habits.slice(0, 4).forEach((h) => {
    drawRoundedRect(ctx, 40, startY, w - 80, itemHeight, 14, '#F8F7F0', null);

    // Green Check Circle
    ctx.beginPath();
    ctx.arc(64, startY + 24, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#4FA65A';
    ctx.fill();

    // White tick
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(59, startY + 24);
    ctx.lineTo(63, startY + 28);
    ctx.lineTo(70, startY + 20);
    ctx.stroke();

    // Habit Title
    ctx.fillStyle = '#232323';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(h.name || h.title || '微习惯', 86, startY + 22);

    // Amount / Sub
    ctx.fillStyle = '#6B7068';
    ctx.font = '12px sans-serif';
    ctx.fillText(h.amount || h.sub || '已达成', 86, startY + 38);

    startY += itemHeight + itemGap;
  });

  // 6. Streak / Milestone Banner
  if (options.streakText) {
    const bannerY = startY + 6;
    drawRoundedRect(ctx, 40, bannerY, w - 80, 38, 19, '#DCE8BD', null);
    ctx.fillStyle = '#232323';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.streakText, w / 2, bannerY + 24);
    ctx.textAlign = 'left';
  }

  // 7. Footer Slogan
  ctx.fillStyle = '#9DA39A';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('微习惯，慢慢成长。 · Small habits. Room to grow.', w / 2, 492);
  ctx.textAlign = 'left';
}

function exportPosterImage(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('Canvas node not found'));
      return;
    }
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvas,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          if (res && res.tempFilePath) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error('Empty tempFilePath'));
          }
        },
        fail: (err) => {
          console.error('[poster] exportPosterImage fail:', err);
          reject(err);
        }
      });
    }, 80);
  });
}

function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('File path required'));
      return;
    }
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(filePath),
      fail: (err) => {
        if (err && err.errMsg && (err.errMsg.includes('auth') || err.errMsg.includes('deny') || err.errMsg.includes('authorize'))) {
          wx.showModal({
            title: i18n.t('share.authTitle', '需要相册权限'),
            content: i18n.t('share.authMsg', '请在设置中允许访问相册，或长按海报直接保存。'),
            confirmText: i18n.t('share.goToSettings', '去设置'),
            success: (modalRes) => {
              if (modalRes.confirm && wx.openSetting) {
                wx.openSetting();
              }
            }
          });
        }
        reject(err);
      }
    });
  });
}

function saveCanvasToAlbum(canvasId, componentInstance) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().in(componentInstance)
      .select(canvasId)
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0] || !res[0].node) {
          reject(new Error('Canvas not found'));
          return;
        }
        const canvas = res[0].node;
        exportPosterImage(canvas)
          .then(saveImageToAlbum)
          .then(resolve)
          .catch(reject);
      });
  });
}

module.exports = {
  renderPoster,
  exportPosterImage,
  saveImageToAlbum,
  saveCanvasToAlbum
};
