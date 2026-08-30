import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/middleware";

/**
 * Haalt de titel en de og:image van een gedeelde pagina op, zodat een favoriete
 * film, serie of boek automatisch de site-afbeelding toont. Het lid kan de
 * afbeelding daarna altijd zelf overschrijven.
 */
export const fetchLinkPreview = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) => z.object({ url: z.string().url().max(600) }).parse(data))
  .handler(async ({ data, context }) => {
    const { enforceRateLimit } = await import("./rate-limit.server");
    enforceRateLimit(`link-preview:${context.userId}`, 20, 60_000);

    let target: URL;
    try {
      target = new URL(data.url);
    } catch {
      return { ok: false as const, reason: "invalid_url" as const };
    }
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      return { ok: false as const, reason: "invalid_url" as const };
    }
    // Geen interne adressen ophalen (SSRF-bescherming).
    const host = target.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|\[?::1)/.test(host)
    ) {
      return { ok: false as const, reason: "blocked_host" as const };
    }

    try {
      const res = await fetch(target.toString(), {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "ROUT-LinkPreview/1.0", accept: "text/html,*/*" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return { ok: false as const, reason: "unreachable" as const };
      const html = (await res.text()).slice(0, 300_000);

      const meta = (names: string[]): string | null => {
        for (const name of names) {
          const re = new RegExp(
            `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']|` +
              `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
            "i",
          );
          const m = re.exec(html);
          const value = (m?.[1] ?? m?.[2] ?? "").trim();
          if (value) return value;
        }
        return null;
      };

      const rawImage = meta(["og:image", "og:image:url", "twitter:image", "twitter:image:src"]);
      const rawTitle =
        meta(["og:title", "twitter:title"]) ??
        (/<title[^>]*>([^<]{1,200})<\/title>/i.exec(html)?.[1] ?? null);

      const imageUrl = rawImage ? new URL(rawImage, target).toString() : null;
      return {
        ok: true as const,
        title: rawTitle ? rawTitle.trim().slice(0, 80) : null,
        imageUrl: imageUrl && /^https?:\/\//.test(imageUrl) ? imageUrl : null,
      };
    } catch (err) {
      console.error("[link-preview] ophalen mislukt", {
        host,
        error: err instanceof Error ? err.message : String(err),
      });
      return { ok: false as const, reason: "unreachable" as const };
    }
  });
