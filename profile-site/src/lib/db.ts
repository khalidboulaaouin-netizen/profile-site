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
} from "./types";
import { normalizeDecoration, normalizeHex } from "./theme";
import { readPersistedStoreJson, writePersistedStoreJson } from "./storage";

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
    accentColor: "#0d6e6e",
    backgroundColor: "#eef2f4",
    decoration: "soft",
    showReadReceipts: false,
    publicSiteUrl: "",
    colorMode: "system",
  },
});

function normalizePost(post: Post): Post {
  return {
    ...post,
    mediaType: post.mediaType === "video" ? "video" : "image",
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
      accentColor: normalizeHex(store.settings?.accentColor, "#0d6e6e"),
      backgroundColor: normalizeHex(store.settings?.backgroundColor, "#eef2f4"),
      decoration: normalizeDecoration(store.settings?.decoration),
      showReadReceipts: store.settings?.showReadReceipts ?? false,
      publicSiteUrl: String(store.settings?.publicSiteUrl || ""),
      colorMode:
        store.settings?.colorMode === "light" || store.settings?.colorMode === "dark"
          ? store.settings.colorMode
          : "system",
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
  };
}

async function ensureStore(): Promise<Store> {
  const raw = await readPersistedStoreJson();
  if (raw) {
    const parsed = JSON.parse(raw) as Store;
    const normalized = normalizeStore(parsed);
    // Persist cleanup of expired stories when needed
    if ((parsed.stories || []).length !== normalized.stories.length) {
      await writePersistedStoreJson(JSON.stringify(normalized, null, 2));
    }
    return normalized;
  }

  const store = defaultStore();
  await writePersistedStoreJson(JSON.stringify(store, null, 2));
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
    clean.accentColor = normalizeHex(clean.accentColor, store.settings.accentColor || "#0d6e6e");
  }
  if (clean.backgroundColor !== undefined) {
    clean.backgroundColor = normalizeHex(
      clean.backgroundColor,
      store.settings.backgroundColor || "#eef2f4",
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
  mediaType?: "image" | "video";
}): Promise<Post> {
  const store = await readStore();
  const post: Post = {
    id: randomUUID(),
    imageUrl: input.imageUrl,
    mediaType: input.mediaType === "video" ? "video" : "image",
    hidden: false,
    caption: input.caption,
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
