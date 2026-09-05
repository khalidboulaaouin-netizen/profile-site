export type Profile = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  website: string;
  location: string;
  emailPublic: string;
};

export type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  /** Media URL (image or video under /uploads) */
  imageUrl: string;
  /** image = photo post, video = reel-style clip */
  mediaType: "image" | "video";
  /** When true, post stays in admin but is hidden from the public page */
  hidden: boolean;
  caption: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
};

export type Highlight = {
  id: string;
  title: string;
  coverUrl: string;
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
};
