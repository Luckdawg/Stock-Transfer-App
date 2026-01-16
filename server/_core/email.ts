import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

const EMAIL_MAX_LENGTH = 50000;

const buildEmailEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("webdevtoken.v1.WebDevService/SendEmail", normalizedBase).toString();
};

/**
 * Sends an email through the Manus Email Service.
 * Returns `true` if the email was sent successfully, `false` otherwise.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!payload.to || !payload.subject || !payload.body) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email to, subject, and body are required.",
    });
  }

  if (payload.body.length > EMAIL_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Email body must be at most ${EMAIL_MAX_LENGTH} characters.`,
    });
  }

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service URL is not configured.",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service API key is not configured.",
    });
  }

  const endpoint = buildEmailEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Error calling email service:", error);
    return false;
  }
}
