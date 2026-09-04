/**
 * The circular mark beside a language.
 *
 * Inline SVG rather than a flag emoji, because Windows ships no flag glyphs
 * at all: 🇵🇱 renders there as the letters "PL" in a box, which is the one
 * platform most of this portal's users are on. Inline also means no external
 * request and nothing to fail on a slow connection.
 *
 * Drawn into a circle, so the shapes are simplified to what survives at
 * 20 pixels. These are recognisable marks, not accurate flags, and none of
 * them is presented as one: every badge is decorative and the language is
 * named in text beside it.
 *
 * Two languages get a letter instead of a flag. See the note in locales.ts —
 * the short version is that Arabic and Punjabi have no flag that does not
 * misidentify most of the people reaching for them.
 */

function Uk() {
  return (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#C8102E" strokeWidth="3" />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="8" />
      <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="4.5" />
    </>
  );
}

function Scotland() {
  return (
    <>
      <rect width="24" height="24" fill="#005EB8" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#fff" strokeWidth="5" />
    </>
  );
}

function Poland() {
  return (
    <>
      <rect width="24" height="12" fill="#fff" />
      <rect y="12" width="24" height="12" fill="#DC143C" />
    </>
  );
}

function Ukraine() {
  return (
    <>
      <rect width="24" height="12" fill="#0057B7" />
      <rect y="12" width="24" height="12" fill="#FFD700" />
    </>
  );
}

function Pakistan() {
  return (
    <>
      <rect width="24" height="24" fill="#01411C" />
      <rect width="7" height="24" fill="#fff" />
      {/* Crescent, cut from one circle by another rather than drawn as a path.
          At this size the difference is invisible and the shape stays clean. */}
      <mask id="pk-crescent">
        <rect width="24" height="24" fill="#000" />
        <circle cx="16" cy="12" r="6" fill="#fff" />
        <circle cx="18" cy="10" r="5.4" fill="#000" />
      </mask>
      <rect width="24" height="24" fill="#fff" mask="url(#pk-crescent)" />
    </>
  );
}

function China() {
  return (
    <>
      <rect width="24" height="24" fill="#DE2910" />
      <path
        d="M7 5.6l1.05 3.23h3.4l-2.75 2 1.05 3.23L7 12.06l-2.75 2 1.05-3.23-2.75-2h3.4z"
        fill="#FFDE00"
      />
      <circle cx="14" cy="6" r="1.1" fill="#FFDE00" />
      <circle cx="17" cy="8.5" r="1.1" fill="#FFDE00" />
      <circle cx="17" cy="12" r="1.1" fill="#FFDE00" />
      <circle cx="14" cy="14.5" r="1.1" fill="#FFDE00" />
    </>
  );
}

const FLAGS: Record<string, () => React.ReactElement> = {
  uk: Uk,
  scotland: Scotland,
  poland: Poland,
  ukraine: Ukraine,
  pakistan: Pakistan,
  china: China,
};

export function FlagBadge({
  badge,
  size = 20,
}: {
  badge: string;
  size?: number;
}) {
  const Flag = FLAGS[badge];

  // A letter, for the languages no flag can honestly stand for. Same circle,
  // same size, so the list still reads as one set of things.
  if (!Flag) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        className="flex shrink-0 select-none items-center justify-center rounded-full bg-gold-200 font-semibold leading-none text-gold-700"
      >
        {badge}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0 rounded-full"
      // A hairline so a white or pale flag still reads as a disc against the
      // white surface it sits on.
      style={{ boxShadow: "inset 0 0 0 1px rgba(18,9,2,0.14)" }}
    >
      <Flag />
    </svg>
  );
}
