export type Profile = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  website: string;
  location: string;
  emailPublic: string;
  /** Public Instagram profile URL */
  instagramUrl: string;
  /** Public Facebook profile/page URL */
  facebookUrl: string;
  /** Public TikTok profile URL */
  tiktokUrl: string;
};

export type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  /** Media URL (image/video) or optional cover for text articles */
  imageUrl: string;
  /** image = photo, video = reel, text = short/long written article */
  mediaType: "image" | "video" | "text";
  /** When true, post stays in admin but is hidden from the public page */
  hidden: boolean;
  /** Caption for media posts, or full article body for text posts */
  caption: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
};

export type HighlightItem = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  mediaType?: "image" | "video";
};

export type Highlight = {
  id: string;
  title: string;
  coverUrl: string;
  /** Permanent story slides kept under the bio (no 24h expiry) */
  items: HighlightItem[];
};

export type StoryViewer = {
  googleId: string;
  name: string;
  email: string;
  image: string;
  viewedAt: string;
};

export type Story = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
  viewers: StoryViewer[];
  mediaType?: "image" | "video";
  likes: number;
  likedBy: string[];
  comments: Comment[];
};

export type Follower = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  followedAt: string;
};

export type BlockedUser = {
  googleId: string;
  name: string;
  email: string;
  image: string;
  blockedAt: string;
};

export type ChatMessage = {
  id: string;
  from: "follower" | "owner";
  text: string;
  /** Optional uploaded voice note URL under /uploads */
  audioUrl?: string;
  createdAt: string;
  readByOwner: boolean;
  readByFollower: boolean;
};

export type Conversation = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string[];
  allowFollow: boolean;
  brandName: string;
  contactEmail: string;
  /** UI language for public page + admin panel */
  language: string;
  /** Blue verification badge next to the name */
  verified: boolean;
  /** Hide followers count on the public page */
  hideFollowers: boolean;
  /** Hide following count on the public page */
  hideFollowing: boolean;
  /** Show hearts and allow liking posts */
  enableLikes: boolean;
  /** Show comments and allow writing comments */
  enableComments: boolean;
  /** Primary accent color (hex) */
  accentColor: string;
  /** Page background color (hex) */
  backgroundColor: string;
  /** Background decoration style */
  decoration: "soft" | "mesh" | "dots" | "waves" | "none";
  /** Show “seen” read receipts to followers in private chat */
  showReadReceipts: boolean;
  /**
   * Free public site URL used for SEO/share (e.g. https://xxx.vercel.app).
   * No paid domain required — keep your free Vercel URL here.
   */
  publicSiteUrl: string;
  /** Preferred color mode for visitors (also overridable in browser) */
  colorMode: "light" | "dark" | "system";
  /**
   * Optional free Google Analytics 4 Measurement ID (e.g. G-XXXXXXXX).
   * Leave empty to use only built-in free stats.
   */
  gaMeasurementId: string;
  /**
   * Free Google AdSense client ID (ca-pub-XXXXXXXX).
   * Leave empty until AdSense approves your site.
   */
  adsenseClientId: string;
  /** Optional AdSense ad unit slot ID (digits only). */
  adsenseSlotId: string;
  /** Show public guestbook wall */
  enableGuestbook: boolean;
  /** Show question of the day */
  enableDailyQuestion: boolean;
};

export type AnalyticsDay = {
  /** YYYY-MM-DD (UTC) */
  date: string;
  views: number;
  uniqueVisitors: number;
  /** ISO country codes → view counts */
  countries: Record<string, number>;
  /** Short visitor hashes for the day (capped) — not shown publicly */
  visitorHashes: string[];
};

export type Analytics = {
  totalViews: number;
  days: AnalyticsDay[];
};

export type OwnerNotification = {
  id: string;
  type: "follow" | "message" | "guestbook" | "answer";
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
};


export type GuestbookEntry = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  text: string;
  createdAt: string;
  hidden: boolean;
};

export type QuestionAnswer = {
  id: string;
  googleId: string;
  name: string;
  email: string;
  image: string;
  text: string;
  createdAt: string;
  hidden: boolean;
};

export type DailyQuestion = {
  text: string;
  updatedAt: string;
  active: boolean;
  answers: QuestionAnswer[];
};

export type Store = {
  profile: Profile;
  posts: Post[];
  highlights: Highlight[];
  stories: Story[];
  followers: Follower[];
  blockedUsers: BlockedUser[];
  conversations: Conversation[];
  settings: SiteSettings;
  notifications: OwnerNotification[];
  analytics: Analytics;
  guestbook: GuestbookEntry[];
  dailyQuestion: DailyQuestion;
};
