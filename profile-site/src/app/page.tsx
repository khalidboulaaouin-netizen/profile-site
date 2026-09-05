import { Suspense } from "react";
import { FollowButton } from "@/components/FollowButton";
import { HighlightsRow } from "@/components/HighlightsRow";
import { MessageButton } from "@/components/MessageButton";
import { PostGrid } from "@/components/PostGrid";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ShareButton } from "@/components/ShareButton";
import { StoryRing } from "@/components/StoryRing";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { auth } from "@/lib/auth";
import { isBlocked, readStore } from "@/lib/db";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import { getPublicSiteUrl, toAbsoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();
  const locale = normalizeLocale(store.settings.language);
  const t = getDictionary(locale);
  const session = await auth();
  const siteUrl = getPublicSiteUrl(store.settings);

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

  const publicPosts = store.posts.filter((p) => !p.hidden);
  const imageUrls = [
    store.profile.avatarUrl,
    store.profile.coverUrl,
    ...publicPosts.map((p) => p.imageUrl),
  ]
    .filter(Boolean)
    .map((url) => toAbsoluteUrl(String(url), siteUrl));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: store.settings.siteTitle,
    description: store.settings.siteDescription,
    inLanguage: locale,
    url: siteUrl,
    image: imageUrls.slice(0, 12),
    mainEntity: {
      "@type": "Person",
      name: store.profile.displayName,
      alternateName: store.profile.username,
      description: store.profile.bio,
      image: store.profile.avatarUrl
        ? toAbsoluteUrl(store.profile.avatarUrl, siteUrl)
        : undefined,
      url: store.profile.website || siteUrl,
      address: store.profile.location || undefined,
    },
    hasPart: publicPosts.slice(0, 24).map((post) => ({
      "@type": "ImageObject",
      contentUrl: toAbsoluteUrl(post.imageUrl, siteUrl),
      caption: post.caption || undefined,
      datePublished: post.createdAt,
    })),
  };

  return (
    <main className="site-frame">
      <VisitTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="top-tools">
        <ThemeToggle
          initialMode={store.settings.colorMode || "system"}
          labels={{
            theme: t.theme,
            light: t.themeLight,
            dark: t.themeDark,
            system: t.themeSystem,
          }}
        />
        <ShareButton
          url={siteUrl}
          title={store.settings.siteTitle || store.profile.displayName}
          labels={{
            share: t.shareProfile,
            copied: t.linkCopied,
            shareFailed: t.shareFailed,
          }}
        />
      </div>

      <ProfileHeader
        profile={store.profile}
        brandName={store.settings.brandName}
        postsCount={publicPosts.length}
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
        }}
        followSlot={
          <div className="profile-actions">
            <FollowButton
              labels={t}
              locale={locale}
              social={{
                instagramUrl: store.profile.instagramUrl,
                facebookUrl: store.profile.facebookUrl,
                tiktokUrl: store.profile.tiktokUrl,
              }}
            />
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
        posts={publicPosts}
        labels={t}
        locale={locale}
        enableLikes={store.settings.enableLikes}
        enableComments={store.settings.enableComments}
      />

      <p className="footer-note">{t.footerNote}</p>
    </main>
  );
}
