// Blocks obvious phone numbers / emails from landing in fields investors see
// before any connection is made (title, summary). Not foolproof — a determined
// person can obfuscate — but it catches the common, accidental case.

const PHONE_PATTERN = /(\+?\d[\s-]?){6,}/; // 6+ digits in a row, with optional spaces/dashes
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function containsContactInfo(text: string): boolean {
  return PHONE_PATTERN.test(text) || EMAIL_PATTERN.test(text);
}

export const CONTACT_INFO_ERROR =
  'Please remove any phone number or email from the title/summary — investors can see these fields before you connect, so contact info needs to stay out for now.';
