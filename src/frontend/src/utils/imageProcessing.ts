interface Corner {
  x: number;
  y: number;
}

export function detectDocumentCorners(img: HTMLImageElement): Corner[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return getDefaultCorners();

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const edges = detectEdges(imageData);

  const corners = findCorners(edges, canvas.width, canvas.height);

  return corners.map((corner) => ({
    x: (corner.x / canvas.width) * 100,
    y: (corner.y / canvas.height) * 100,
  }));
}

function getDefaultCorners(): Corner[] {
  return [
    { x: 10, y: 10 },
    { x: 90, y: 10 },
    { x: 90, y: 90 },
    { x: 10, y: 90 },
  ];
}

function detectEdges(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new ImageData(width, height);

  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          gx += gray * sobelX[ky + 1][kx + 1];
          gy += gray * sobelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const idx = (y * width + x) * 4;
      output.data[idx] = magnitude;
      output.data[idx + 1] = magnitude;
      output.data[idx + 2] = magnitude;
      output.data[idx + 3] = 255;
    }
  }

  return output;
}

function findCorners(edges: ImageData, width: number, height: number): Corner[] {
  const margin = Math.min(width, height) * 0.1;
  const searchRegions = [
    { x: margin, y: margin, name: 'topLeft' },
    { x: width - margin, y: margin, name: 'topRight' },
    { x: width - margin, y: height - margin, name: 'bottomRight' },
    { x: margin, y: height - margin, name: 'bottomLeft' },
  ];

  const corners: Corner[] = [];

  for (const region of searchRegions) {
    let maxIntensity = 0;
    let bestX = region.x;
    let bestY = region.y;

    const searchRadius = margin;
    for (let dy = -searchRadius; dy <= searchRadius; dy += 5) {
      for (let dx = -searchRadius; dx <= searchRadius; dx += 5) {
        const x = Math.max(0, Math.min(width - 1, region.x + dx));
        const y = Math.max(0, Math.min(height - 1, region.y + dy));
        const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
        const intensity = edges.data[idx];

        if (intensity > maxIntensity) {
          maxIntensity = intensity;
          bestX = x;
          bestY = y;
        }
      }
    }

    corners.push({ x: bestX, y: bestY });
  }

  if (corners.length !== 4) {
    return [
      { x: margin, y: margin },
      { x: width - margin, y: margin },
      { x: width - margin, y: height - margin },
      { x: margin, y: height - margin },
    ];
  }

  return corners;
}

export function applyPerspectiveTransform(img: HTMLImageElement, corners: Corner[]): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const srcCorners = corners.map((c) => ({
    x: (c.x / 100) * img.width,
    y: (c.y / 100) * img.height,
  }));

  const width = Math.max(
    distance(srcCorners[0], srcCorners[1]),
    distance(srcCorners[2], srcCorners[3])
  );
  const height = Math.max(
    distance(srcCorners[1], srcCorners[2]),
    distance(srcCorners[3], srcCorners[0])
  );

  canvas.width = width;
  canvas.height = height;

  const dstCorners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  const transform = getPerspectiveTransform(srcCorners, dstCorners);

  ctx.drawImage(img, 0, 0);
  const srcImageData = ctx.getImageData(0, 0, img.width, img.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dstImageData = ctx.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = applyTransform(transform, x, y);
      if (src.x >= 0 && src.x < img.width && src.y >= 0 && src.y < img.height) {
        const srcIdx = (Math.floor(src.y) * img.width + Math.floor(src.x)) * 4;
        const dstIdx = (y * width + x) * 4;
        dstImageData.data[dstIdx] = srcImageData.data[srcIdx];
        dstImageData.data[dstIdx + 1] = srcImageData.data[srcIdx + 1];
        dstImageData.data[dstIdx + 2] = srcImageData.data[srcIdx + 2];
        dstImageData.data[dstIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(dstImageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getPerspectiveTransform(
  src: { x: number; y: number }[],
  dst: { x: number; y: number }[]
): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < 4; i++) {
    matrix.push([
      src[i].x,
      src[i].y,
      1,
      0,
      0,
      0,
      -dst[i].x * src[i].x,
      -dst[i].x * src[i].y,
    ]);
    matrix.push([
      0,
      0,
      0,
      src[i].x,
      src[i].y,
      1,
      -dst[i].y * src[i].x,
      -dst[i].y * src[i].y,
    ]);
  }

  const b = dst.flatMap((p) => [p.x, p.y]);
  const h = solveLinearSystem(matrix, b);

  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1],
  ];
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const augmented = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }

  return x;
}

function applyTransform(
  transform: number[][],
  x: number,
  y: number
): { x: number; y: number } {
  const w = transform[2][0] * x + transform[2][1] * y + transform[2][2];
  return {
    x: (transform[0][0] * x + transform[0][1] * y + transform[0][2]) / w,
    y: (transform[1][0] * x + transform[1][1] * y + transform[1][2]) / w,
  };
}
