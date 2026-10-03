import type {
  AvailabilityContent,
  BlockContent,
  BlockLayout,
  BlockType,
  ExperienceContent,
  IdentityContent,
  LinkContent,
  MapContent,
  ProjectsContent,
  QuoteContent,
  SocialContent,
  TechStackContent,
  ToolsContent,
  WorkContent,
} from "@/app/lib/types";
import { getBlockDefinition } from "@/app/lib/block-registry";
import type { V2AdditionalBlock, V2PortfolioData, V2Project, V2SocialLink } from "./types";

interface MapProfileInput {
  username: string;
  isPro: boolean;
  theme?: "light" | "dark";
  avatarUrl?: string | null;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  mode?: "public" | "editor";
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMeaningfulIdentityText(value: unknown) {
  if (!hasText(value)) return false;
  const trimmed = value.trim();
  return trimmed !== "Your Name" && trimmed !== "Product Designer @ YourStudio";
}

function isValidHref(value: unknown): value is string {
  if (!hasText(value)) return false;
  const trimmed = value.trim();

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return true;

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

// Uploaded pictures are stored inline as data: URLs.
function isImageSrc(value: unknown): value is string {
  if (!hasText(value)) return false;
  const trimmed = value.trim();
  return /^data:image\//i.test(trimmed) || trimmed.startsWith("/") || isValidHref(trimmed);
}

function hasItems<T>(items: T[] | undefined, predicate: (item: T) => boolean) {
  return Array.isArray(items) && items.some(predicate);
}

export function hasRenderableBlockContent(blockType: BlockType, content?: BlockContent) {
  if (!content || content.type !== blockType) return false;

  switch (content.type) {
    case "identity":
      return (
        hasMeaningfulIdentityText(content.data.name) &&
        (hasMeaningfulIdentityText(content.data.headline) ||
          hasMeaningfulIdentityText(content.data.title))
      );
    case "map":
      return hasText(content.data.location) && content.data.location.trim() !== "Your City";
    case "techstack":
      return hasItems(content.data.items, (item) => hasText(item.name));
    case "experience":
      return hasItems(
        content.data.items,
        (item) => hasText(item.role) || hasText(item.company) || hasText(item.period)
      );
    case "spotify":
      return isValidHref(content.data.spotifyUrl) || hasText(content.data.trackName);
    case "link":
      return isValidHref(content.data.url);
    case "work":
      return hasItems(content.data.items, (item) => hasText(item.title));
    case "education":
      return hasItems(
        content.data.items,
        (item) => hasText(item.school) || hasText(item.degree) || hasText(item.period)
      );
    case "saas":
      return hasText(content.data.name) || hasText(content.data.tagline) || isValidHref(content.data.url);
    case "github":
      return (
        hasText(content.data.username) ||
        hasText(content.data.displayName) ||
        hasText(content.data.bio) ||
        isValidHref(content.data.profileUrl)
      );
    case "projects":
      return hasItems(content.data.items, (item) => hasText(item.name) && isValidHref(item.url));
    case "social":
      return hasItems(
        content.data.items,
        (item) => (hasText(item.platform) || hasText(item.username)) && isValidHref(item.url)
      );
    case "availability":
      return hasText(content.data.status) || hasText(content.data.message) || hasText(content.data.nextOpening);
    case "quote":
      return hasText(content.data.quote);
    case "resume":
      return isValidHref(content.data.fileUrl);
    case "gallery":
      return hasItems(content.data.images, (item) => isImageSrc(item.src));
    case "youtube":
      return isValidHref(content.data.url);
    case "services":
      return hasItems(content.data.items, hasText);
    case "tools":
      return hasItems(content.data.items, (item) => hasText(item.name));
    case "stats":
      return hasItems(content.data.items, (item) => hasText(item.label) && hasText(item.value));
    case "instagram":
      return hasText(content.data.handle) || isValidHref(content.data.profileUrl);
    default:
      return false;
  }
}

function firstLayoutItemForMode(
  layout: BlockLayout[],
  content: Record<string, BlockContent>,
  type: BlockType,
  mode: "public" | "editor"
) {
  return layout.find((item) => {
    const block = content[item.id];
    if (item.type !== type || block?.type !== type) return false;
    return mode === "editor" || hasRenderableBlockContent(type, block);
  });
}

function firstBlockForMode<T extends BlockContent["type"]>(
  layout: BlockLayout[],
  content: Record<string, BlockContent>,
  type: T,
  mode: "public" | "editor"
): Extract<BlockContent, { type: T }> | undefined {
  const layoutItem = firstLayoutItemForMode(layout, content, type, mode);
  const block = layoutItem ? content[layoutItem.id] : undefined;

  return block?.type === type ? (block as Extract<BlockContent, { type: T }>) : undefined;
}

export function draftMessageForBlock(type: BlockType) {
  switch (type) {
    case "identity":
      return "Add your introduction";
    case "work":
    case "projects":
      return "Add your first project";
    case "resume":
      return "Add a resume URL";
    case "gallery":
      return "Upload images";
    case "map":
      return "Add your location";
    case "social":
      return "Add your social links";
    case "spotify":
    case "youtube":
    case "instagram":
      return "Add an embed link";
    case "github":
      return "Add your GitHub username";
    default:
      return "Complete this block";
  }
}

export function normalizeHref(value?: string) {
  if (!isValidHref(value)) return undefined;
  const trimmed = value.trim();

  if (trimmed.includes("@") && !trimmed.startsWith("mailto:")) {
    return `mailto:${trimmed}`;
  }

  if (/^(mailto:|https?:\/\/)/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeSocialPlatform(platform?: string) {
  const normalized = platform?.trim().toLowerCase() || "";
  if (normalized === "x/twitter" || normalized === "x") return "twitter";
  return normalized.replace(/[^a-z]/g, "");
}

function socialKind(platform?: string): V2SocialLink["kind"] {
  const normalized = normalizeSocialPlatform(platform);
  switch (normalized) {
    case "github":
    case "instagram":
    case "linkedin":
    case "twitter":
      return normalized;
    case "email":
      return "mail";
    case "website":
      return "website";
    default:
      return "default";
  }
}

function socialDisplayName(platform?: string) {
  const normalized = normalizeSocialPlatform(platform);
  switch (normalized) {
    case "github":
      return "GitHub";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "twitter":
      return "X/Twitter";
    case "youtube":
      return "YouTube";
    case "dribbble":
      return "Dribbble";
    case "behance":
      return "Behance";
    case "tiktok":
      return "TikTok";
    case "facebook":
      return "Facebook";
    case "threads":
      return "Threads";
    case "website":
      return "Website";
    case "email":
      return "Email";
    case "other":
      return "Other";
    default:
      return hasText(platform) ? platform.trim() : "Link";
  }
}

function mapSocials(social?: SocialContent): V2SocialLink[] {
  return (
    social?.items.reduce<V2SocialLink[]>((links, item) => {
      const href = normalizeHref(item.url);
      const platform = socialDisplayName(item.platform);
      const label = hasText(item.username) ? item.username.trim() : platform;

      if (!href || !hasText(label)) return links;

      links.push({
        label,
        href,
        kind: socialKind(item.platform),
        platform,
        username: item.username,
        external: !href.startsWith("mailto:"),
      });

      return links;
    }, []) || []
  );
}

function optionalLabel(
  source: object | undefined,
  key: "eyebrow" | "heading",
  fallback: string
) {
  if (!source || !(key in source)) return fallback;
  const value = (source as { eyebrow?: unknown; heading?: unknown })[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function mapSocialBlock(social?: SocialContent, mode: "public" | "editor" = "public") {
  if (!social) return undefined;

  const items = mapSocials(social);
  if (mode === "public" && items.length === 0) return undefined;
  const variant: "icons" | "labels" | "list" =
    social.variant === "labels" || social.variant === "list" || social.variant === "icons"
      ? social.variant
      : items.length <= 3
        ? "icons"
        : "labels";

  return {
    eyebrow: optionalLabel(social, "eyebrow", "Connect"),
    heading: optionalLabel(social, "heading", "Social Links"),
    variant,
    items,
  };
}

function mapIdentityShortcuts(identity?: IdentityContent): V2SocialLink[] {
  const links: V2SocialLink[] = [];
  const email = normalizeHref(identity?.email);
  const website = normalizeHref(identity?.website);

  if (email) {
    links.push({ label: "Email", href: email, kind: "mail" });
  }

  if (website) {
    links.push({ label: "Website", href: website, kind: "website" });
  }

  return links;
}

function mapExperience(experience?: ExperienceContent) {
  return experience?.items
    .filter((item) => hasText(item.role) || hasText(item.company))
    .map((item) => ({
      period: formatExperiencePeriod(item),
      role: [item.role, item.company].filter(hasText).join(" / "),
      description: item.description,
      location: item.location,
      companyUrl: normalizeHref(item.companyUrl),
      logo: item.logo,
    }));
}

function formatExperiencePeriod(item: ExperienceContent["items"][number]) {
  if (hasText(item.startDate) || hasText(item.endDate) || item.isCurrent) {
    return [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(hasText).join(" - ");
  }

  return item.period || "";
}

function mapWorkProjects(work?: WorkContent): V2Project[] {
  return (
    work?.items
      .filter((item) => hasText(item.title))
      .map((item) => {
        const image =
          typeof item.image === "string" && item.image.trim().length > 0
            ? item.image.trim()
            : undefined;

        return {
          title: item.title.trim(),
          type: item.category || item.client,
          year: item.year,
          image: image && /^(https?:\/\/|\/)/.test(image) ? image : undefined,
          href: normalizeHref(item.url),
        };
      }) || []
  );
}

function mapCodeProjects(projects?: ProjectsContent): V2Project[] {
  return (
    projects?.items
      .filter((item) => hasText(item.name) && isValidHref(item.url))
      .map((item) => ({
        title: item.name.trim(),
        type: item.language || "Code",
        href: normalizeHref(item.url),
      })) || []
  );
}

function mapSkills(techstack?: TechStackContent, tools?: ToolsContent) {
  const techItems = techstack?.items.map((item) => item.name).filter(hasText) || [];
  const toolItems = tools?.items.map((item) => item.name).filter(hasText) || [];
  return [...techItems, ...toolItems];
}

function mapContact(link?: LinkContent, mode: "public" | "editor" = "public") {
  const rawDestination = link?.url?.trim() || "";
  const isEmailLike =
    /^mailto:/i.test(rawDestination) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rawDestination);
  const actionType: "email" | "copy-email" =
    link?.actionType === "copy-email" ? "copy-email" : "email";
  const emailAddress = isEmailLike ? rawDestination.replace(/^mailto:/i, "") : undefined;
  const emailParams = new URLSearchParams({
    ...(link?.emailSubject ? { subject: link.emailSubject } : {}),
    ...(link?.emailBody ? { body: link.emailBody } : {}),
  }).toString();
  const emailHref =
    emailAddress && actionType === "email"
      ? `mailto:${emailAddress}${emailParams ? `?${emailParams}` : ""}`
      : undefined;
  const validHref = actionType === "email" ? emailHref : undefined;
  const hasValidAction =
    actionType === "copy-email"
      ? Boolean(emailAddress)
      : Boolean(validHref);

  const hasTitle = hasText(link?.title);
  if (mode === "public" && (!hasTitle || !hasValidAction)) return undefined;
  if (mode === "editor" && !link) return undefined;

  return {
    label: hasText(link?.buttonLabel) ? link.buttonLabel.trim() : hasText(link?.title) ? link.title.trim() : "Contact",
    eyebrow: optionalLabel(link, "eyebrow", "Start here"),
    title: hasTitle ? link.title.trim() : "Add a call to action",
    description: link?.description,
    buttonLabel: link?.buttonLabel,
    href: hasValidAction && actionType !== "copy-email" ? validHref : undefined,
    actionType,
    variant: link?.variant,
    openInNewTab: link?.openInNewTab,
    copyValue: actionType === "copy-email" ? emailAddress : undefined,
  };
}

export function hasValidCoordinates(map?: MapContent) {
  return Boolean(
    map &&
      Number.isFinite(map.lat) &&
      Number.isFinite(map.lng) &&
      Math.abs(map.lat) <= 90 &&
      Math.abs(map.lng) <= 180 &&
      !(map.lat === 0 && map.lng === 0)
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function mapEmbedUrl(lat: number, lng: number, zoom: number) {
  const safeZoom = clampNumber(Math.round(zoom), 1, 19);
  const longitudeSpan = (360 / 2 ** safeZoom) * 1.2;
  const latitudeSpan = (170 / 2 ** safeZoom) * 1.2;
  const minLng = clampNumber(lng - longitudeSpan / 2, -180, 180);
  const maxLng = clampNumber(lng + longitudeSpan / 2, -180, 180);
  const minLat = clampNumber(lat - latitudeSpan / 2, -85, 85);
  const maxLat = clampNumber(lat + latitudeSpan / 2, -85, 85);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;
}

function mapLocationBlock(map?: MapContent, mode: "public" | "editor" = "public") {
  const hasLocation = hasText(map?.location) && map.location.trim() !== "Your City";
  if (!hasLocation && mode === "public") return undefined;
  if (!map) return undefined;

  const hasCoords = hasValidCoordinates(map);
  const zoom = typeof map?.zoom === "number" && map.zoom > 0 ? clampNumber(map.zoom, 1, 19) : 12;
  const variant = map?.variant || (hasCoords ? "map" : "text");
  const generatedMapUrl =
    hasCoords && map
      ? mapEmbedUrl(map.lat, map.lng, zoom)
      : undefined;
  const generatedActionUrl =
    hasCoords && map
      ? `https://www.openstreetmap.org/?mlat=${map.lat}&mlon=${map.lng}#map=${zoom}/${map.lat}/${map.lng}`
      : undefined;

  return {
    eyebrow: map?.eyebrow || "LOCATION",
    heading: map?.heading || (hasLocation ? map.location : "Add your location"),
    location: hasLocation ? map.location.trim() : "Add your location",
    description: map.description,
    timezone: map.timezone,
    variant,
    lat: hasCoords ? map.lat : undefined,
    lng: hasCoords ? map.lng : undefined,
    mapUrl: normalizeHref(map?.mapUrl) || generatedMapUrl,
    actionUrl: normalizeHref(map?.actionUrl) || generatedActionUrl,
    zoom,
  };
}

function mapAvailability(availability?: AvailabilityContent) {
  if (!availability) return undefined;

  const title = availability.nextOpening || availability.message || availability.status;

  if (!hasText(title)) return undefined;

  return {
    title: title.trim(),
    body: [availability.rate, availability.responseTime, availability.timezone].filter(hasText).join(" / "),
    ctaLabel: availability.ctaLabel || "Send brief",
    href: normalizeHref(availability.preferredContact),
  };
}

function mapTestimonial(quote?: QuoteContent) {
  if (!hasText(quote?.quote)) return undefined;

  return {
    quote: quote.quote.trim(),
    cite: [quote.author, quote.role || quote.company].filter(hasText).join(" / "),
  };
}

export function mapProfileToV2Portfolio({
  username,
  isPro,
  theme = "light",
  avatarUrl,
  layout,
  content,
  mode = "public",
}: MapProfileInput): V2PortfolioData {
  const identityBlock = firstBlockForMode(layout, content, "identity", mode);
  const socialBlock = firstBlockForMode(layout, content, "social", mode);
  const mapBlock = firstBlockForMode(layout, content, "map", mode);
  const experienceBlock = firstBlockForMode(layout, content, "experience", mode);
  const linkBlock = firstBlockForMode(layout, content, "link", mode);
  const workBlock = firstBlockForMode(layout, content, "work", mode);
  const projectsBlock = firstBlockForMode(layout, content, "projects", mode);
  const techstackBlock = firstBlockForMode(layout, content, "techstack", mode);
  const toolsBlock = firstBlockForMode(layout, content, "tools", mode);
  const availabilityBlock = firstBlockForMode(layout, content, "availability", mode);
  const quoteBlock = firstBlockForMode(layout, content, "quote", mode);
  const identity = identityBlock?.data;
  const social = socialBlock?.data;
  const map = mapBlock?.data;
  const experience = experienceBlock?.data;
  const link = linkBlock?.data;
  const work = workBlock?.data;
  const projects = projectsBlock?.data;
  const techstack = techstackBlock?.data;
  const tools = toolsBlock?.data;
  const availability = availabilityBlock?.data;
  const quote = quoteBlock?.data;
  const identityItem = firstLayoutItemForMode(layout, content, "identity", mode);
  const socialItem = firstLayoutItemForMode(layout, content, "social", mode);
  const mapItem = firstLayoutItemForMode(layout, content, "map", mode);
  const experienceItem = firstLayoutItemForMode(layout, content, "experience", mode);
  const linkItem = firstLayoutItemForMode(layout, content, "link", mode);
  const workItem = firstLayoutItemForMode(layout, content, "work", mode);
  const projectsItem = firstLayoutItemForMode(layout, content, "projects", mode);
  const techstackItem = firstLayoutItemForMode(layout, content, "techstack", mode);
  const toolsItem = firstLayoutItemForMode(layout, content, "tools", mode);
  const availabilityItem = firstLayoutItemForMode(layout, content, "availability", mode);
  const quoteItem = firstLayoutItemForMode(layout, content, "quote", mode);
  const mappedProjects = [...mapWorkProjects(work), ...mapCodeProjects(projects)];
  const mappedSkills = mapSkills(techstack, tools);
  const mappedExperience = mapExperience(experience);
  const mappedContact = mapContact(link, mode);
  const mappedSocialBlock = mapSocialBlock(social, mode);
  const mappedLocationBlock = mapLocationBlock(map, mode);
  const mappedAvailability = mapAvailability(availability);
  const mappedTestimonial = mapTestimonial(quote);
  const portraitSrc = (() => {
    if (!identity || identity.portraitType === "none") return undefined;
    if (identity.portraitType === "memoji") return identity.avatar || undefined;
    if (identity.portraitType === "photo") return identity.avatar || avatarUrl || undefined;
    return identity.avatar || avatarUrl || undefined;
  })();
  const displayName =
    identity && hasMeaningfulIdentityText(identity.name) ? identity.name.trim() : username;
  const displayTitle =
    identity && hasMeaningfulIdentityText(identity.title) ? identity.title.trim() : undefined;
  const headlineValue = identity?.headline;
  const displayHeadline = typeof headlineValue === "string" && hasMeaningfulIdentityText(headlineValue)
    ? headlineValue.trim()
    : displayTitle;
  const focus = displayTitle && displayTitle !== displayHeadline ? displayTitle : undefined;
  const consumedBlockIds = new Set(
    [
      identity ? identityItem?.id : undefined,
      mappedSocialBlock ? socialItem?.id : undefined,
      mappedExperience?.length ? experienceItem?.id : undefined,
      mappedContact ? linkItem?.id : undefined,
      mappedLocationBlock ? mapItem?.id : undefined,
      mappedProjects.length && work ? workItem?.id : undefined,
      mappedProjects.length && projects ? projectsItem?.id : undefined,
      mappedSkills.length && techstack ? techstackItem?.id : undefined,
      mappedSkills.length && tools ? toolsItem?.id : undefined,
      mappedAvailability ? availabilityItem?.id : undefined,
      mappedTestimonial ? quoteItem?.id : undefined,
    ].filter(Boolean)
  );
  const additionalBlocks = layout.reduce<V2AdditionalBlock[]>((blocks, item) => {
    const block = content[item.id];
    if (!block || block.type !== item.type || consumedBlockIds.has(item.id)) return blocks;
    const isRenderable = hasRenderableBlockContent(item.type, block);

    if (mode === "public" && !isRenderable) return blocks;

    const definition = getBlockDefinition(item.type);
    blocks.push({
      id: item.id,
      type: item.type,
      title: definition.v2Name,
      category: definition.productCategory,
      content: block,
      isDraft: !isRenderable,
      draftMessage: draftMessageForBlock(item.type),
    });

    return blocks;
  }, []);

  return {
    theme,
    isPro,
    username,
    brandName: displayName,
    hasIdentity: Boolean(identity),
    eyebrow: identity?.eyebrow || identity?.availability,
    greeting: displayName ? `Hi, I am ${displayName}.` : undefined,
    role: displayTitle,
    headline: displayHeadline,
    bio: identity?.bio,
    location: identity?.location,
    focus,
    portrait: portraitSrc
      ? {
          src: portraitSrc,
          alt: `Portrait of ${displayName}`,
          label: identity?.location,
          focalPoint: identity?.portraitFocalPoint,
        }
      : undefined,
    socials: mapIdentityShortcuts(identity),
    socialBlock: mappedSocialBlock,
    experience: mappedExperience,
    experienceEyebrow: experience?.eyebrow || "CAREER",
    experienceHeading: experience?.heading || "Experience",
    contact: mappedContact,
    projects: mappedProjects,
    skills: mappedSkills,
    skillsEyebrow: techstack?.eyebrow || tools?.eyebrow || "SKILLS",
    skillsHeading: techstack?.heading || tools?.heading || tools?.title || "Tools I use",
    locationBlock: mappedLocationBlock,
    availability: mappedAvailability,
    testimonial: mappedTestimonial,
    additionalBlocks,
    sourceBlocks: {
      identity: identityItem?.id,
      portrait: identityItem?.id,
      about: identityItem?.id,
      experience: experienceItem?.id,
      contact: linkItem?.id,
      projects: workItem?.id || projectsItem?.id,
      skills: techstackItem?.id || toolsItem?.id,
      social: socialItem?.id,
      location: mapItem?.id,
      availability: availabilityItem?.id,
      testimonial: quoteItem?.id,
    },
  };
}
