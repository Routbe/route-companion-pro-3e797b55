/**
 * Favorieten van een profiel: films, series, boeken, muziek of games die een
 * lid wil delen. De afbeelding komt standaard van de gedeelde site (og:image),
 * maar kan altijd handmatig overschreven worden met een eigen link.
 */

export const FAVORITE_KINDS = ["film", "serie", "boek", "muziek", "game", "anders"] as const;
export type FavoriteKind = (typeof FAVORITE_KINDS)[number];

export const FAVORITE_KIND_LABEL: Record<FavoriteKind, string> = {
  film: "Film",
  serie: "Serie",
  boek: "Boek",
  muziek: "Muziek",
  game: "Game",
  anders: "Anders",
};

export const FAVORITE_KIND_EMOJI: Record<FavoriteKind, string> = {
  film: "🎬",
  serie: "📺",
  boek: "📚",
  muziek: "🎧",
  game: "🎮",
  anders: "⭐",
};

/** Maximum aantal favorieten per profiel — houdt de publieke pagina rustig. */
export const MAX_FAVORITES = 6;

export interface ProfileFavorite {
  id: string;
  kind: FavoriteKind;
  title: string;
  /** Bronlink (IMDb, Goodreads, Spotify, …). Optioneel. */
  url: string | null;
  /** Afbeelding: automatisch opgehaald of door het lid ingesteld. */
  imageUrl: string | null;
  /** Korte toelichting van het lid. */
  note: string | null;
}

const httpsUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^https?:\/\/\S+$/.test(trimmed) && trimmed.length <= 600 ? trimmed : null;
};

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
};

export function newFavoriteId(): string {
  return `fav_${Math.random().toString(36).slice(2, 10)}`;
}

/** Leest een onbetrouwbare JSON-waarde veilig uit als favorietenlijst. */
export function normalizeFavorites(raw: unknown): ProfileFavorite[] {
  if (!Array.isArray(raw)) return [];
  const out: ProfileFavorite[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const r = entry as Record<string, unknown>;
    const title = text(r["title"], 80);
    if (!title) continue;
    const kind = FAVORITE_KINDS.includes(r["kind"] as FavoriteKind)
      ? (r["kind"] as FavoriteKind)
      : "anders";
    out.push({
      id: text(r["id"], 40) ?? newFavoriteId(),
      kind,
      title,
      url: httpsUrl(r["url"]),
      imageUrl: httpsUrl(r["imageUrl"]),
      note: text(r["note"], 120),
    });
    if (out.length >= MAX_FAVORITES) break;
  }
  return out;
}
