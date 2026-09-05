import { FollowButton } from "@/components/FollowButton";
import { PostGrid } from "@/components/PostGrid";
import { HighlightsRow, ProfileHeader } from "@/components/ProfileHeader";
import { readStore } from "@/lib/db";
import { getDictionary, normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();
  const locale = normalizeLocale(store.settings.language);
  const t = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: store.settings.siteTitle,
    description: store.settings.siteDescription,
    inLanguage: locale,
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
        verified={store.settings.verified}
        hideFollowers={store.settings.hideFollowers}
        labels={{
          posts: t.posts,
          followers: t.followers,
          following: t.following,
          highlights: t.highlights,
          verifiedLabel: t.verifiedLabel,
        }}
        followSlot={<FollowButton labels={t} locale={locale} />}
      />

      <HighlightsRow highlights={store.highlights} label={t.highlights} />

      <div className="section-title">
        <h2>{t.posts}</h2>
      </div>

      <PostGrid
        posts={store.posts}
        labels={t}
        locale={locale}
        enableLikes={store.settings.enableLikes}
        enableComments={store.settings.enableComments}
      />

      <p className="footer-note">{t.footerNote}</p>
    </main>
  );
}
