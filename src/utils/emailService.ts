import emailjs from "@emailjs/browser";

/**
 * EmailJS credentials. Public by design — the service id/template id and
 * public key are safe in client code; delivery is restricted by the
 * allowed-origins list configured in the EmailJS dashboard.
 *
 * Set these in `.env.local` (see `.env.example`). Without them the form
 * reports that direct email is the working route rather than showing a
 * success state for a message that went nowhere.
 */
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email delivery is not configured.");
    this.name = "EmailNotConfiguredError";
  }
}

/** Resolves only when EmailJS confirms the send. Throws otherwise. */
export async function sendEmail(
  name: string,
  email: string,
  message: string
): Promise<void> {
  // Checked individually rather than via the boolean so TS narrows them.
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new EmailNotConfiguredError();
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name: name,
      from_email: email,
      reply_to: email,
      message,
    },
    { publicKey: PUBLIC_KEY }
  );
}
