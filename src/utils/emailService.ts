import { personalInfo } from "../data/portfolioData";

/**
 * Contact-form delivery via FormSubmit, entirely from the browser — this
 * project ships as static files and has no server to post to.
 *
 * FormSubmit needs no API key and no environment variables: the destination
 * address is the endpoint. It is activated once, by clicking the confirmation
 * link FormSubmit emails on the very first submission to a new address; after
 * that it forwards silently.
 *
 * The address is visible in the bundle, but it is already published in the
 * contact section, so this exposes nothing new. To keep it out of the markup
 * anyway, swap in the random alias FormSubmit shows on its dashboard —
 * `https://formsubmit.co/ajax/<alias>` behaves identically.
 */
const ENDPOINT = `https://formsubmit.co/ajax/${personalInfo.email}`;

/** Resolves only when FormSubmit confirms the send. Throws otherwise. */
export async function sendEmail(
  name: string,
  email: string,
  message: string
): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: `Portfolio enquiry from ${name}`,
      _template: "table",
      _captcha: "false",
    }),
  });

  const body: { success?: boolean | string; message?: string } | null =
    await response.json().catch(() => null);

  // FormSubmit returns `success` as the string "true", not a boolean.
  const ok = body?.success === true || body?.success === "true";

  if (!response.ok || !ok) {
    throw new Error(body?.message ?? `FormSubmit responded ${response.status}`);
  }
}
