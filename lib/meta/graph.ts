import crypto from 'crypto';

const GRAPH_VERSION = 'v21.0';

/**
 * Meta webhook-ийн POST хүсэлт үнэхээр Meta-аас ирсэн эсэхийг шалгах.
 * X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(rawBody, APP_SECRET)
 */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  // Урттай тэнцүү биш бол timingSafeEqual алдаа өгөх тул эхлээд шалгана
  if (signatureHeader.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

/**
 * Хэрэглэгч рүү текст мессеж буцааж илгээх (Send API).
 * pageAccessToken нь тухайн клиникийн meta_page_access_token.
 */
export async function sendTextMessage(
  pageAccessToken: string,
  recipientId: string,
  text: string
): Promise<void> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/messages?access_token=${encodeURIComponent(
    pageAccessToken
  )}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: 'RESPONSE',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Meta send failed:', res.status, body);
  }
}
