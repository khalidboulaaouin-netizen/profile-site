import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { getDictionary, normalizeLocale } from "@/lib/i18n";

export default async function AdminFollowersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const store = await readStore();
  const locale = normalizeLocale(store.settings.language);
  const t = getDictionary(locale);

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">{t.overview}</Link>
        <Link href="/admin/posts">{t.posts}</Link>
        <Link href="/admin/settings">{t.settings}</Link>
        <Link href="/admin/followers" className="active">
          {t.followers}
        </Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      <div className="panel">
        <h1>{t.followersTitle}</h1>
        <p className="lede">{t.followersLede}</p>

        <div className="admin-list">
          {store.followers.map((f) => (
            <div key={f.id} className="admin-item">
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="" />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    background: "var(--accent-soft)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                  }}
                >
                  {(f.name || "?").slice(0, 1)}
                </div>
              )}
              <div>
                <p style={{ margin: 0 }}>{f.name}</p>
                <small style={{ color: "var(--muted)" }} dir="ltr">
                  {f.email}
                </small>
                <div>
                  <small style={{ color: "var(--muted)" }}>
                    {t.since}{" "}
                    {new Date(f.followedAt).toLocaleString(locale)}
                  </small>
                </div>
              </div>
            </div>
          ))}
          {!store.followers.length && <p className="lede">{t.noFollowers}</p>}
        </div>
      </div>
    </main>
  );
}
