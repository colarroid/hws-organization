/**
 * What an image actually is, from its bytes.
 *
 * Content-Type is a claim, not a fact. `/favicon.ico` is very often a PNG,
 * because browsers stopped caring years ago and nobody renamed the file;
 * plenty of servers send it as `application/octet-stream`, or `text/plain`,
 * or the site's own `text/html` 404 page with a 200 beside it. Trusting the
 * header means rejecting real icons and storing real 404 pages.
 *
 * So the bytes decide. This is also what makes an upload safe to trust: a
 * file called logo.png is a PNG only if it starts like one.
 */

export const IMAGE_TYPES = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
} as const;

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];

/** The extension each type is stored under. */
export const EXTENSION: Record<ImageType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/x-icon": "ico",
  "image/svg+xml": "svg",
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

/**
 * The image type, or null when the bytes are not one we accept.
 *
 * SVG is the exception to the magic-number rule: it is XML and has no
 * signature, so it is sniffed as text. It is accepted because plenty of
 * organisations only have their mark as a vector, and it is safe here
 * because it is rendered in an <img>, from a different origin to the app,
 * where a script inside it cannot run.
 */
export function sniffImageType(input: ArrayBuffer | Uint8Array): ImageType | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 4) return null;

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return IMAGE_TYPES.png;
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return IMAGE_TYPES.jpeg;
  }
  // RIFF....WEBP — the four size bytes in between are not part of the check.
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return IMAGE_TYPES.webp;
  }
  // ICO and CUR share a header and differ only in the type field.
  if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00])) {
    return IMAGE_TYPES.ico;
  }

  // SVG. Only the opening of the file is decoded: an XML declaration, a
  // comment or a doctype can precede the root element, but not by much, and
  // a file that has not reached <svg by 1 KB is not one.
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.subarray(0, 1024))
    .trimStart();

  if (head.startsWith("<?xml") || head.startsWith("<!--") || head.startsWith("<svg")) {
    if (/<svg[\s>]/i.test(head)) return IMAGE_TYPES.svg;
  }

  return null;
}
