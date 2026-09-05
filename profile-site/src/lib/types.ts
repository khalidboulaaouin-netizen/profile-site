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

export type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likes: number;
};

export type Highlight = {
  id: string;
  title: string;
  coverUrl: string;
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
};

export type Store = {
  profile: Profile;
  posts: Post[];
  highlights: Highlight[];
  followers: Follower[];
  settings: SiteSettings;
};
