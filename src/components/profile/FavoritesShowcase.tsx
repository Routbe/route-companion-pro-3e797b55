import { FAVORITE_KIND_EMOJI, FAVORITE_KIND_LABEL, type ProfileFavorite } from "@/lib/favorites";

interface Props {
  favorites: ProfileFavorite[];
  theme: { bg: string; text: string; muted: string; border: string };
}

/** Publieke strook met de favoriete films, series en boeken van een lid. */
export function FavoritesShowcase({ favorites, theme: t }: Props) {
  if (favorites.length === 0) return null;

  return (
    <section className="mt-6 w-full" aria-label="Favorieten">
      <h2
        className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: t.muted }}
      >
        Favorieten
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {favorites.map((fav) => {
          const inner = (
            <>
              <div
                className="aspect-[2/3] w-full overflow-hidden"
                style={{ background: t.border }}
              >
                {fav.imageUrl ? (
                  <img
                    src={fav.imageUrl}
                    alt={fav.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-2xl"
                    aria-hidden
                  >
                    {FAVORITE_KIND_EMOJI[fav.kind]}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium" style={{ color: t.text }}>
                  {fav.title}
                </p>
                <p className="truncate text-[10px]" style={{ color: t.muted }}>
                  {FAVORITE_KIND_EMOJI[fav.kind]} {FAVORITE_KIND_LABEL[fav.kind]}
                  {fav.note ? ` · ${fav.note}` : ""}
                </p>
              </div>
            </>
          );

          return (
            <li key={fav.id}>
              {fav.url ? (
                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden transition-opacity hover:opacity-80"
                  style={{ border: `1px solid ${t.border}` }}
                >
                  {inner}
                </a>
              ) : (
                <div className="overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
