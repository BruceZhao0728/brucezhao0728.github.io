import fs from 'node:fs';

// The first chunk in a WebP file describes the frame or canvas dimensions.
export function readWebpSize(filename) {
  const image = fs.readFileSync(filename);
  const tag = offset => image.toString('ascii', offset, offset + 4);
  if (image.length >= 20 && tag(0) === 'RIFF' && tag(8) === 'WEBP') {
    const chunkSize = image.readUInt32LE(16);
    if (20 + chunkSize <= image.length) {
      switch (tag(12)) {
        case 'VP8X':
          if (chunkSize === 10) {
            return { width: image.readUIntLE(24, 3) + 1, height: image.readUIntLE(27, 3) + 1 };
          }
          break;
        case 'VP8L':
          if (chunkSize >= 5 && image[20] === 0x2f) {
            const dimensions = image.readUInt32LE(21);
            return { width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
          }
          break;
        case 'VP8 ':
          if (chunkSize >= 10 && image.readUIntBE(23, 3) === 0x9d012a) {
            const width = image.readUInt16LE(26) & 0x3fff;
            const height = image.readUInt16LE(28) & 0x3fff;
            if (width && height) return { width, height };
          }
          break;
      }
    }
  }
  throw new Error('Invalid WebP image header');
}
