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
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { GuestbookWall } from "@/components/GuestbookWall";
import { DailyQuestionBox } from "@/components/DailyQuestionBox";
import { QrShareCard } from "@/components/QrShareCard";
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
    hasPart: publicPosts.slice(0, 24).map((post) =>
      post.mediaType === "text"
        ? {
            "@type": "Article",
            headline: (post.caption || "").slice(0, 110) || store.profile.displayName,
            articleBody: post.caption || undefined,
            datePublished: post.createdAt,
            image: post.imageUrl
              ? toAbsoluteUrl(post.imageUrl, siteUrl)
              : undefined,
          }
        : {
            "@type": post.mediaType === "video" ? "VideoObject" : "ImageObject",
            contentUrl: toAbsoluteUrl(post.imageUrl, siteUrl),
            caption: post.caption || undefined,
            datePublished: post.createdAt,
          },
    ),
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
        {session?.user?.role === "admin" ? (
          <a className="btn btn-primary owner-entry-btn" href="/admin">
            {t.dashboard}
          </a>
        ) : (
          <a className="btn btn-primary owner-entry-btn" href="/login">
            {t.ownerLogin}
          </a>
        )}
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

      <AdSenseUnit
        clientId={store.settings.adsenseClientId}
        slotId={store.settings.adsenseSlotId}
        format="horizontal"
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

      <AdSenseUnit
        clientId={store.settings.adsenseClientId}
        slotId={store.settings.adsenseSlotId}
        format="rectangle"
      />

      
      <DailyQuestionBox
        labels={{
          questionTitle: t.questionTitle,
          questionLede: t.questionLede,
          questionPlaceholder: t.questionPlaceholder,
          questionSubmit: t.questionSubmit,
          questionLogin: t.questionLogin,
          questionEmpty: t.questionEmpty,
          questionInactive: t.questionInactive,
          loading: t.loading,
        }}
        locale={locale}
      />

      <GuestbookWall
        labels={{
          guestbookTitle: t.guestbookTitle,
          guestbookLede: t.guestbookLede,
          guestbookPlaceholder: t.guestbookPlaceholder,
          guestbookSubmit: t.guestbookSubmit,
          guestbookLogin: t.guestbookLogin,
          guestbookEmpty: t.guestbookEmpty,
          loading: t.loading,
          guestbookDisabled: t.guestbookDisabled,
        }}
        locale={locale}
      />

      <QrShareCard
        url={siteUrl}
        labels={{
          qrTitle: t.qrTitle,
          qrLede: t.qrLede,
          qrDownload: t.qrDownload,
          qrOpen: t.qrOpen,
          linkCopied: t.linkCopied,
          qrCopy: t.qrCopy,
        }}
      />

      <p className="footer-note">{t.footerNote}</p>
      {session?.user?.role !== "admin" ? (
        <p className="owner-login-foot">
          <a href="/login">{t.ownerLogin}</a>
        </p>
      ) : null}

      <InstallAppPrompt
        labels={{
          title: t.installAppTitle,
          body: t.installAppBody,
          steps: t.installAppSteps,
          dismiss: t.installAppDismiss,
          openLogin: t.installAppOpenLogin,
        }}
      />
    </main>
  );
}
