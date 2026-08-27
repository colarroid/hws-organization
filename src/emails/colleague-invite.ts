/**
 * The invitation to join an organisation.
 *
 * Names the organisation, because that is the one thing the person needs in
 * order to decide whether this is expected. It does not name the colleague
 * who sent it: the invitation is keyed to an address, and someone forwarding
 * this email should not be able to lend their name to it.
 *
 * Deliberately plain, like the rest: no images, no tracking pixel, no
 * marketing footer.
 */
export function colleagueInvite(organisationName: string, acceptUrl: string) {
  const subject = `Join ${organisationName} on the HWS Portal`;

  const text = [
    `You have been invited to help manage ${organisationName} on the HWS Portal.`,
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

  const html = `<!doctype html>
<html lang="en-GB">
<body style="margin:0;background:#F9F6F1;font-family:Helvetica,Arial,sans-serif;color:#120902;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid rgba(18,9,2,0.16);border-radius:14px;padding:28px;">
        <tr><td>
          <p style="margin:0 0 20px;font-size:18px;line-height:1.6;">
            You have been invited to help manage
            <strong>${escapeHtml(organisationName)}</strong> on the HWS Portal.
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:rgba(18,9,2,0.7);">
            Accepting lets you post and edit the support your organisation
            offers. Verification stays with the organisation, so there is
            nothing to prove again.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:6px;background:#120902;">
              <a href="${escapeHtml(acceptUrl)}"
                 style="display:inline-block;padding:15px 28px;font-size:17px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                Accept the invitation
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:rgba(18,9,2,0.6);">
            The link works for 14 days. If you were not expecting this, ignore
            it: nothing happens until you open it and sign in.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
