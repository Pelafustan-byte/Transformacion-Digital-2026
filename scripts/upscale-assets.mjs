import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST_PATH = path.join(PUBLIC, 'assets', 'assets-manifest.json');
const MIN_WIDTH = Number(process.env.ASSET_MIN_WIDTH || 1920);

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
let changed = 0;

for (const asset of manifest.assets || []) {
  if (asset.type !== 'photo' || asset.status !== 'approved') continue;
  if (!asset.file?.startsWith('/assets/') || !/\.(webp|jpe?g|png)$/i.test(asset.file)) continue;

  const filePath = path.join(PUBLIC, asset.file.replace(/^\//, ''));
  let source;
  try {
    source = await fs.readFile(filePath);
  } catch {
    console.warn(`[upscale] omitido: ${asset.file} no existe`);
    continue;
  }

  const meta = await sharp(source).metadata();
  if (!meta.width || !meta.height) continue;

  const originalWidth = meta.width;
  const originalHeight = meta.height;
  if (originalWidth >= MIN_WIDTH) {
    asset.renderWidth = originalWidth;
    asset.renderHeight = originalHeight;
    asset.upscaled = false;
    continue;
  }

  const targetWidth = MIN_WIDTH;
  const targetHeight = Math.max(1, Math.round(originalHeight * (targetWidth / originalWidth)));
  const tempPath = `${filePath}.upscale.tmp.webp`;

  await sharp(source)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false
    })
    .sharpen({ sigma: 0.8, m1: 0.7, m2: 1.8 })
    .modulate({ saturation: 1.02 })
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toFile(tempPath);

  await fs.rename(tempPath, filePath);
  const out = await sharp(filePath).metadata();
  const stat = await fs.stat(filePath);

  asset.originalWidth ??= originalWidth;
  asset.originalHeight ??= originalHeight;
  asset.width = out.width;
  asset.height = out.height;
  asset.bytes = stat.size;
  asset.upscaled = true;
  asset.upscaleMethod = 'Lanczos3 + sharpen suave';
  asset.notes = `Versión de entrega escalada desde ${originalWidth}×${originalHeight} a ${out.width}×${out.height} para uso Full HD. El detalle real sigue limitado por el archivo fuente original; reemplazar por original nativo de alta resolución cuando esté disponible.`;
  changed++;
  console.log(`[upscale] ${asset.id}: ${originalWidth}x${originalHeight} -> ${out.width}x${out.height}`);
}

manifest.generatedAt = new Date().toISOString();
manifest.deliveryPolicy = {
  minPhotoWidth: MIN_WIDTH,
  method: 'Lanczos3 + sharpen suave',
  note: 'Las fotografías aprobadas bajo el ancho mínimo se escalan automáticamente durante el build de producción.'
};

await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[upscale] finalizado: ${changed} fotografía(s) escalada(s).`);
