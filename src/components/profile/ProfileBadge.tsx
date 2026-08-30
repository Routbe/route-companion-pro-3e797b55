import { BadgeCheck } from "lucide-react";
import { HumanLinkedIcon } from "@/components/profile/HumanLinkedIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { monthYear } from "@/components/profile/VerifiedBadgePopover";
import { useI18n } from "@/lib/i18n";
import {
  BADGE_HUMAN_BODY,
  BADGE_VERIFIED_BODY,
  formatBadgeName,
  type BadgeNameFormat,
  type BadgeType,
} from "@/lib/profile-display";

/**
 * Duale badge: het klassieke blauwe vinkje (identiteit gevalideerd) of het
 * neutrale privacy-schild (bevestigd mens, naam blijft privé).
 */
export function ProfileBadge({
  type,
  verifiedAt,
  legalName,
  nameFormat = "full",
  size = "md",
  cardBg,
  cardBorder,
  textColor,
  mutedColor,
}: {
  type: BadgeType;
  verifiedAt?: string | null;
  legalName?: string | null;
  nameFormat?: BadgeNameFormat;
  size?: "sm" | "md";
  cardBg?: string;
  cardBorder?: string;
  textColor?: string;
  mutedColor?: string;
}) {
  const { t, locale } = useI18n();
  const on = monthYear(verifiedAt, locale || "nl");
  const human = type === "human";
  const Icon = human ? HumanLinkedIcon : BadgeCheck;
  const iconClass = `${size === "md" ? "h-6 w-6" : "h-5 w-5"} ${
    human ? "opacity-80" : "text-[#1d9bf0]"
  }`;
  const title = human
    ? "Gekoppeld aan een geverifieerd account"
    : t("profile.verified_badge_title");
  // Het blauwe vinkje toont bij het openklikken altijd de echte, volledige naam:
  // de weergavenaam mag vrij zijn, de identiteit erachter niet.
  const shownName = human ? "" : (legalName ?? "").trim() || formatBadgeName(legalName ?? "", nameFormat);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={title}
          title={title}
          className="inline-flex items-center transition-opacity hover:opacity-70 focus:outline-none"
        >
          <Icon className={iconClass} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-72 rounded-xl border p-4 text-left"
        style={cardBg ? { background: cardBg, borderColor: cardBorder, color: textColor } : undefined}
      >
        <div className="flex items-start gap-2">
          <Icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${human ? "opacity-70" : "text-[#1d9bf0]"}`}
            aria-hidden
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-tight">{title}</p>
            {shownName && (
              <p className="text-xs font-medium" style={mutedColor ? { color: mutedColor } : undefined}>
                {shownName}
              </p>
            )}
            {!human && on && (
              <p className="text-xs" style={mutedColor ? { color: mutedColor } : undefined}>
                {t("profile.verified_on")} {on}
              </p>
            )}
            <p
              className="text-xs leading-relaxed"
              style={mutedColor ? { color: mutedColor } : undefined}
            >
              {human ? BADGE_HUMAN_BODY : BADGE_VERIFIED_BODY}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
