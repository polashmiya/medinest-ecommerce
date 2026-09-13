import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, BadgePercent, Baby, Banknote, Bell, Bookmark, BriefcaseMedical, Building2, Calendar,
  Camera, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, CircleHelp, Clock, Copy, CreditCard, Download, Droplet,
  Dumbbell, ExternalLink, Eye, FileText, FileUp, Filter, Flame, FlaskConical, Gift, Globe, Headphones, Heart, HeartPulse, House,
  Inbox, Info, Languages, LayoutGrid, Leaf, List, LoaderCircle, Lock, LogOut, Mail, MapPin, Menu, MessageCircle, Microscope, Minus,
  Monitor, Moon, Package, Palette, PawPrint, Percent, Phone, Pill, Plus, Quote, RefreshCw, RotateCcw, Search, Settings, Share2,
  ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Snowflake, Sparkles, SprayCan, Star, Stethoscope, Store,
  Sun, Syringe, Tag, Tags, Thermometer, Ticket, Timer, Trash2, TrendingUp, TriangleAlert, Truck, Type, Upload, User, Video, Wallet,
  X, Zap, type LucideIcon, type LucideProps,
} from "lucide-react";

/**
 * Icon registry. Config files reference icons by kebab-case name so they stay
 * serialisable (and editable by non-developers); components resolve them here.
 */
export const icons = {
  activity: Activity, "arrow-left": ArrowLeft, "arrow-right": ArrowRight, "badge-check": BadgeCheck, "badge-percent": BadgePercent,
  baby: Baby, banknote: Banknote, bell: Bell, bookmark: Bookmark, "briefcase-medical": BriefcaseMedical, building: Building2,
  calendar: Calendar, camera: Camera, check: Check, "chevron-down": ChevronDown, "chevron-left": ChevronLeft, "chevron-right": ChevronRight,
  "circle-check": CircleCheck, help: CircleHelp, clock: Clock, copy: Copy, "credit-card": CreditCard, download: Download, droplet: Droplet,
  dumbbell: Dumbbell, "external-link": ExternalLink, eye: Eye, "file-text": FileText, "file-up": FileUp, filter: Filter, flame: Flame,
  "flask-conical": FlaskConical, gift: Gift, globe: Globe, headphones: Headphones, heart: Heart, "heart-pulse": HeartPulse, home: House,
  inbox: Inbox, info: Info, languages: Languages, "layout-grid": LayoutGrid, leaf: Leaf, list: List, loader: LoaderCircle, lock: Lock,
  "log-out": LogOut, mail: Mail, "map-pin": MapPin, menu: Menu, "message-circle": MessageCircle, microscope: Microscope, minus: Minus,
  monitor: Monitor, moon: Moon, package: Package, palette: Palette, "paw-print": PawPrint, percent: Percent, phone: Phone, pill: Pill,
  plus: Plus, quote: Quote, refresh: RefreshCw, "rotate-ccw": RotateCcw, search: Search, settings: Settings, share: Share2,
  "shield-check": ShieldCheck, "shopping-bag": ShoppingBag, "shopping-cart": ShoppingCart, sliders: SlidersHorizontal, smartphone: Smartphone,
  snowflake: Snowflake, sparkles: Sparkles, "spray-can": SprayCan, star: Star, stethoscope: Stethoscope, store: Store, sun: Sun,
  syringe: Syringe, tag: Tag, tags: Tags, thermometer: Thermometer, ticket: Ticket, timer: Timer, trash: Trash2, "trending-up": TrendingUp,
  warning: TriangleAlert, truck: Truck, type: Type, upload: Upload, user: User, video: Video, wallet: Wallet, x: X, zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: { name: IconName | (string & {}) } & LucideProps) {
  const Cmp = (icons as Record<string, LucideIcon>)[name] ?? Package;
  return <Cmp aria-hidden="true" strokeWidth={1.9} {...props} />;
}

/** Department icons for root categories (by product type), used by nav and tiles. */
export const departmentIcons: Record<string, IconName> = {
  medicine: "pill", healthcare: "stethoscope", beauty: "sparkles", sexual_wellness: "heart", baby: "baby", herbal: "leaf",
  homecare: "spray-can", supplement: "dumbbell", food: "package", pet: "paw-print", veterinary: "paw-print", homeopathy: "droplet",
};
