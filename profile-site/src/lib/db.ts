import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  Store,
  Profile,
  Post,
  Highlight,
  SiteSettings,
  Follower,
  Story,
  StoryViewer,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
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
  },
  posts: [],
  highlights: [
    { id: randomUUID(), title: "لحظات", coverUrl: "" },
    { id: randomUUID(), title: "سفر", coverUrl: "" },
    { id: randomUUID(), title: "أعمال", coverUrl: "" },
  ],
  stories: [],
  followers: [],
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
    enableLikes: true,
    enableComments: true,
  },
});

function normalizePost(post: Post): Post {
  return {
    ...post,
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

function isStoryActive(story: Story, now = Date.now()) {
  return new Date(story.expiresAt).getTime() > now;
}

function normalizeStore(store: Store): Store {
  const now = Date.now();
  return {
    ...store,
    posts: (store.posts || []).map(normalizePost),
    stories: (store.stories || [])
      .map(normalizeStory)
      .filter((story) => isStoryActive(story, now)),
    settings: {
      ...defaultStore().settings,
      ...store.settings,
      language: store.settings?.language || "ar",
      verified: store.settings?.verified ?? true,
      hideFollowers: store.settings?.hideFollowers ?? false,
      enableLikes: store.settings?.enableLikes ?? true,
      enableComments: store.settings?.enableComments ?? true,
    },
  };
}

async function ensureStore(): Promise<Store> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const normalized = normalizeStore(JSON.parse(raw) as Store);
    // Persist cleanup of expired stories when needed
    const parsed = JSON.parse(raw) as Store;
    if ((parsed.stories || []).length !== normalized.stories.length) {
      await fs.writeFile(STORE_PATH, JSON.stringify(normalized, null, 2), "utf8");
    }
    return normalized;
  } catch {
    const store = defaultStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
    return store;
  }
}

export async function readStore(): Promise<Store> {
  return ensureStore();
}

export async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const store = await readStore();
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<Profile>;
  store.profile = { ...store.profile, ...clean };
  await writeStore(store);
  return store.profile;
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const store = await readStore();
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<SiteSettings>;
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
}): Promise<Post> {
  const store = await readStore();
  const post: Post = {
    id: randomUUID(),
    imageUrl: input.imageUrl,
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
  patch: Partial<Pick<Post, "caption" | "imageUrl">>,
): Promise<Post | null> {
  const store = await readStore();
  const idx = store.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.posts[idx] = { ...store.posts[idx], ...patch };
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
  store.highlights = highlights;
  await writeStore(store);
  return store.highlights;
}

export async function followWithGoogle(input: {
  googleId: string;
  name: string;
  email: string;
  image: string;
}): Promise<{ follower: Follower; alreadyFollowing: boolean }> {
  const store = await readStore();
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
