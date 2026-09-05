import { Suspense } from "react";
import { FollowButton } from "@/components/FollowButton";
import { HighlightsRow } from "@/components/HighlightsRow";
import { MessageButton } from "@/components/MessageButton";
import { PostGrid } from "@/components/PostGrid";
import { ProfileHeader } from "@/components/ProfileHeader";
import { StoryRing } from "@/components/StoryRing";
import { auth } from "@/lib/auth";
import { isBlocked, readStore } from "@/lib/db";
import { getDictionary, normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();
  const locale = normalizeLocale(store.settings.language);
  const t = getDictionary(locale);
  const session = await auth();

  if (session?.user?.role === "follower" && (await isBlocked(session.user.id))) {
    return (
      <main className="site-frame blocked-page">
        <div className="panel blocked-panel">
          <h1>{t.blockedPageTitle}</h1>
          <p className="lede">{t.blockedPageMessage}</p>
        </div>
      </main>
    );
  }

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
        postsCount={store.posts.filter((p) => !p.hidden).length}
        followersCount={store.followers.length}
        verified={store.settings.verified}
        hideFollowers={store.settings.hideFollowers}
        hideFollowing={store.settings.hideFollowing}
        labels={{
          posts: t.posts,
          followers: t.followers,
          following: t.following,
          highlights: t.highlights,
          verifiedLabel: t.verifiedLabel,
          followOnSocial: t.followOnSocial,
          instagram: t.instagram,
          facebook: t.facebook,
          tiktok: t.tiktok,
        }}
        followSlot={
          <div className="profile-actions">
            <FollowButton labels={t} locale={locale} />
            <MessageButton labels={t} />
          </div>
        }
      />

      <Suspense fallback={null}>
        <StoryRing labels={t} />
      </Suspense>

      <HighlightsRow
        highlights={store.highlights}
        label={t.highlights}
        closeLabel={t.close}
      />

      <div className="section-title">
        <h2>{t.posts}</h2>
      </div>

      <PostGrid
        posts={store.posts.filter((p) => !p.hidden)}
        labels={t}
        locale={locale}
        enableLikes={store.settings.enableLikes}
        enableComments={store.settings.enableComments}
      />

      <p className="footer-note">{t.footerNote}</p>
    </main>
  );
}
