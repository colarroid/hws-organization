"use client";

import { useRef, useState } from "react";
import { Building2, Download, Trash2, Upload } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Candidate = {
  url: string;
  bytes: number;
  contentType: string;
  size: number | null;
  dataUrl: string;
};

/**
 * The website, and the logo that comes from it.
 *
 * One control rather than two, because the two facts are the same fact: an
 * organisation's mark is on its own site, and asking for the address and then
 * separately for a file is asking twice. Fetching is the shortcut for anyone
 * without their logo to hand; uploading is the answer for anyone who cares
 * what it looks like, and a fetched favicon is very often 32 pixels of mush.
 *
 * Nothing is written until the form is saved. What is chosen here rides along
 * as a data URL in a hidden field, so an abandoned page leaves no orphaned
 * object in the bucket and no half-changed logo on the organisation.
 */
export function LogoField({
  defaultWebsite,
  currentLogoUrl,
}: {
  defaultWebsite: string;
  /** The saved logo, if there is one. Public URL from the bucket. */
  currentLogoUrl: string | null;
}) {
  const [website, setWebsite] = useState(defaultWebsite);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [source, setSource] = useState<"fetched" | "uploaded" | null>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  // What the panel shows: the new choice, else the saved one, else nothing.
  const preview = chosen ?? (removed ? null : currentLogoUrl);

  async function fetchFromWebsite() {
    setBusy(true);
    setMessage(null);
    setCandidates([]);

    try {
      const response = await fetch("/api/logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website }),
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(body.error ?? "We could not read that website.");
        return;
      }

      // The server normalises the address, so the field catches up with what
      // was actually fetched rather than leaving a bare domain on screen.
      if (body.website) setWebsite(body.website);

      if (!body.candidates || body.candidates.length === 0) {
        setMessage(
          "We could not find an icon on that site. Upload your logo instead.",
        );
        return;
      }

      setCandidates(body.candidates);
      setChosen(body.candidates[0].dataUrl);
      setSource("fetched");
      setRemoved(false);
    } catch {
      setMessage("We could not reach that website just now.");
    } finally {
      setBusy(false);
    }
  }

  function onUpload(file: File | undefined) {
    if (!file) return;

    if (file.size > 512 * 1024) {
      setMessage("That file is over 512 KB. A logo should be well under it.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setChosen(String(reader.result));
      setSource("uploaded");
      setCandidates([]);
      setRemoved(false);
      setMessage(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <Field
        label="Website"
        name="website"
        inputMode="url"
        autoComplete="url"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        placeholder="example.org"
      />

      <div className="flex flex-col gap-[10px]">
        <span className="text-[15px] font-semibold">Your logo</span>
        <span className="text-[14px] leading-[1.5] text-ink-60">
          It sits beside your name wherever a woman sees one of your listings.
          Upload it if you have it. If you do not have it to hand, we can take
          the icon from your website instead, and you can replace it later.
        </span>

        <div className="flex flex-wrap items-center gap-4 rounded-card bg-surface p-5 shadow-hairline">
          <div className="flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-control bg-ground">
            {preview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Your logo as women will see it"
                className="size-full object-contain"
              />
            ) : (
              <Building2
                size={30}
                strokeWidth={1.5}
                className="text-ink-40"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="flex min-w-[220px] flex-1 flex-wrap gap-[10px]">
            <Button
              type="button"
              variant="secondary"
              size="inline"
              onClick={fetchFromWebsite}
              disabled={busy || website.trim().length === 0}
            >
              <Download size={16} strokeWidth={2} aria-hidden="true" />
              {busy ? "Looking…" : "Take it from my website"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="inline"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} strokeWidth={2} aria-hidden="true" />
              Upload a file
            </Button>

            {preview ? (
              <Button
                type="button"
                variant="secondary"
                size="inline"
                onClick={() => {
                  setChosen(null);
                  setSource(null);
                  setCandidates([]);
                  setRemoved(true);
                  setMessage(null);
                }}
              >
                <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {/* Kept out of the layout so the buttons above stay on one row. */}
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
          className="hidden"
          onChange={(event) => onUpload(event.target.files?.[0])}
        />

        {message ? (
          <span className="text-[14px] leading-[1.5] text-red-700">{message}</span>
        ) : null}

        {candidates.length > 1 ? (
          <div className="flex flex-col gap-[10px]">
            <span className="text-[14px] text-ink-60">
              We found more than one. Pick the one that looks right.
            </span>
            <div className="flex flex-wrap gap-[10px]">
              {candidates.map((candidate) => {
                const active = chosen === candidate.dataUrl;
                return (
                  <button
                    key={candidate.url}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setChosen(candidate.dataUrl);
                      setSource("fetched");
                    }}
                    className={`flex size-[56px] items-center justify-center rounded-control bg-surface p-2 ${
                      active ? "shadow-hairline-gold" : "shadow-hairline"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={candidate.dataUrl}
                      alt={`Icon from ${candidate.url}`}
                      className="size-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* What the action reads. The image travels as a data URL rather than
            a file input, because it can equally have come from the fetch. */}
        <input type="hidden" name="logoData" value={chosen ?? ""} />
        <input type="hidden" name="logoSource" value={source ?? ""} />
        <input type="hidden" name="logoRemoved" value={removed ? "1" : ""} />
      </div>
    </div>
  );
}
