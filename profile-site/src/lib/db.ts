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
} from "./types";
import { normalizeDecoration, normalizeHex } from "./theme";
import { readPersistedStoreJson, writePersistedStoreJson, blobEnabled } from "./storage";

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

function normalizeStory(story: Story): Story {
  return {
    ...story,
    caption: story.caption || "",
    viewers: Array.isArray(story.viewers) ? story.viewers : [],
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
    },
    notifications: Array.isArray(store.notifications)
      ? store.notifications
          .map((n) => ({
            id: String(n.id || randomUUID()),
            type: (n.type === "follow" ? "follow" : "message") as "follow" | "message",
            title: String(n.title || ""),
            body: String(n.body || ""),
            href: n.href ? String(n.href) : undefined,
            createdAt: String(n.createdAt || new Date().toISOString()),
            read: Boolean(n.read),
          }))
          .slice(0, 100)
      : [],
    analytics: normalizeAnalytics(store.analytics),
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

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const store = await readStore();
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<Profile>;
  store.profile = normalizeProfile({ ...store.profile, ...clean });
  await writeStore(store);
  return store.profile;
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const store = await readStore();
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<SiteSettings>;

  if (clean.accentColor !== undefined) {
    clean.accentColor = normalizeHex(clean.accentColor, store.settings.accentColor || "#0095f6");
  }
  if (clean.backgroundColor !== undefined) {
    clean.backgroundColor = normalizeHex(
      clean.backgroundColor,
      store.settings.backgroundColor || "#fafafa",
    );
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

  store.settings = {
    ...defaultStore().settings,
    ...store.settings,
    ...clean,
  };
  await writeStore(store);
  return store.settings;
}

export async function addPost(input: {
  imageUrl: string;
  caption: string;
  mediaType?: "image" | "video" | "text";
}): Promise<Post> {
  const store = await readStore();
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
  store.posts = [post, ...store.posts];
  await writeStore(store);
  return post;
}

export async function toggleLike(
  postId: string,
  visitorId: string,
): Promise<{ post: Post; liked: boolean } | null> {
  const store = await readStore();
  if (!store.settings.enableLikes) return null;
  const idx = store.posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;

  const post = normalizePost(store.posts[idx]);
  if (post.hidden) return null;
  const liked = post.likedBy.includes(visitorId);
  if (liked) {
    post.likedBy = post.likedBy.filter((id) => id !== visitorId);
  } else {
    post.likedBy = [...post.likedBy, visitorId];
  }
  post.likes = post.likedBy.length;
  store.posts[idx] = post;
  await writeStore(store);
  return { post, liked: !liked };
}

export async function addComment(
  postId: string,
  input: { authorName: string; text: string },
): Promise<Post | null> {
  const store = await readStore();
  if (!store.settings.enableComments) return null;
  const idx = store.posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;

  const post = normalizePost(store.posts[idx]);
  if (post.hidden) return null;
  const authorName = input.authorName.trim().slice(0, 60);
  const text = input.text.trim().slice(0, 500);
  if (!authorName || !text) return null;

  post.comments = [
    ...post.comments,
    {
      id: randomUUID(),
      authorName,
      text,
      createdAt: new Date().toISOString(),
    },
  ];
  store.posts[idx] = post;
  await writeStore(store);
  return post;
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<Post | null> {
  const store = await readStore();
  const idx = store.posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  const post = normalizePost(store.posts[idx]);
  post.comments = post.comments.filter((c) => c.id !== commentId);
  store.posts[idx] = post;
  await writeStore(store);
  return post;
}

export async function updatePost(
  id: string,
  patch: Partial<Pick<Post, "caption" | "imageUrl" | "hidden" | "mediaType">>,
): Promise<Post | null> {
  const store = await readStore();
  const idx = store.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<Post>;
  store.posts[idx] = normalizePost({ ...store.posts[idx], ...clean });
  await writeStore(store);
  return store.posts[idx];
}

export async function deletePost(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.posts.length;
  store.posts = store.posts.filter((p) => p.id !== id);
  await writeStore(store);
  return store.posts.length < before;
}

export async function setHighlights(highlights: Highlight[]): Promise<Highlight[]> {
  const store = await readStore();
  store.highlights = highlights.map(normalizeHighlight);
  await writeStore(store);
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
  const store = await readStore();
  const story = store.stories.find((s) => s.id === input.storyId);
  if (!story) return null;

  const item = {
    id: randomUUID(),
    imageUrl: story.imageUrl,
    caption: story.caption || "",
    createdAt: story.createdAt,
  };

  let highlight: Highlight | null = null;

  if (input.highlightId) {
    const idx = store.highlights.findIndex((h) => h.id === input.highlightId);
    if (idx === -1) return null;
    highlight = normalizeHighlight(store.highlights[idx]);
    const already = highlight.items.some((i) => i.imageUrl === item.imageUrl);
    if (!already) {
      highlight.items = [...highlight.items, item];
    }
    if (!highlight.coverUrl) highlight.coverUrl = item.imageUrl;
    store.highlights[idx] = highlight;
  } else {
    const title = (input.newTitle || "لحظات").trim().slice(0, 40) || "لحظات";
    highlight = {
      id: randomUUID(),
      title,
      coverUrl: item.imageUrl,
      items: [item],
    };
    store.highlights = [...store.highlights, highlight];
  }

  await writeStore(store);
  return highlight;
}

export async function removeHighlightItem(input: {
  highlightId: string;
  itemId: string;
}): Promise<Highlight | null> {
  const store = await readStore();
  const idx = store.highlights.findIndex((h) => h.id === input.highlightId);
  if (idx === -1) return null;
  const highlight = normalizeHighlight(store.highlights[idx]);
  highlight.items = highlight.items.filter((i) => i.id !== input.itemId);
  if (highlight.coverUrl && !highlight.items.some((i) => i.imageUrl === highlight.coverUrl)) {
    highlight.coverUrl = highlight.items[0]?.imageUrl || highlight.coverUrl;
  }
  store.highlights[idx] = highlight;
  await writeStore(store);
  return highlight;
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
}): Promise<Story> {
  const store = await readStore();
  const now = Date.now();
  const story: Story = {
    id: randomUUID(),
    imageUrl: input.imageUrl,
    caption: (input.caption || "").trim().slice(0, 200),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + STORY_TTL_MS).toISOString(),
    viewers: [],
  };
  store.stories = [story, ...(store.stories || [])];
  await writeStore(store);
  return story;
}

export async function deleteStory(id: string): Promise<boolean> {
  const store = await readStore();
  const before = store.stories.length;
  store.stories = store.stories.filter((s) => s.id !== id);
  await writeStore(store);
  return store.stories.length < before;
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

export async function recordPageVisit(input: {
  visitorHash: string;
  countryCode?: string;
}): Promise<{ ok: true }> {
  const hash = String(input.visitorHash || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
  if (!hash) return { ok: true };

  const country = String(input.countryCode || "ZZ")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3) || "ZZ";

  const store = await readStore();
  const analytics = normalizeAnalytics(store.analytics);
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

  store.analytics = {
    totalViews: analytics.totalViews,
    days: analytics.days.map((d) =>
      d.date === today
        ? {
            date: d.date,
            views: d.views,
            uniqueVisitors: d.uniqueVisitors,
            countries: d.countries,
            visitorHashes: d.visitorHashes,
          }
        : d,
    ),
  };
  await writeStore(store);
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
  const analytics = normalizeAnalytics(store.analytics);
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
