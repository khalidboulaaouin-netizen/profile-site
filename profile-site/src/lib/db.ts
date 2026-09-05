import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Store, Profile, Post, Highlight, SiteSettings, Follower } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

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
    {
      id: randomUUID(),
      title: "لحظات",
      coverUrl: "",
    },
    {
      id: randomUUID(),
      title: "سفر",
      coverUrl: "",
    },
    {
      id: randomUUID(),
      title: "أعمال",
      coverUrl: "",
    },
  ],
  followers: [],
  settings: {
    siteTitle: "حضوري — صفحتي الشخصية",
    siteDescription:
      "صفحة شخصية احترافية بأسلوب إنستغرام. تابعني عبر حساب Google دون إنشاء حساب جديد.",
    seoKeywords: ["صفحة شخصية", "إنستغرام", "متابعة", "Google", "حضوري"],
    allowFollow: true,
    brandName: "حضوري",
    contactEmail: "",
  },
});

async function ensureStore(): Promise<Store> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
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
  store.profile = { ...store.profile, ...patch };
  await writeStore(store);
  return store.profile;
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const store = await readStore();
  store.settings = { ...store.settings, ...patch };
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
  };
  store.posts = [post, ...store.posts];
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
