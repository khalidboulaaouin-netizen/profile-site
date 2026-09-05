import type { Highlight, Profile } from "@/lib/types";

export function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="verified-badge" title={label} aria-label={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1d9bf0" />
        <path
          d="M10.2 15.8 6.8 12.4l1.4-1.4 2 2 5-5 1.4 1.4-6.4 6.4z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}

export function ProfileHeader({
  profile,
  brandName,
  postsCount,
  followersCount,
  followSlot,
  labels,
  verified = false,
  hideFollowers = false,
}: {
  profile: Profile;
  brandName: string;
  postsCount: number;
  followersCount: number;
  followSlot: React.ReactNode;
  labels: {
    posts: string;
    followers: string;
    following: string;
    highlights: string;
    verifiedLabel: string;
  };
  verified?: boolean;
  hideFollowers?: boolean;
}) {
  const initial = (profile.displayName || brandName).slice(0, 1);

  return (
    <header className="profile-header">
      <div className="cover-plane" aria-hidden="true">
        {profile.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.coverUrl} alt="" className="cover-img" />
        ) : (
          <div className="cover-fallback" />
        )}
      </div>

      <div className="profile-shell">
        <p className="brand-mark">{brandName}</p>

        <div className="identity-row">
          <div className="avatar-ring">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} />
            ) : (
              <span className="avatar-fallback">{initial}</span>
            )}
          </div>

          <div className="identity-copy">
            <h1 className="name-row">
              <span>{profile.displayName}</span>
              {verified && <VerifiedBadge label={labels.verifiedLabel} />}
            </h1>
            <p className="username">@{profile.username}</p>
            <p className="bio">{profile.bio}</p>
            <div className="meta-line">
              {profile.location && <span>{profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer">
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
            {followSlot}
          </div>
        </div>

        <dl className="stats">
          <div>
            <dt>{labels.posts}</dt>
            <dd>{postsCount}</dd>
          </div>
          {!hideFollowers && (
            <div>
              <dt>{labels.followers}</dt>
              <dd>{followersCount}</dd>
            </div>
          )}
          <div>
            <dt>{labels.following}</dt>
            <dd>0</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

export function HighlightsRow({
  highlights,
  label,
}: {
  highlights: Highlight[];
  label: string;
}) {
  if (!highlights.length) return null;

  return (
    <section className="highlights" aria-label={label}>
      {highlights.map((item, index) => (
        <div
          key={item.id}
          className="highlight"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="highlight-cover">
            {item.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.coverUrl} alt="" />
            ) : (
              <span>{item.title.slice(0, 1)}</span>
            )}
          </div>
          <p>{item.title}</p>
        </div>
      ))}
    </section>
  );
}
