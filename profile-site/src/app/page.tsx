import { FollowButton } from "@/components/FollowButton";
import { PostGrid } from "@/components/PostGrid";
import { HighlightsRow, ProfileHeader } from "@/components/ProfileHeader";
import { readStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: store.settings.siteTitle,
    description: store.settings.siteDescription,
    mainEntity: {
      "@type": "Person",
      name: store.profile.displayName,
      alternateName: store.profile.username,
      description: store.profile.bio,
      image: store.profile.avatarUrl || undefined,
      url: store.profile.website || process.env.NEXTAUTH_URL,
      address: store.profile.location || undefined,
    },
  };

  return (
    <main className="site-frame">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProfileHeader
        profile={store.profile}
        brandName={store.settings.brandName}
        postsCount={store.posts.length}
        followersCount={store.followers.length}
        followSlot={<FollowButton />}
      />

      <HighlightsRow highlights={store.highlights} />

      <div className="section-title">
        <h2>المنشورات</h2>
      </div>

      <PostGrid posts={store.posts} />

      <p className="footer-note">
        المتابعة عبر Google فقط · التحكم الكامل للمالك فقط · جاهز للفهرسة في Google
      </p>
    </main>
  );
}
