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
  imageUrl: string;
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
};

export type Store = {
  profile: Profile;
  posts: Post[];
  highlights: Highlight[];
  stories: Story[];
  followers: Follower[];
  settings: SiteSettings;
};
