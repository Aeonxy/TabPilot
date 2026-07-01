// Web Worker for button detection - runs getImageData off the main thread
// so it never causes stutter in the game canvas rendering.

function _px(data, fw, x, y) {
  const i = (y * fw + x) * 4;
  return { r: data[i], g: data[i+1], b: data[i+2] };
}
function _pxAt(data, fw, x, y) { return _px(data, fw, x, y); }
function _bpx(data, fw, bx, by, bw, bh, rx, ry) {
  return _px(data, fw,
    Math.round(bx + rx * (bw - 1)),
    Math.round(by + ry * (bh - 1)));
}

function _growBlob(data, fw, fh, seedX, seedY, colorTest, maxSize) {
  const MIN_DENSITY = 0.35;
  function rowDensity(y, x0, x1) {
    let hits = 0, total = 0;
    for (let x = x0; x <= x1; x += 2) { total++; if (colorTest(_pxAt(data, fw, x, y))) hits++; }
    return total > 0 ? hits / total : 0;
  }
  function colDensity(x, y0, y1) {
    let hits = 0, total = 0;
    for (let y = y0; y <= y1; y += 2) { total++; if (colorTest(_pxAt(data, fw, x, y))) hits++; }
    return total > 0 ? hits / total : 0;
  }
  let left = seedX, right = seedX, top = seedY, bottom = seedY;
  while (right < fw-1 && right-seedX < maxSize && colorTest(_pxAt(data,fw,right+1,seedY))) right++;
  while (left > 0 && seedX-left < maxSize && colorTest(_pxAt(data,fw,left-1,seedY))) left--;
  while (bottom < fh-1 && bottom-seedY < maxSize && colorTest(_pxAt(data,fw,seedX,bottom+1))) bottom++;
  while (top > 0 && seedY-top < maxSize && colorTest(_pxAt(data,fw,seedX,top-1))) top--;
  while (bottom < fh-1 && bottom-top < maxSize && rowDensity(bottom+1,left,right) >= MIN_DENSITY) bottom++;
  while (top > 0 && bottom-top < maxSize && rowDensity(top-1,left,right) >= MIN_DENSITY) top--;
  while (right < fw-1 && right-left < maxSize && colDensity(right+1,top,bottom) >= MIN_DENSITY) right++;
  while (left > 0 && right-left < maxSize && colDensity(left-1,top,bottom) >= MIN_DENSITY) left--;
  return { bx: left, by: top, bw: right-left+1, bh: bottom-top+1 };
}

function _verifyCloseBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return -1;
  const aspect = bw / bh;
  if (aspect < 0.75 || aspect > 1.5) return -1;
  const corners = [
    _bpx(data,fw,bx,by,bw,bh,0.08,0.08), _bpx(data,fw,bx,by,bw,bh,0.92,0.08),
    _bpx(data,fw,bx,by,bw,bh,0.08,0.92), _bpx(data,fw,bx,by,bw,bh,0.92,0.92),
  ];
  const xpts = [
    _bpx(data,fw,bx,by,bw,bh,0.5,0.5), _bpx(data,fw,bx,by,bw,bh,0.3,0.3),
    _bpx(data,fw,bx,by,bw,bh,0.7,0.3), _bpx(data,fw,bx,by,bw,bh,0.3,0.7),
    _bpx(data,fw,bx,by,bw,bh,0.7,0.7),
  ];
  const cornerAvg = corners.reduce((s,p) => s+(p.r+p.g+p.b)/3, 0) / corners.length;
  const xAvg      = xpts.reduce((s,p)   => s+(p.r+p.g+p.b)/3, 0) / xpts.length;
  const cornerGB  = corners.reduce((s,p) => s+(p.g-p.b), 0) / corners.length;
  if (cornerGB <= 50) return -1;
  const contrast = cornerAvg - xAvg;
  const deadCenter = _bpx(data,fw,bx,by,bw,bh,0.5,0.5);
  const deadCenterBrightness = (deadCenter.r+deadCenter.g+deadCenter.b)/3;
  if (deadCenterBrightness > 120) return -1;
  const midRowLeft  = _bpx(data,fw,bx,by,bw,bh,0.15,0.5);
  const midRowRight = _bpx(data,fw,bx,by,bw,bh,0.85,0.5);
  const midEdgeAvg = ((midRowLeft.r+midRowLeft.g+midRowLeft.b)/3 + (midRowRight.r+midRowRight.g+midRowRight.b)/3) / 2;
  if (midEdgeAvg < 140) return -1;
  if (contrast <= 30) return -1;
  const xAbsDark = xpts.reduce((s,p) => s+(p.r+p.g+p.b)/3, 0) / xpts.length;
  if (xAbsDark > 140) return -1;
  return contrast;
}

function _verifyOpenChatBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return -1;
  const aspect = bw / bh;
  if (aspect < 0.7 || aspect > 1.25) return -1;
  const isBtnGreen = (p) => p.g > 200 && (p.g-p.b) > 80 && (p.r-p.b) > 70 && p.r > 150;
  const corners = [
    _bpx(data,fw,bx,by,bw,bh,0.05,0.05), _bpx(data,fw,bx,by,bw,bh,0.95,0.05),
    _bpx(data,fw,bx,by,bw,bh,0.05,0.95), _bpx(data,fw,bx,by,bw,bh,0.95,0.95),
  ];
  if (corners.filter(p => isBtnGreen(p)).length < 3) return -1;
  function rowAvg(ry) {
    return [0.2,0.4,0.6,0.8].reduce((s,rx) => {
      const p = _bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3;
    }, 0) / 4;
  }
  const topEdge = rowAvg(0.02), botEdge = rowAvg(0.98);
  if (topEdge < 135 || botEdge < 135) return -1;
  const edgeAvg = (topEdge+botEdge)/2;
  function fullWidthDark(ry) {
    const l=_bpx(data,fw,bx,by,bw,bh,0.12,ry), r=_bpx(data,fw,bx,by,bw,bh,0.88,ry), m=_bpx(data,fw,bx,by,bw,bh,0.5,ry);
    return { lb:(l.r+l.g+l.b)/3, rb:(r.r+r.g+r.b)/3, mb:(m.r+m.g+m.b)/3, avg:((l.r+l.g+l.b)/3+(r.r+r.g+r.b)/3+(m.r+m.g+m.b)/3)/3 };
  }
  const upper = fullWidthDark(0.10), lower = fullWidthDark(0.60);
  const upperOk = upper.lb<150 && upper.rb<150 && upper.mb<150;
  const lowerOk = lower.lb<150 && lower.rb<150 && lower.mb<150;
  if (!upperOk && !lowerOk) return -1;
  const contrast = edgeAvg - Math.min(upper.avg, lower.avg);
  if (contrast < 25) return -1;
  return contrast;
}

function _verifyChatBlob(data, fw, bx, by, bw, bh) {
  if (bw < 4 || bh < 4) return false;
  const aspect = bw/bh;
  if (aspect < 0.85 || aspect > 1.6) return false;
  const center = _bpx(data,fw,bx,by,bw,bh,0.5,0.5);
  if (center.b - center.r > 8) return false;
  const centerSat = Math.max(center.r,center.g,center.b) - Math.min(center.r,center.g,center.b);
  if (centerSat > 40) return false;
  const checkPts = [[0.2,0.2],[0.8,0.2],[0.5,0.5],[0.2,0.8],[0.8,0.8]];
  for (const [rx,ry] of checkPts) {
    const p = _bpx(data,fw,bx,by,bw,bh,rx,ry);
    if (Math.max(p.r,p.g,p.b) - Math.min(p.r,p.g,p.b) > 35) return false;
  }
  const topAvg = [[0.2,0.15],[0.5,0.15],[0.8,0.15]].reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0)/3;
  const botAvg = [[0.2,0.85],[0.5,0.85],[0.8,0.85]].reduce((s,[rx,ry]) => { const p=_bpx(data,fw,bx,by,bw,bh,rx,ry); return s+(p.r+p.g+p.b)/3; }, 0)/3;
  if ((topAvg-botAvg) <= 25) return false;
  const cT=_bpx(data,fw,bx,by,bw,bh,0.5,0.28), lT=_bpx(data,fw,bx,by,bw,bh,0.15,0.28), rT=_bpx(data,fw,bx,by,bw,bh,0.85,0.28);
  const cB=(cT.r+cT.g+cT.b)/3, lB=(lT.r+lT.g+lT.b)/3, rB=(rT.r+rT.g+rT.b)/3;
  if ((cB-lB) < 40 || (cB-rB) < 40) return false;
  return true;
}


// Scans for the open-chat bubble button by looking for clusters of dark pixels
// surrounded by the button's green background. The bubble icon is a circular
// shape - its corners are dark/transparent, not green, so the blob-based
// green detection fails for it. Instead we scan for dark pixels (the icon's
// interior strokes) that have green context pixels nearby, then cluster them
// to find the button center.
function detectOpenChatViaIconDots(data, fw, fh, scaleX, scaleY) {
  const isGreen = (p) => p.g > 200 && (p.g-p.b) > 80 && (p.r-p.b) > 70 && p.r > 150;
  
  // Only scan the bottom 20% of the canvas where the chat bar lives
  const startY = Math.floor(fh * 0.80);
  
  // Collect (x,y) pairs of dark pixels surrounded by green
  const hits = [];
  for (let y = startY + 2; y < fh - 2; y++) {
    for (let x = 2; x < fw - 2; x++) {
      const p = _pxAt(data, fw, x, y);
      if ((p.r+p.g+p.b)/3 > 120) continue;
      const above = _pxAt(data, fw, x, y-3);
      const below = _pxAt(data, fw, x, y+3);
      const left  = _pxAt(data, fw, x-3, y);
      const right  = _pxAt(data, fw, x+3, y);
      if ([above,below,left,right].filter(isGreen).length >= 3) {
        hits.push({x, y});
      }
    }
  }
  if (hits.length < 5) return null;
  
  // Cluster by x position
  hits.sort((a,b) => a.x - b.x);
  const clusters = [];
  let cl = [hits[0]];
  for (let i = 1; i < hits.length; i++) {
    if (hits[i].x - cl[cl.length-1].x < 20) { cl.push(hits[i]); }
    else {
      if (cl.length >= 3) clusters.push(cl);
      cl = [hits[i]];
    }
  }
  if (cl.length >= 3) clusters.push(cl);
  if (clusters.length === 0) return null;
  
  // Pick the rightmost dense cluster (bubble dots, smile is to the left)
  const best = clusters.sort((a,b) => b[0].x - a[0].x)[0];
  
  // Center = mean of all hit pixels in the cluster
  const cx = Math.round(best.reduce((s,p) => s+p.x, 0) / best.length);
  const cy = Math.round(best.reduce((s,p) => s+p.y, 0) / best.length);
  
  return { cx: Math.round(cx * scaleX), cy: Math.round(cy * scaleY), name: 'openchat', score: best.length };
}

// Detects the chat panel being open by finding a vertical column of gray
// buttons (the 5 chat icons: tools, sword, star, house, chat). Each button
// is a dark icon on a gray background. We scan for clusters of dark pixels
// surrounded by gray, then look for a vertical column of such clusters.
// This works regardless of where the user has positioned the chat panel.
function detectChatPanelOpen(data, fw, fh, scaleX, scaleY) {
  const isGray = (p) => Math.abs(p.g-p.b)<20 && Math.abs(p.r-p.g)<20 && p.r>55 && p.r<185;

  // Find dark pixels surrounded by gray (icon strokes on button background)
  const hits = []; // {x, y}
  for (let y = 2; y < fh-2; y += 2) {
    for (let x = 2; x < fw-2; x += 2) {
      const p = _pxAt(data, fw, x, y);
      if ((p.r+p.g+p.b)/3 > 80) continue; // not dark enough
      const above = _pxAt(data, fw, x, y-2);
      const below = _pxAt(data, fw, x, y+2);
      const left  = _pxAt(data, fw, x-2, y);
      const right  = _pxAt(data, fw, x+2, y);
      if ([above,below,left,right].filter(isGray).length >= 3) {
        hits.push({x, y});
      }
    }
  }
  if (hits.length < 10) return false;

  // Cluster hits by x position (each button column has a consistent x range)
  const colBuckets = new Map();
  for (const {x, y} of hits) {
    const col = Math.floor(x / 12);
    if (!colBuckets.has(col)) colBuckets.set(col, []);
    colBuckets.get(col).push(y);
  }

  // Find columns with hits spread across a tall vertical range
  // (5 buttons stacked = coverage of ~5 * btnHeight pixels)
  const minBtnH = Math.round(fh * 0.025); // ~2.5% of scan height per button
  const minColumnSpan = minBtnH * 3; // need at least 3 buttons worth of span

  for (const [col, ys] of colBuckets) {
    if (ys.length < 8) continue;
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    if (yMax - yMin >= minColumnSpan) {
      return true; // found a tall column of dark-on-gray = chat panel open
    }
  }
  return false;
}

function detectBtns(imageData, fw, fh, scaleX, scaleY) {
  const data = imageData;
  const maxBlobSize      = Math.round(fh * 0.06);
  const maxGreenBlobSize = Math.round(fh * 0.09);
  const minBlobSize      = Math.round(fh * 0.015);
  const isGreen = (p) => p.g > 200 && (p.g-p.b) > 80 && (p.r-p.b) > 70 && p.r > 150;
  const isGray  = (p) => Math.abs(p.g-p.b) < 20 && Math.abs(p.r-p.g) < 20 && (p.r-p.b) > -10 && p.r > 60 && p.r < 180;
  const results = [];
  const claimed = [];
  const isClaimed = (x,y) => claimed.some(b => x>=b.bx && x<=b.bx+b.bw && y>=b.by && y<=b.by+b.bh);

  for (let y = 0; y < fh; y += 3) {
    for (let x = 0; x < fw; x += 3) {
      if (isClaimed(x,y)) continue;
      const p = _pxAt(data, fw, x, y);
      if (isGreen(p)) {
        const blob = _growBlob(data, fw, fh, x, y, isGreen, maxGreenBlobSize);
        const truncated = blob.bw >= maxGreenBlobSize || blob.bh >= maxGreenBlobSize;
        if (!truncated && blob.bw >= minBlobSize && blob.bh >= minBlobSize) {
          const rcx = Math.round((blob.bx+blob.bw/2)*scaleX);
          const rcy = Math.round((blob.by+blob.bh/2)*scaleY);
          const closeScore = _verifyCloseBlob(data, fw, blob.bx, blob.by, blob.bw, blob.bh);
          if (closeScore >= 0) { results.push({cx:rcx,cy:rcy,name:'close',score:closeScore}); claimed.push(blob); continue; }
          const chatScore = _verifyOpenChatBlob(data, fw, blob.bx, blob.by, blob.bw, blob.bh);
          if (chatScore >= 0) { results.push({cx:rcx,cy:rcy,name:'openchat',score:chatScore}); claimed.push(blob); continue; }
        }
      }

    }
  }
  // Detect chat panel open via vertical column of dark-on-gray icon buttons
  if (detectChatPanelOpen(data, fw, fh, scaleX, scaleY)) {
    results.push({ cx: 0, cy: 0, name: 'chat', bx:0, by:0, bw:0, bh:0 });
  }

  // Also try dot-pattern detection for the circular openchat bubble
  // which can't be found via green-blob growth (its corners are dark)
  if (!results.some(r => r.name === 'openchat')) {
    const dot = detectOpenChatViaIconDots(data, fw, fh, scaleX, scaleY);
    if (dot) results.push(dot);
  }
  return results;
}

self.onmessage = (e) => {
  const { imageData, fw, fh, scaleX, scaleY } = e.data;
  const results = detectBtns(imageData.data, fw, fh, scaleX, scaleY);
  self.postMessage({ results });
};

// Override the previous onmessage to handle ImageBitmap instead of ImageData
self.onmessage = (e) => {
  const { bitmap, fw, fh, scaleX, scaleY } = e.data;
  // Draw bitmap to OffscreenCanvas inside the worker, then read pixels
  // This is the key: getImageData runs in the worker thread, not main thread
  const oc = new OffscreenCanvas(fw, fh);
  const ctx = oc.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, fw, fh);
  bitmap.close(); // release GPU memory immediately
  const imageData = ctx.getImageData(0, 0, fw, fh);
  const results = detectBtns(imageData.data, fw, fh, scaleX, scaleY);
  self.postMessage({ results });
};