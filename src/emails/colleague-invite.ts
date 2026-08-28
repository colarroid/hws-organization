import {
  emailButton,
  emailLayout,
  emailText,
  escapeHtml,
} from "@/emails/layout";

/**
 * The invitation to join an organisation.
 *
 * Names the organisation, because that is the one thing the person needs in
 * order to decide whether this is expected. It does not name the colleague
 * who sent it: the invitation is keyed to an address, and someone forwarding
 * this email should not be able to lend their name to it.
 */
export function colleagueInvite(organisationName: string, acceptUrl: string) {
  const subject = `Join ${organisationName} on HWS Path Grid`;

  const text = [
    `You have been invited to help manage ${organisationName} on HWS Path Grid.`,
    "",
    "Accepting lets you post and edit the support your organisation offers.",
    "Verification stays with the organisation, so there is nothing to prove",
    "again.",
    "",
    `Accept the invitation: ${acceptUrl}`,
    "",
    "The link works for 14 days. If you were not expecting this, ignore it:",
    "nothing happens until you open it and sign in.",
  ].join("\n");

  const html = emailLayout({
    preheader: `You can post and edit the support ${organisationName} offers.`,
    heading: `Join ${organisationName}`,
    body:
      emailText(
        `You have been invited to help manage <strong>${escapeHtml(organisationName)}</strong> on HWS Path Grid.`,
      ) +
      emailText(
        "Accepting lets you post and edit the support your organisation offers. Verification stays with the organisation, so there is nothing for you to prove again.",
        "muted",
      ) +
      emailButton("Accept the invitation", acceptUrl),
    footnote:
      "The link works for 14 days. If you were not expecting this, ignore it: nothing happens until you open it and sign in.",
  });

  return { subject, html, text };
}
