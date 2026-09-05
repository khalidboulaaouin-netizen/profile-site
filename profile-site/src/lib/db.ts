import { randomUUID } from "crypto";
import type {
  Store,
  Profile,
  Post,
  Highlight,
  SiteSettings,
  Follower,
  BlockedUser,
  Story,
  StoryViewer,
  Conversation,
  ChatMessage,
  OwnerNotification,
  Analytics,
  AnalyticsDay,
  GuestbookEntry,
  DailyQuestion,
  QuestionAnswer,
} from "./types";
import { normalizeDecoration, normalizeHex } from "./theme";
import {
  readPersistedStoreJson,
  readPersistedStoreSnapshot,
  writePersistedStoreJson,
  readPersistedAnalyticsSnapshot,
  writePersistedAnalyticsJson,
  blobEnabled,
  isBlobConflictError,
} from "./storage";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

const defaultStore = (): Store => ({
  profile: {
    displayName: "حضوري",
    username: "hodouri",
    bio: "مساحة شخصية أنشر فيها لحظاتي وأعمالي. المتابعة عبر Google فقط — بدون إنشاء حساب.",
    avatarUrl: "",
    coverUrl: "",
    website: "",
    location: "العالم العربي",
    emailPublic: "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
  },
  posts: [],
  highlights: [
    { id: randomUUID(), title: "لحظات", coverUrl: "", items: [] },
    { id: randomUUID(), title: "سفر", coverUrl: "", items: [] },
    { id: randomUUID(), title: "أعمال", coverUrl: "", items: [] },
  ],
  stories: [],
  followers: [],
  blockedUsers: [],
  conversations: [],
  notifications: [],
  settings: {
    siteTitle: "حضوري — صفحتي الشخصية",
    siteDescription:
      "صفحة شخصية احترافية بأسلوب إنستغرام. تابعني عبر حساب Google دون إنشاء حساب جديد.",
    seoKeywords: ["صفحة شخصية", "إنستغرام", "متابعة", "Google", "حضوري"],
    allowFollow: true,
    brandName: "حضوري",
    contactEmail: "",
    language: "ar",
    verified: true,
    hideFollowers: false,
    hideFollowing: false,
    enableLikes: true,
    enableComments: true,
    accentColor: "#0095f6",
    backgroundColor: "#fafafa",
    decoration: "none",
    showReadReceipts: false,
    publicSiteUrl: "",
    colorMode: "system",
    gaMeasurementId: "",
    adsenseClientId: "",
    adsenseSlotId: "",
    enableGuestbook: true,
    enableDailyQuestion: true,
  },
  guestbook: [],
  dailyQuestion: {
    text: "شنو أجمل لحظة عشتها هاد الأسبوع؟",
    updatedAt: new Date().toISOString(),
    active: true,
    answers: [],
  },
  analytics: {
    totalViews: 0,
    days: [],
  },
});

function normalizeMediaType(value: unknown): Post["mediaType"] {
  if (value === "video") return "video";
  if (value === "text") return "text";
  return "image";
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    imageUrl: post.imageUrl || "",
    mediaType: normalizeMediaType(post.mediaType),
    caption: post.caption || "",
    hidden: Boolean(post.hidden),
    likes: post.likes ?? 0,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
  };
}

function inferMediaType(
  url: string,
  explicit?: string | null,
): "image" | "video" {
  if (explicit === "video" || explicit === "image") return explicit;
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "")) return "video";
  return "image";
}

function normalizeStory(story: Story): Story {
  const likedBy = Array.isArray(story.likedBy)
    ? story.likedBy.map(String).filter(Boolean)
    : [];
  const comments = Array.isArray(story.comments)
    ? story.comments
        .map((c) => ({
          id: String(c.id || randomUUID()),
          authorName: String(c.authorName || "").trim().slice(0, 60),
          text: String(c.text || "").trim().slice(0, 500),
          createdAt: String(c.createdAt || new Date().toISOString()),
        }))
        .filter((c) => c.authorName && c.text)
    : [];
  return {
    ...story,
    caption: story.caption || "",
    viewers: Array.isArray(story.viewers) ? story.viewers : [],
    mediaType: inferMediaType(story.imageUrl, (story as Story).mediaType),
    likedBy,
    likes: likedBy.length,
    comments,
  };
}

function normalizeHighlight(highlight: Highlight): Highlight {
  return {
    ...highlight,
    title: highlight.title || "",
    coverUrl: highlight.coverUrl || "",
    items: Array.isArray(highlight.items)
      ? highlight.items.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          caption: item.caption || "",
          createdAt: item.createdAt || new Date().toISOString(),
          mediaType: inferMediaType(item.imageUrl, item.mediaType),
        }))
      : [],
  };
}

function normalizeProfile(profile: Profile): Profile {
  const defaults = defaultStore().profile;
  return {
    ...defaults,
    ...profile,
    instagramUrl: profile.instagramUrl || "",
    facebookUrl: profile.facebookUrl || "",
    tiktokUrl: profile.tiktokUrl || "",
  };
}

function isStoryActive(story: Story, now = Date.now()) {
  return new Date(story.expiresAt).getTime() > now;
}

function normalizeStore(store: Store): Store {
  const now = Date.now();
  return {
    ...store,
    profile: normalizeProfile(store.profile || defaultStore().profile),
    posts: (store.posts || []).map(normalizePost),
    highlights: (store.highlights || []).map(normalizeHighlight),
    stories: (store.stories || [])
      .map(normalizeStory)
      .filter((story) => isStoryActive(story, now)),
    followers: Array.isArray(store.followers) ? store.followers : [],
    blockedUsers: Array.isArray(store.blockedUsers) ? store.blockedUsers : [],
    conversations: Array.isArray(store.conversations)
      ? store.conversations.map((c) => ({
          ...c,
          messages: Array.isArray(c.messages) ? c.messages : [],
        }))
      : [],
    settings: {
      ...defaultStore().settings,
      ...store.settings,
      language: store.settings?.language || "ar",
      verified: store.settings?.verified ?? true,
      hideFollowers: store.settings?.hideFollowers ?? false,
      hideFollowing: store.settings?.hideFollowing ?? false,
      enableLikes: store.settings?.enableLikes ?? true,
      enableComments: store.settings?.enableComments ?? true,
      accentColor: normalizeHex(store.settings?.accentColor, "#0095f6"),
      backgroundColor: normalizeHex(store.settings?.backgroundColor, "#fafafa"),
      decoration: normalizeDecoration(store.settings?.decoration),
      showReadReceipts: store.settings?.showReadReceipts ?? false,
      publicSiteUrl: String(store.settings?.publicSiteUrl || ""),
      colorMode:
        store.settings?.colorMode === "light" || store.settings?.colorMode === "dark"
          ? store.settings.colorMode
          : "system",
      gaMeasurementId: String(store.settings?.gaMeasurementId || "")
        .trim()
        .replace(/^.*?(G-[A-Z0-9]+).*$/i, "$1")
        .replace(/[^G\-A-Z0-9]/gi, "")
        .slice(0, 16),
      adsenseClientId: (() => {
        const raw = String(store.settings?.adsenseClientId || "").trim().toLowerCase();
        const m = raw.match(/ca-pub-\d{10,20}/);
        return m ? m[0] : "";
      })(),
      adsenseSlotId: String(store.settings?.adsenseSlotId || "").replace(/\D/g, "").slice(0, 16),
      enableGuestbook: store.settings?.enableGuestbook !== false,
      enableDailyQuestion: store.settings?.enableDailyQuestion !== false,
    },
    notifications: Array.isArray(store.notifications)
      ? store.notifications
          .map((n) => ({
            id: String(n.id || randomUUID()),
            type: (n.type === "follow" || n.type === "guestbook" || n.type === "answer" || n.type === "message" ? n.type : "message") as OwnerNotification["type"],
            title: String(n.title || ""),
            body: String(n.body || ""),
            href: n.href ? String(n.href) : undefined,
            createdAt: String(n.createdAt || new Date().toISOString()),
            read: Boolean(n.read),
          }))
          .slice(0, 100)
      : [],
    analytics: normalizeAnalytics(store.analytics),
    guestbook: normalizeGuestbook(store.guestbook),
    dailyQuestion: normalizeDailyQuestion(store.dailyQuestion),
  };
}

function normalizeAnalytics(input: Store["analytics"] | undefined): Analytics {
  const days = Array.isArray(input?.days)
    ? input!.days
        .map((day) => normalizeAnalyticsDay(day))
        .filter(Boolean) as AnalyticsDay[]
    : [];
  days.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return {
    totalViews: Math.max(0, Number(input?.totalViews) || 0),
    days: days.slice(0, 90),
  };
}

function normalizeAnalyticsDay(day: Partial<AnalyticsDay> | undefined): AnalyticsDay | null {
  const date = String(day?.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const countries: Record<string, number> = {};
  if (day?.countries && typeof day.countries === "object") {
    for (const [code, count] of Object.entries(day.countries)) {
      const key = String(code || "ZZ").toUpperCase().slice(0, 3);
      const n = Math.max(0, Number(count) || 0);
      if (n > 0) countries[key] = n;
    }
  }
  return {
    date,
    views: Math.max(0, Number(day?.views) || 0),
    uniqueVisitors: Math.max(0, Number(day?.uniqueVisitors) || 0),
    countries,
    visitorHashes: Array.isArray(day?.visitorHashes)
      ? day!.visitorHashes.map(String).slice(0, 2000)
      : [],
  };
}

async function ensureStore(): Promise<Store> {
  const raw = await readPersistedStoreJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Store;
      return normalizeStore(parsed);
    } catch {
      // Corrupt JSON — serve defaults without clobbering Blob.
      return defaultStore();
    }
  }

  // Missing store: serve defaults in-memory.
  // Only seed local disk in development. Never auto-write to Blob on boot —
  // a transient Blob read failure must not wipe production data.
  const store = defaultStore();
  if (!blobEnabled()) {
    try {
      await writePersistedStoreJson(JSON.stringify(store, null, 2));
    } catch {
      /* ignore */
    }
  }
  return store;
}

export async function readStore(): Promise<Store> {
  return ensureStore();
}

export async function writeStore(store: Store): Promise<void> {
  await writePersistedStoreJson(JSON.stringify(store, null, 2));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StoreUnavailableError extends Error {
  constructor(message = "التخزين غير متاح مؤقتاً، أعد المحاولة") {
    super(message);
    this.name = "StoreUnavailableError";
  }
}

/**
 * Safe read-modify-write with Blob ETag CAS retries.
 * Use this for every store mutation to avoid lost updates.
 */
export async function mutateStore(
  mutator: (store: Store) => void | Promise<void>,
): Promise<Store> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    const snap = await readPersistedStoreSnapshot();
    if (snap.unavailable) {
      throw new StoreUnavailableError();
    }

    let store: Store;
    if (snap.json) {
      try {
        store = normalizeStore(JSON.parse(snap.json) as Store);
      } catch {
        throw new StoreUnavailableError("بيانات التخزين تالفة مؤقتاً");
      }
    } else {
      store = defaultStore();
    }

    const draft = structuredClone(store) as Store;
    await mutator(draft);
    const normalized = normalizeStore(draft);
    const payload = JSON.stringify(normalized, null, 2);

    try {
      // First create has no etag; later writes use ifMatch.
      await writePersistedStoreJson(payload, snap.etag);
      return normalized;
    } catch (error) {
      lastError = error;
      if (isBlobConflictError(error) && attempt < 5) {
        await sleep(40 + attempt * 70);
        continue;
      }
      // Race without etag on first write: retry
      if (blobEnabled() && attempt < 5) {
        await sleep(40 + attempt * 70);
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("تعذر الحفظ بسبب تعارض، أعد المحاولة");
}


export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<Profile>;
  const store = await mutateStore((draft) => {
    draft.profile = normalizeProfile({ ...draft.profile, ...clean });
  });
  return store.profile;
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<SiteSettings>;

  if (clean.accentColor !== undefined) {
    clean.accentColor = normalizeHex(clean.accentColor, "#0095f6");
  }
  if (clean.backgroundColor !== undefined) {
    clean.backgroundColor = normalizeHex(clean.backgroundColor, "#fafafa");
  }
  if (clean.decoration !== undefined) {
    clean.decoration = normalizeDecoration(clean.decoration);
  }
  if (clean.publicSiteUrl !== undefined) {
    clean.publicSiteUrl = String(clean.publicSiteUrl || "").trim().replace(/\/$/, "");
  }
  if (clean.colorMode !== undefined) {
    clean.colorMode =
      clean.colorMode === "light" || clean.colorMode === "dark" ? clean.colorMode : "system";
  }
  if (clean.gaMeasurementId !== undefined) {
    const raw = String(clean.gaMeasurementId || "").trim().toUpperCase();
    const match = raw.match(/G-[A-Z0-9]+/);
    clean.gaMeasurementId = match ? match[0].slice(0, 16) : "";
  }
  if (clean.adsenseClientId !== undefined) {
    const raw = String(clean.adsenseClientId || "").trim().toLowerCase();
    const match = raw.match(/ca-pub-\d{10,20}/);
    clean.adsenseClientId = match ? match[0] : "";
  }
  if (clean.adsenseSlotId !== undefined) {
    clean.adsenseSlotId = String(clean.adsenseSlotId || "").replace(/\D/g, "").slice(0, 16);
  }

  const store = await mutateStore((draft) => {
    draft.settings = {
      ...defaultStore().settings,
      ...draft.settings,
      ...clean,
    };
  });
  return store.settings;
}

export async function addPost(input: {
  imageUrl: string;
  caption: string;
  mediaType?: "image" | "video" | "text";
}): Promise<Post> {
  const mediaType = normalizeMediaType(input.mediaType);
  const caption =
    mediaType === "text"
      ? input.caption.trim().slice(0, 20000)
      : input.caption.trim().slice(0, 2200);
  const post: Post = {
    id: randomUUID(),
    imageUrl: mediaType === "text" ? input.imageUrl.trim() : input.imageUrl,
    mediaType,
    hidden: false,
    caption,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    comments: [],
  };
  await mutateStore((draft) => {
    draft.posts = [post, ...draft.posts];
  });
  return post;
}

export async function toggleLike(
  postId: string,
  visitorId: string,
): Promise<{ post: Post; liked: boolean } | null> {
  let result: { post: Post; liked: boolean } | null = null;
  await mutateStore((draft) => {
    if (!draft.settings.enableLikes) return;
    const idx = draft.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return;

    const post = normalizePost(draft.posts[idx]);
    if (post.hidden) return;
    const liked = post.likedBy.includes(visitorId);
    if (liked) {
      post.likedBy = post.likedBy.filter((id) => id !== visitorId);
    } else {
      post.likedBy = [...post.likedBy, visitorId];
    }
    post.likes = post.likedBy.length;
    draft.posts[idx] = post;
    result = { post, liked: !liked };
  });
  return result;
}

export async function addComment(
  postId: string,
  input: { authorName: string; text: string },
): Promise<Post | null> {
  const authorName = input.authorName.trim().slice(0, 60);
  const text = input.text.trim().slice(0, 500);
  if (!authorName || !text) return null;

  let result: Post | null = null;
  await mutateStore((draft) => {
    if (!draft.settings.enableComments) return;
    const idx = draft.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return;

    const post = normalizePost(draft.posts[idx]);
    if (post.hidden) return;

    post.comments = [
      ...post.comments,
      {
        id: randomUUID(),
        authorName,
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    draft.posts[idx] = post;
    result = post;
  });
  return result;
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<Post | null> {
  let result: Post | null = null;
  await mutateStore((draft) => {
    const idx = draft.posts.findIndex((p) => p.id === postId);
    if (idx === -1) return;
    const post = normalizePost(draft.posts[idx]);
    post.comments = post.comments.filter((c) => c.id !== commentId);
    draft.posts[idx] = post;
    result = post;
  });
  return result;
}

export async function updatePost(
  id: string,
  patch: Partial<Pick<Post, "caption" | "imageUrl" | "hidden" | "mediaType">>,
): Promise<Post | null> {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<Post>;
  let result: Post | null = null;
  await mutateStore((draft) => {
    const idx = draft.posts.findIndex((p) => p.id === id);
    if (idx === -1) return;
    draft.posts[idx] = normalizePost({ ...draft.posts[idx], ...clean });
    result = draft.posts[idx];
  });
  return result;
}

export async function deletePost(id: string): Promise<boolean> {
  let removed = false;
  await mutateStore((draft) => {
    const before = draft.posts.length;
    draft.posts = draft.posts.filter((p) => p.id !== id);
    removed = draft.posts.length < before;
  });
  return removed;
}

export async function setHighlights(highlights: Highlight[]): Promise<Highlight[]> {
  const store = await mutateStore((draft) => {
    draft.highlights = highlights.map(normalizeHighlight);
  });
  return store.highlights;
}

export async function listHighlights(): Promise<Highlight[]> {
  const store = await readStore();
  return store.highlights;
}

/** Copy an active (or still-known) story into a lasting highlight under the bio. */
export async function saveStoryToHighlight(input: {
  storyId: string;
  highlightId?: string;
  newTitle?: string;
}): Promise<Highlight | null> {
  let result: Highlight | null = null;
  await mutateStore((draft) => {
    const story = draft.stories.find((s) => s.id === input.storyId);
    if (!story) return;
    const normalizedStory = normalizeStory(story);

    const item = {
      id: randomUUID(),
      imageUrl: normalizedStory.imageUrl,
      caption: normalizedStory.caption || "",
      createdAt: normalizedStory.createdAt,
      mediaType: normalizedStory.mediaType,
    };

    if (input.highlightId) {
      const idx = draft.highlights.findIndex((h) => h.id === input.highlightId);
      if (idx === -1) return;
      const highlight = normalizeHighlight(draft.highlights[idx]);
      const already = highlight.items.some((i) => i.imageUrl === item.imageUrl);
      if (!already) {
        highlight.items = [...highlight.items, item];
      }
      if (!highlight.coverUrl) highlight.coverUrl = item.imageUrl;
      draft.highlights[idx] = highlight;
      result = highlight;
    } else {
      const title = (input.newTitle || "لحظات").trim().slice(0, 40) || "لحظات";
      const highlight: Highlight = {
        id: randomUUID(),
        title,
        coverUrl: item.imageUrl,
        items: [item],
      };
      draft.highlights = [...draft.highlights, highlight];
      result = highlight;
    }
  });
  return result;
}

export async function removeHighlightItem(input: {
  highlightId: string;
  itemId: string;
}): Promise<Highlight | null> {
  let result: Highlight | null = null;
  await mutateStore((draft) => {
    const idx = draft.highlights.findIndex((h) => h.id === input.highlightId);
    if (idx === -1) return;
    const highlight = normalizeHighlight(draft.highlights[idx]);
    highlight.items = highlight.items.filter((i) => i.id !== input.itemId);
    if (highlight.coverUrl && !highlight.items.some((i) => i.imageUrl === highlight.coverUrl)) {
      highlight.coverUrl = highlight.items[0]?.imageUrl || highlight.coverUrl;
    }
    draft.highlights[idx] = highlight;
    result = highlight;
  });
  return result;
}

export async function deleteHighlight(highlightId: string): Promise<boolean> {
  let removed = false;
  await mutateStore((draft) => {
    const before = draft.highlights.length;
    draft.highlights = draft.highlights.filter((h) => h.id !== highlightId);
    removed = draft.highlights.length < before;
  });
  return removed;
}

export async function followWithGoogle(input: {
  googleId: string;
  name: string;
  email: string;
  image: string;
}): Promise<{ follower: Follower; alreadyFollowing: boolean } | null> {
  const store = await readStore();
  if ((store.blockedUsers || []).some((u) => u.googleId === input.googleId)) {
    return null;
  }
  const existing = store.followers.find((f) => f.googleId === input.googleId);
  if (existing) {
    return { follower: existing, alreadyFollowing: true };
  }
  const follower: Follower = {
    id: randomUUID(),
    googleId: input.googleId,
    name: input.name,
    email: input.email,
    image: input.image,
    followedAt: new Date().toISOString(),
  };
  store.followers = [follower, ...store.followers];
  store.notifications = [
    {
      id: randomUUID(),
      type: "follow" as const,
      title: "متابع جديد",
      body: `${follower.name} بدأ متابعتك`,
      href: "/admin/followers",
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...(store.notifications || []),
  ].slice(0, 100);
  await writeStore(store);
  return { follower, alreadyFollowing: false };
}

export async function unfollowByGoogleId(googleId: string): Promise<boolean> {
  const store = await readStore();
  const before = store.followers.length;
  store.followers = store.followers.filter((f) => f.googleId !== googleId);
  await writeStore(store);
  return store.followers.length < before;
}

export async function isFollowing(googleId: string): Promise<boolean> {
  const store = await readStore();
  return store.followers.some((f) => f.googleId === googleId);
}

export async function listActiveStories(): Promise<Story[]> {
  const store = await readStore();
  return store.stories;
}

export async function addStory(input: {
  imageUrl: string;
  caption?: string;
  mediaType?: "image" | "video";
}): Promise<Story> {
  const now = Date.now();
  const story: Story = {
    id: randomUUID(),
    imageUrl: input.imageUrl,
    caption: (input.caption || "").trim().slice(0, 200),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + STORY_TTL_MS).toISOString(),
    viewers: [],
    mediaType: inferMediaType(input.imageUrl, input.mediaType),
    likes: 0,
    likedBy: [],
    comments: [],
  };
  await mutateStore((draft) => {
    draft.stories = [story, ...(draft.stories || [])];
  });
  return story;
}

export async function deleteStory(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.stories.length;
  store.stories = store.stories.filter((s) => s.id !== id);
  await writeStore(store);
  return store.stories.length < before;
}

export async function toggleStoryLike(
  storyId: string,
  visitorId: string,
): Promise<{ story: Story; liked: boolean } | null> {
  const id = String(visitorId || "").slice(0, 80);
  if (!storyId || !id) return null;
  let result: { story: Story; liked: boolean } | null = null;
  await mutateStore((draft) => {
    if (!draft.settings.enableLikes) return;
    const i = draft.stories.findIndex((s) => s.id === storyId);
    if (i === -1) return;
    const story = normalizeStory(draft.stories[i]);
    if (!isStoryActive(story)) return;
    const liked = story.likedBy.includes(id);
    story.likedBy = liked
      ? story.likedBy.filter((v) => v !== id)
      : [...story.likedBy, id];
    story.likes = story.likedBy.length;
    draft.stories[i] = story;
    result = { story, liked: !liked };
  });
  return result;
}

export async function addStoryComment(
  storyId: string,
  input: { authorName: string; text: string },
): Promise<Story | null> {
  const authorName = input.authorName.trim().slice(0, 60);
  const text = input.text.trim().slice(0, 500);
  if (!storyId || !authorName || !text) return null;
  let result: Story | null = null;
  await mutateStore((draft) => {
    if (!draft.settings.enableComments) return;
    const i = draft.stories.findIndex((s) => s.id === storyId);
    if (i === -1) return;
    const story = normalizeStory(draft.stories[i]);
    if (!isStoryActive(story)) return;
    story.comments = [
      ...story.comments,
      {
        id: randomUUID(),
        authorName,
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    draft.stories[i] = story;
    result = story;
  });
  return result;
}

export async function deleteStoryComment(
  storyId: string,
  commentId: string,
): Promise<Story | null> {
  let result: Story | null = null;
  await mutateStore((draft) => {
    const i = draft.stories.findIndex((s) => s.id === storyId);
    if (i === -1) return;
    const story = normalizeStory(draft.stories[i]);
    story.comments = story.comments.filter((c) => c.id !== commentId);
    draft.stories[i] = story;
    result = story;
  });
  return result;
}


export async function recordStoryView(input: {
  storyId: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
}): Promise<{ story: Story; alreadyViewed: boolean } | null> {
  const store = await readStore();
  const idx = store.stories.findIndex((s) => s.id === input.storyId);
  if (idx === -1) return null;

  const story = normalizeStory(store.stories[idx]);
  if (!isStoryActive(story)) return null;

  const existing = story.viewers.find((v) => v.googleId === input.googleId);
  if (existing) {
    return { story, alreadyViewed: true };
  }

  const viewer: StoryViewer = {
    googleId: input.googleId,
    name: input.name || "Viewer",
    email: input.email || "",
    image: input.image || "",
    viewedAt: new Date().toISOString(),
  };
  story.viewers = [viewer, ...story.viewers];
  store.stories[idx] = story;
  await writeStore(store);
  return { story, alreadyViewed: false };
}

export async function getStoryViewers(storyId: string): Promise<StoryViewer[] | null> {
  const store = await readStore();
  const story = store.stories.find((s) => s.id === storyId);
  if (!story) return null;
  return normalizeStory(story).viewers;
}

export async function isBlocked(googleId: string): Promise<boolean> {
  if (!googleId) return false;
  const store = await readStore();
  return (store.blockedUsers || []).some((u) => u.googleId === googleId);
}

export async function listBlockedUsers(): Promise<BlockedUser[]> {
  const store = await readStore();
  return store.blockedUsers || [];
}

export async function blockUser(input: {
  googleId: string;
  name?: string;
  email?: string;
  image?: string;
}): Promise<BlockedUser | null> {
  const googleId = String(input.googleId || "").trim();
  if (!googleId) return null;

  const store = await readStore();
  const existing = (store.blockedUsers || []).find((u) => u.googleId === googleId);
  if (existing) {
    // Ensure they are also removed from followers
    store.followers = store.followers.filter((f) => f.googleId !== googleId);
    await writeStore(store);
    return existing;
  }

  const follower = store.followers.find((f) => f.googleId === googleId);
  const blocked: BlockedUser = {
    googleId,
    name: (input.name || follower?.name || "مستخدم").trim().slice(0, 80),
    email: (input.email || follower?.email || "").trim().slice(0, 120),
    image: input.image || follower?.image || "",
    blockedAt: new Date().toISOString(),
  };

  store.blockedUsers = [blocked, ...(store.blockedUsers || [])];
  store.followers = store.followers.filter((f) => f.googleId !== googleId);
  await writeStore(store);
  return blocked;
}

export async function unblockUser(googleId: string): Promise<boolean> {
  const store = await readStore();
  const before = (store.blockedUsers || []).length;
  store.blockedUsers = (store.blockedUsers || []).filter((u) => u.googleId !== googleId);
  await writeStore(store);
  return store.blockedUsers.length < before;
}

export async function listConversations(): Promise<Conversation[]> {
  const store = await readStore();
  return [...(store.conversations || [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getConversationByGoogleId(
  googleId: string,
): Promise<Conversation | null> {
  const store = await readStore();
  return (store.conversations || []).find((c) => c.googleId === googleId) || null;
}

function normalizeMessageContent(input: { text?: string; audioUrl?: string }) {
  const text = String(input.text || "").trim().slice(0, 1000);
  const audioUrl = String(input.audioUrl || "").trim();
  const safeAudio =
    audioUrl.startsWith("/uploads/") && !audioUrl.includes("..") ? audioUrl : "";
  if (!text && !safeAudio) return null;
  return { text, audioUrl: safeAudio || undefined };
}

export async function sendFollowerMessage(input: {
  googleId: string;
  name: string;
  email: string;
  image: string;
  text?: string;
  audioUrl?: string;
}): Promise<Conversation | null> {
  const content = normalizeMessageContent(input);
  if (!input.googleId || !content) return null;
  if (await isBlocked(input.googleId)) return null;

  const store = await readStore();
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: randomUUID(),
    from: "follower",
    text: content.text,
    audioUrl: content.audioUrl,
    createdAt: now,
    readByOwner: false,
    readByFollower: true,
  };

  const idx = (store.conversations || []).findIndex((c) => c.googleId === input.googleId);
  if (idx === -1) {
    const conversation: Conversation = {
      id: randomUUID(),
      googleId: input.googleId,
      name: input.name || "متابع",
      email: input.email || "",
      image: input.image || "",
      updatedAt: now,
      messages: [message],
    };
    store.conversations = [conversation, ...(store.conversations || [])];
    store.notifications = [
      {
        id: randomUUID(),
        type: "message" as const,
        title: "رسالة جديدة",
        body: `${input.name || "متابع"} أرسل رسالة`,
        href: "/admin/messages",
        createdAt: now,
        read: false,
      },
      ...(store.notifications || []),
    ].slice(0, 100);
    await writeStore(store);
    return conversation;
  }

  const conversation = store.conversations[idx];
  conversation.name = input.name || conversation.name;
  conversation.email = input.email || conversation.email;
  conversation.image = input.image || conversation.image;
  conversation.updatedAt = now;
  conversation.messages = [...conversation.messages, message];
  store.conversations[idx] = conversation;
  store.notifications = [
    {
      id: randomUUID(),
      type: "message" as const,
      title: "رسالة جديدة",
      body: `${input.name || conversation.name || "متابع"} أرسل رسالة`,
      href: "/admin/messages",
      createdAt: now,
      read: false,
    },
    ...(store.notifications || []),
  ].slice(0, 100);
  await writeStore(store);
  return conversation;
}

export async function sendOwnerReply(input: {
  googleId: string;
  text?: string;
  audioUrl?: string;
}): Promise<Conversation | null> {
  const content = normalizeMessageContent(input);
  if (!input.googleId || !content) return null;

  const store = await readStore();
  const idx = (store.conversations || []).findIndex((c) => c.googleId === input.googleId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: randomUUID(),
    from: "owner",
    text: content.text,
    audioUrl: content.audioUrl,
    createdAt: now,
    readByOwner: true,
    readByFollower: false,
  };

  const conversation = store.conversations[idx];
  conversation.updatedAt = now;
  conversation.messages = [...conversation.messages, message];
  store.conversations[idx] = conversation;
  await writeStore(store);
  return conversation;
}

export async function markConversationRead(input: {
  googleId: string;
  role: "owner" | "follower";
}): Promise<Conversation | null> {
  const store = await readStore();
  const idx = (store.conversations || []).findIndex((c) => c.googleId === input.googleId);
  if (idx === -1) return null;

  const conversation = store.conversations[idx];
  conversation.messages = conversation.messages.map((m) => {
    if (input.role === "owner") return { ...m, readByOwner: true };
    return { ...m, readByFollower: true };
  });
  store.conversations[idx] = conversation;
  await writeStore(store);
  return conversation;
}

export async function countUnreadForOwner(): Promise<number> {
  const store = await readStore();
  return (store.conversations || []).reduce(
    (sum, c) => sum + c.messages.filter((m) => m.from === "follower" && !m.readByOwner).length,
    0,
  );
}

export async function createOwnerNotification(
  input: Omit<OwnerNotification, "id" | "createdAt" | "read">,
): Promise<OwnerNotification> {
  const store = await readStore();
  const note: OwnerNotification = {
    id: randomUUID(),
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    createdAt: new Date().toISOString(),
    read: false,
  };
  store.notifications = [note, ...(store.notifications || [])].slice(0, 100);
  await writeStore(store);
  return note;
}

export async function listOwnerNotifications(): Promise<OwnerNotification[]> {
  const store = await readStore();
  return store.notifications || [];
}

export async function markOwnerNotificationsRead(ids?: string[]): Promise<OwnerNotification[]> {
  const store = await readStore();
  store.notifications = (store.notifications || []).map((n) => {
    if (!ids || ids.length === 0 || ids.includes(n.id)) return { ...n, read: true };
    return n;
  });
  await writeStore(store);
  return store.notifications;
}

function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

async function mutateAnalytics(
  mutator: (analytics: Analytics) => void,
): Promise<Analytics> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    const snap = await readPersistedAnalyticsSnapshot();
    if (snap.unavailable) {
      throw new StoreUnavailableError();
    }

    let analytics: Analytics;
    if (snap.json) {
      try {
        analytics = normalizeAnalytics(JSON.parse(snap.json) as Analytics);
      } catch {
        analytics = normalizeAnalytics(undefined);
      }
    } else {
      // One-time seed from legacy analytics embedded in the main store.
      try {
        const store = await readStore();
        analytics = normalizeAnalytics(store.analytics);
      } catch {
        analytics = normalizeAnalytics(undefined);
      }
    }

    const draft = structuredClone(analytics) as Analytics;
    mutator(draft);
    const normalized = normalizeAnalytics(draft);
    const payload = JSON.stringify(normalized);

    try {
      await writePersistedAnalyticsJson(payload, snap.etag);
      return normalized;
    } catch (error) {
      lastError = error;
      if (isBlobConflictError(error) && attempt < 5) {
        await sleep(40 + attempt * 70);
        continue;
      }
      if (blobEnabled() && attempt < 5) {
        await sleep(40 + attempt * 70);
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("تعذر تحديث الإحصائيات، أعد المحاولة");
}

export async function recordPageVisit(input: {
  visitorHash: string;
  countryCode?: string;
}): Promise<{ ok: true }> {
  const hash = String(input.visitorHash || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
  if (!hash) return { ok: true };

  const country =
    String(input.countryCode || "ZZ")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 3) || "ZZ";

  try {
    await mutateAnalytics((analytics) => {
      const today = utcDateKey();
      let day = analytics.days.find((d) => d.date === today);
      if (!day) {
        day = {
          date: today,
          views: 0,
          uniqueVisitors: 0,
          countries: {},
          visitorHashes: [],
        };
        analytics.days = [day, ...analytics.days].slice(0, 90);
      }

      day.views += 1;
      analytics.totalViews += 1;
      day.countries[country] = (day.countries[country] || 0) + 1;

      if (!day.visitorHashes.includes(hash)) {
        if (day.visitorHashes.length < 2000) {
          day.visitorHashes.push(hash);
        }
        day.uniqueVisitors = day.visitorHashes.length;
      }
    });
  } catch {
    // Never block the public page if analytics write fails.
  }
  return { ok: true };
}

export type AnalyticsSummary = {
  totalViews: number;
  todayViews: number;
  todayUnique: number;
  last7Views: number;
  last7Unique: number;
  last30Views: number;
  followers: number;
  days: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    countries: Record<string, number>;
  }>;
  countries: Array<{ code: string; views: number }>;
};

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const store = await readStore();
  let analytics = normalizeAnalytics(store.analytics);
  try {
    const snap = await readPersistedAnalyticsSnapshot();
    if (!snap.unavailable && snap.json) {
      analytics = normalizeAnalytics(JSON.parse(snap.json) as Analytics);
    }
  } catch {
    /* keep legacy analytics from main store */
  }

  const limit = Math.max(1, Math.min(90, days));
  const slice = analytics.days.slice(0, limit);
  const today = utcDateKey();
  const todayRow = analytics.days.find((d) => d.date === today);
  const last7 = analytics.days.slice(0, 7);
  const countryMap: Record<string, number> = {};
  for (const day of slice) {
    for (const [code, count] of Object.entries(day.countries || {})) {
      countryMap[code] = (countryMap[code] || 0) + count;
    }
  }
  const countries = Object.entries(countryMap)
    .map(([code, views]) => ({ code, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 40);

  return {
    totalViews: analytics.totalViews,
    todayViews: todayRow?.views || 0,
    todayUnique: todayRow?.uniqueVisitors || 0,
    last7Views: last7.reduce((s, d) => s + d.views, 0),
    last7Unique: last7.reduce((s, d) => s + d.uniqueVisitors, 0),
    last30Views: slice.reduce((s, d) => s + d.views, 0),
    followers: store.followers.length,
    days: slice.map(({ date, views, uniqueVisitors, countries: c }) => ({
      date,
      views,
      uniqueVisitors,
      countries: c,
    })),
    countries,
  };
}

function normalizeGuestbook(entries: GuestbookEntry[] | undefined): GuestbookEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((e) => ({
      id: String(e.id || randomUUID()),
      googleId: String(e.googleId || ""),
      name: String(e.name || "زائر").slice(0, 80),
      email: String(e.email || "").slice(0, 120),
      image: String(e.image || ""),
      text: String(e.text || "").trim().slice(0, 280),
      createdAt: String(e.createdAt || new Date().toISOString()),
      hidden: Boolean(e.hidden),
    }))
    .filter((e) => e.text && e.googleId)
    .slice(0, 500);
}

function normalizeDailyQuestion(input: DailyQuestion | undefined): DailyQuestion {
  const defaults = defaultStore().dailyQuestion;
  const answers: QuestionAnswer[] = Array.isArray(input?.answers)
    ? input!.answers
        .map((a) => ({
          id: String(a.id || randomUUID()),
          googleId: String(a.googleId || ""),
          name: String(a.name || "زائر").slice(0, 80),
          email: String(a.email || "").slice(0, 120),
          image: String(a.image || ""),
          text: String(a.text || "").trim().slice(0, 280),
          createdAt: String(a.createdAt || new Date().toISOString()),
          hidden: Boolean(a.hidden),
        }))
        .filter((a) => a.text && a.googleId)
        .slice(0, 500)
    : [];
  return {
    text: String(input?.text || defaults.text).trim().slice(0, 200) || defaults.text,
    updatedAt: String(input?.updatedAt || defaults.updatedAt),
    active: input?.active !== false,
    answers,
  };
}

export async function addGuestbookEntry(input: {
  googleId: string;
  name: string;
  email: string;
  image: string;
  text: string;
}): Promise<GuestbookEntry | null> {
  const textValue = String(input.text || "").trim().slice(0, 280);
  if (!textValue || !input.googleId) return null;
  const store = await readStore();
  if (store.settings.enableGuestbook === false) return null;
  // one visible entry per google user — update if exists
  const entry: GuestbookEntry = {
    id: randomUUID(),
    googleId: input.googleId,
    name: (input.name || "زائر").slice(0, 80),
    email: (input.email || "").slice(0, 120),
    image: input.image || "",
    text: textValue,
    createdAt: new Date().toISOString(),
    hidden: false,
  };
  store.guestbook = [
    entry,
    ...store.guestbook.filter((e) => e.googleId !== input.googleId),
  ].slice(0, 500);
  store.notifications = [
    {
      id: randomUUID(),
      type: "guestbook" as const,
      title: "رسالة على جدار الزوار",
      body: `${entry.name}: ${entry.text.slice(0, 80)}`,
      href: "/admin/community",
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...store.notifications,
  ].slice(0, 100);
  await writeStore(store);
  return entry;
}

export async function setGuestbookHidden(id: string, hidden: boolean): Promise<boolean> {
  const store = await readStore();
  const idx = store.guestbook.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  store.guestbook[idx] = { ...store.guestbook[idx], hidden };
  await writeStore(store);
  return true;
}

export async function deleteGuestbookEntry(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.guestbook.length;
  store.guestbook = store.guestbook.filter((e) => e.id !== id);
  if (store.guestbook.length === before) return false;
  await writeStore(store);
  return true;
}

export async function updateDailyQuestion(input: {
  text?: string;
  active?: boolean;
  resetAnswers?: boolean;
}): Promise<DailyQuestion> {
  const store = await readStore();
  const next = normalizeDailyQuestion(store.dailyQuestion);
  if (input.text !== undefined) {
    next.text = String(input.text || "").trim().slice(0, 200) || next.text;
    next.updatedAt = new Date().toISOString();
  }
  if (input.active !== undefined) next.active = Boolean(input.active);
  if (input.resetAnswers) next.answers = [];
  store.dailyQuestion = next;
  await writeStore(store);
  return next;
}

export async function addQuestionAnswer(input: {
  googleId: string;
  name: string;
  email: string;
  image: string;
  text: string;
}): Promise<QuestionAnswer | null> {
  const textValue = String(input.text || "").trim().slice(0, 280);
  if (!textValue || !input.googleId) return null;
  const store = await readStore();
  if (store.settings.enableDailyQuestion === false) return null;
  const q = normalizeDailyQuestion(store.dailyQuestion);
  if (!q.active || !q.text) return null;
  const answer: QuestionAnswer = {
    id: randomUUID(),
    googleId: input.googleId,
    name: (input.name || "زائر").slice(0, 80),
    email: (input.email || "").slice(0, 120),
    image: input.image || "",
    text: textValue,
    createdAt: new Date().toISOString(),
    hidden: false,
  };
  q.answers = [
    answer,
    ...q.answers.filter((a) => a.googleId !== input.googleId),
  ].slice(0, 500);
  store.dailyQuestion = q;
  store.notifications = [
    {
      id: randomUUID(),
      type: "answer" as const,
      title: "رد على سؤال اليوم",
      body: `${answer.name}: ${answer.text.slice(0, 80)}`,
      href: "/admin/community",
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...store.notifications,
  ].slice(0, 100);
  await writeStore(store);
  return answer;
}

export async function setQuestionAnswerHidden(id: string, hidden: boolean): Promise<boolean> {
  const store = await readStore();
  const q = normalizeDailyQuestion(store.dailyQuestion);
  const idx = q.answers.findIndex((a) => a.id === id);
  if (idx < 0) return false;
  q.answers[idx] = { ...q.answers[idx], hidden };
  store.dailyQuestion = q;
  await writeStore(store);
  return true;
}

export async function deleteQuestionAnswer(id: string): Promise<boolean> {
  const store = await readStore();
  const q = normalizeDailyQuestion(store.dailyQuestion);
  const before = q.answers.length;
  q.answers = q.answers.filter((a) => a.id !== id);
  if (q.answers.length === before) return false;
  store.dailyQuestion = q;
  await writeStore(store);
  return true;
}

