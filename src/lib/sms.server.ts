/**
 * Transactionele SMS via Brevo (server-only).
 *
 * Zelfde contract als de mailer: nooit gooien, altijd een resultaat met de
 * providerfout erin, zodat een mislukte SMS geen webhook of adminactie breekt.
 */

const BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [400, 1200];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function brevoKey(): string | null {
  const key = process.env["BREVO_API_KEY"];
  return key && key.trim().length > 0 ? key.trim() : null;
}

/** Afzendernaam mag maximaal 11 alfanumerieke tekens zijn bij Brevo. */
function smsSender(): string {
  const raw = process.env["BREVO_SMS_SENDER"] ?? "ROUT";
  return raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 11) || "ROUT";
}

export function isSmsConfigured(): boolean {
  return brevoKey() !== null;
}

/**
 * Normaliseert naar E.164 zonder `+` (Brevo verwacht `32470123456`).
 * Geeft `null` bij een nummer dat onmogelijk geldig kan zijn.
 */
export function normalizePhone(raw: string | null | undefined, defaultCountry = "32"): string | null {
  if (!raw) return null;
  let value = raw.replace(/[\s().-]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (value.startsWith("+")) value = value.slice(1);
  else if (value.startsWith("0")) value = `${defaultCountry}${value.slice(1)}`;
  if (!/^[1-9][0-9]{7,14}$/.test(value)) return null;
  return value;
}

export interface SmsResult {
  sent: boolean;
  error?: string;
}

export async function sendSms(options: {
  to: string;
  text: string;
  tag?: string;
}): Promise<SmsResult> {
  const key = brevoKey();
  if (!key) return { sent: false, error: "SMS is niet geconfigureerd (BREVO_API_KEY ontbreekt)." };

  const recipient = normalizePhone(options.to);
  if (!recipient) return { sent: false, error: "Ongeldig telefoonnummer." };

  const body = {
    sender: smsSender(),
    recipient,
    content: options.text.slice(0, 640),
    type: "transactional",
    ...(options.tag ? { tag: options.tag } : {}),
  };

  let lastError = "Kon de SMS-provider niet bereiken.";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(BREVO_SMS_ENDPOINT, {
        method: "POST",
        headers: {
          "api-key": key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) return { sent: true };
      const text = await res.text();
      lastError = `SMS ${res.status}: ${text.slice(0, 300)}`;
      console.error("[sms] verzenden mislukt", { status: res.status, body: text.slice(0, 300) });
      const transient = res.status === 408 || res.status === 429 || res.status >= 500;
      if (!transient) return { sent: false, error: lastError };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error("[sms] netwerkfout", lastError);
    }
    if (attempt < MAX_ATTEMPTS) await wait(BACKOFF_MS[attempt - 1] ?? 1200);
  }
  return { sent: false, error: lastError };
}
