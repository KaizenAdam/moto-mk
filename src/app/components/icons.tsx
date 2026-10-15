/*
 * The site's icons, from Tabler (@tabler/icons-react): one consistent,
 * professionally drawn line set on a 24px grid, in currentColor. Pages
 * import these names rather than Tabler directly, so the set can be swapped
 * in one place. Don't hand-draw SVG icons; add a Tabler one here instead.
 */
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconBolt,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCalendar,
  IconCamera,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconEngine,
  IconGauge,
  IconHeart,
  IconHeartFilled,
  IconHelmet,
  IconId,
  IconMapPin,
  IconMapPinFilled,
  IconMaximize,
  IconMenu2,
  IconMotorbike,
  IconPhone,
  IconSearch,
  IconShare2,
  IconShieldCheck,
  IconTool,
  IconUser,
  IconX,
  type Icon,
} from "@tabler/icons-react";

type IconProps = { className?: string };

function make(Tabler: Icon, defaultClass: string, stroke = 1.75) {
  function SiteIcon({ className = defaultClass }: IconProps) {
    return <Tabler className={className} stroke={stroke} aria-hidden />;
  }
  return SiteIcon;
}

/** Solid map pin, gold by default (town labels). */
export const PinIcon = make(IconMapPinFilled, "h-3.5 w-3.5 text-gold");
/** Outline map pin, for spec rows. */
export const PlaceIcon = make(IconMapPin, "h-4 w-4");

/** Riding style. */
export const BikeIcon = make(IconMotorbike, "h-4 w-4");
/** Engine size (cc). */
export const EngineIcon = make(IconEngine, "h-4 w-4");
/** Mileage. */
export const GaugeIcon = make(IconGauge, "h-4 w-4");
/** Engine type (2-stroke / 4-stroke / electric). */
export const FuelIcon = make(IconBolt, "h-4 w-4");
/** Year. */
export const CalendarIcon = make(IconCalendar, "h-4 w-4");
/** Licence category. */
export const IdIcon = make(IconId, "h-4 w-4");
/** Photo count. */
export const CameraIcon = make(IconCamera, "h-3.5 w-3.5");
/** Spare parts & accessories. */
export const WrenchIcon = make(IconTool, "h-5 w-5");
/** Riding gear. */
export const HelmetIcon = make(IconHelmet, "h-5 w-5");

export const HeartIcon = make(IconHeart, "h-4 w-4", 2);
export const HeartFilledIcon = make(IconHeartFilled, "h-4 w-4");
export const ShareIcon = make(IconShare2, "h-4 w-4");
export const PhoneIcon = make(IconPhone, "h-5 w-5", 2);
export const WhatsAppIcon = make(IconBrandWhatsapp, "h-5 w-5", 2);
export const SearchIcon = make(IconSearch, "h-5 w-5", 2);
export const ShieldIcon = make(IconShieldCheck, "h-5 w-5");
export const StoreIcon = make(IconBuildingStore, "h-4 w-4");
export const UserIcon = make(IconUser, "h-4 w-4");
export const WarningIcon = make(IconAlertTriangle, "h-4 w-4");
export const CheckIcon = make(IconCircleCheckFilled, "h-4 w-4");
export const ExpandIcon = make(IconMaximize, "h-4 w-4");
export const MenuIcon = make(IconMenu2, "h-5 w-5", 2);
export const CloseIcon = make(IconX, "h-5 w-5", 2);
export const ArrowLeftIcon = make(IconArrowLeft, "h-4 w-4", 2);
export const ArrowRightIcon = make(IconArrowRight, "h-4 w-4", 2);
export const ChevronLeftIcon = make(IconChevronLeft, "h-6 w-6", 2);
export const ChevronRightIcon = make(IconChevronRight, "h-6 w-6", 2);
