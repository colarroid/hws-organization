import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { sniffImageType } from "@/lib/image";

/**
 * Finding an organisation's icon on its own website.
 *
 * This is a convenience, not the point. Most organisations have a logo file
 * and should upload it; this exists so that the ones who do not have it to
 * hand still end up with something rather than a grey square.
 *
 * The security question matters more than the feature. A URL typed into a
 * form and fetched by our server is a request made *from inside our network*
 * with our credentials attached to nothing but our IP. Left unguarded it is a
 * port scanner: `http://10.0.0.5/`, `http://169.254.169.254/` on a cloud host,
 * `http://localhost:5432/`. So every hop is resolved and checked against the
 * private ranges before a socket is opened, redirects are followed by hand
 * rather than by fetch, and the response is capped in both size and time.
 *
 * What comes back is a list of candidates, not a decision. The organisation
 * picks, or ignores all of them and uploads their own.
 */

/** Big enough for a real icon, small enough that nothing is being smuggled. */
const MAX_BYTES = 512 * 1024;
const MAX_HTML_BYTES = 1024 * 1024;
const TIMEOUT_MS = 6000;
const MAX_REDIRECTS = 3;

/**
 * Where an icon lives when the page does not say.
 *
 * `/favicon.ico` is the one everybody knows and the one that is least often
 * an ICO file: browsers stopped caring about the extension years ago. The
 * Apple icons come first because they are 180 pixels and the favicons are
 * 32, and a logo beside a listing wants the bigger one.
 */
const FALLBACK_PATHS = [
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
  "/favicon-192x192.png",
  "/favicon-96x96.png",
  "/favicon-32x32.png",
  "/favicon.png",
  "/favicon.svg",
  "/favicon.ico",
];

export type LogoCandidate = {
  /** Absolute, and already proven fetchable. */
  url: string;
  /** Bytes, so the caller can prefer the one that will not look like porridge. */
  bytes: number;
  contentType: string;
  /** Longest edge in pixels where the source declared one. Null when unknown. */
  size: number | null;
  dataUrl: string;
};

/**
 * Every private, loopback, link-local and reserved range, v4 and v6.
 *
 * 169.254.0.0/16 is the one that matters most: it is where cloud providers
 * put their instance metadata service, and reaching it from a server is how
 * credentials leak.
 */
function isBlockedAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    const p = address.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
    if (p[0] === 0) return true;                       // "this network"
    if (p[0] === 10) return true;                      // private
    if (p[0] === 127) return true;                     // loopback
    if (p[0] === 169 && p[1] === 254) return true;     // link-local, metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true; // private
    if (p[0] === 192 && p[1] === 168) return true;     // private
    if (p[0] === 192 && p[1] === 0 && p[2] === 0) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // carrier NAT
    if (p[0] >= 224) return true;                      // multicast, reserved
    return false;
  }

  if (family === 6) {
    const a = address.toLowerCase();
    if (a === "::" || a === "::1") return true;
    // IPv4-mapped: ::ffff:10.0.0.1 must be judged as the v4 address it is.
    const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
    if (a.startsWith("fe80")) return true;             // link-local
    if (/^f[cd]/.test(a)) return true;                 // unique local
    return false;
  }

  // Not an IP literal at all. Refuse rather than guess.
  return true;
}

/** Resolves the hostname and refuses anything that is not a public address. */
async function assertPublic(url: URL): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("unsupported scheme");
  }

  const literal = isIP(url.hostname);
  if (literal) {
    if (isBlockedAddress(url.hostname)) throw new Error("private address");
    return;
  }

  // `all: true` because a hostname can resolve to several addresses and only
  // one of them needs to be internal for this to be worth refusing.
  const addresses = await lookup(url.hostname, { all: true });
  if (addresses.length === 0) throw new Error("does not resolve");
  for (const { address } of addresses) {
    if (isBlockedAddress(address)) throw new Error("private address");
  }
}

/**
 * fetch with redirects followed by hand.
 *
 * `redirect: "follow"` would check the first hop and then let the rest happen
 * unsupervised, which is exactly how a public URL is used to reach a private
 * one. Each hop is re-checked.
 */
async function safeFetch(target: URL, limitBytes: number) {
  let url = target;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url);

    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "HWSPathGrid/1.0 (+https://www.hwspathgrid.com)" },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("redirect without a destination");
      url = new URL(location, url);
      continue;
    }

    if (!response.ok) throw new Error(`http ${response.status}`);

    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > limitBytes) throw new Error("too large");

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > limitBytes) throw new Error("too large");

    return {
      url,
      buffer,
      contentType: (response.headers.get("content-type") ?? "")
        .split(";")[0]
        .trim()
        .toLowerCase(),
    };
  }

  throw new Error("too many redirects");
}

/** The `sizes` attribute, as a longest edge. "any" means SVG, which wins. */
function parseSizes(sizes: string | null): number | null {
  if (!sizes) return null;
  if (/any/i.test(sizes)) return 1024;
  const numbers = sizes.match(/\d+/g);
  if (!numbers) return null;
  return Math.max(...numbers.map(Number));
}

/**
 * Icon links in the page head, biggest first.
 *
 * Parsed with a regex rather than a DOM. That is usually the wrong instinct,
 * but here the input is somebody else's arbitrary HTML and the only thing
 * being extracted is the href of a link tag. A parser would be a much larger
 * attack surface for a much smaller gain.
 */
function iconLinksFrom(html: string, base: URL): { href: string; size: number | null }[] {
  const found: { href: string; size: number | null }[] = [];

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (!rel) continue;
    if (!/\b(apple-touch-icon|icon|shortcut icon|mask-icon)\b/.test(rel)) continue;

    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;

    const sizes = tag.match(/\bsizes\s*=\s*["']([^"']+)["']/i)?.[1] ?? null;
    // An apple-touch-icon with no declared size is 180 by convention, and
    // that convention is the reason it is worth preferring over favicon.ico.
    const size = parseSizes(sizes) ?? (rel.includes("apple-touch-icon") ? 180 : null);

    try {
      found.push({ href: new URL(href, base).toString(), size });
    } catch {
      // A malformed href is not worth an error message to the organisation.
    }
  }

  return found;
}

function toDataUrl(buffer: ArrayBuffer, contentType: string) {
  return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
}

/**
 * Everything usable we can find on one site, best first.
 *
 * Returns an empty list rather than throwing when a site simply has no icon:
 * that is a normal outcome, and the organisation uploads instead.
 */
export async function findLogoCandidates(website: string): Promise<LogoCandidate[]> {
  let base: URL;
  try {
    base = new URL(website);
  } catch {
    return [];
  }

  const links: { href: string; size: number | null }[] = [];

  try {
    const page = await safeFetch(base, MAX_HTML_BYTES);
    const html = new TextDecoder("utf-8", { fatal: false }).decode(page.buffer);
    // The page's own URL, not the one typed: a redirect to www changes what
    // a relative href resolves against.
    links.push(...iconLinksFrom(html, page.url));
  } catch {
    // The site being unreachable is not fatal. /favicon.ico is still worth a
    // try, since plenty of sites have one without ever declaring it.
  }

  // Tried in order after anything the page declared, and de-duplicated below
  // against it, so a site that names its own icon is not fetched twice.
  for (const path of FALLBACK_PATHS) {
    links.push({
      href: new URL(path, base).toString(),
      // Apple names its icon size by convention rather than declaring it.
      size: path.includes("apple-touch-icon") ? 180 : null,
    });
  }

  // Biggest declared size first, so the good icon is fetched before the 16px
  // one and the cap below rarely costs anything. Stable, so the fallback
  // order survives among the ones that declare nothing.
  links.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));

  const seen = new Set<string>();
  const candidates: LogoCandidate[] = [];

  for (const link of links) {
    if (candidates.length >= 4) break;
    if (seen.has(link.href)) continue;
    seen.add(link.href);

    try {
      const icon = await safeFetch(new URL(link.href), MAX_BYTES);

      // The bytes, not the header. A server that calls a PNG
      // application/octet-stream is common; one that serves its HTML 404 page
      // as image/png with a 200 beside it is not rare either.
      const contentType = sniffImageType(icon.buffer);
      if (!contentType) continue;

      candidates.push({
        url: icon.url.toString(),
        bytes: icon.buffer.byteLength,
        contentType,
        size: link.size,
        dataUrl: toDataUrl(icon.buffer, contentType),
      });
    } catch {
      // One icon 404ing says nothing about the next.
    }
  }

  return candidates;
}
