import type { Highlight, Profile } from "@/lib/types";

export function ProfileHeader({
  profile,
  brandName,
  postsCount,
  followersCount,
  followSlot,
}: {
  profile: Profile;
  brandName: string;
  postsCount: number;
  followersCount: number;
  followSlot: React.ReactNode;
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
            <h1>{profile.displayName}</h1>
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
            <dt>منشورات</dt>
            <dd>{postsCount}</dd>
          </div>
          <div>
            <dt>متابعون</dt>
            <dd>{followersCount}</dd>
          </div>
          <div>
            <dt>يتابع</dt>
            <dd>0</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

export function HighlightsRow({ highlights }: { highlights: Highlight[] }) {
  if (!highlights.length) return null;

  return (
    <section className="highlights" aria-label="أبرز اللحظات">
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
