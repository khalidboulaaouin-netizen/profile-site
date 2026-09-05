import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const store = await readStore();
  const t = getDictionary(store.settings.language);

  return (
    <main className="admin-page">
      <p className="brand-mark" style={{ fontSize: "2.2rem" }}>
        {store.settings.brandName}
      </p>
      <nav className="admin-nav">
        <Link href="/admin" className="active">
          {t.overview}
        </Link>
        <Link href="/admin/posts">{t.posts}</Link>
        <Link href="/admin/stories">{t.stories}</Link>
        <Link href="/admin/messages">{t.messages}</Link>
        <Link href="/admin/settings">{t.settings}</Link>
        <Link href="/admin/followers">{t.followers}</Link>
        <Link href="/">{t.viewPage}</Link>
      </nav>

      <div className="panel">
        <h1>{t.dashboard}</h1>
        <p className="lede">
          {session.user.email}. {t.dashboardLede}
        </p>

        <dl className="stats" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
          <div>
            <dt>{t.posts}</dt>
            <dd>{store.posts.length}</dd>
          </div>
          <div>
            <dt>{t.followers}</dt>
            <dd>{store.followers.length}</dd>
          </div>
          <div>
            <dt>{t.highlights}</dt>
            <dd>{store.highlights.length}</dd>
          </div>
        </dl>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          style={{ marginTop: "1.25rem" }}
        >
          <button className="btn btn-ghost" type="submit">
            {t.signOut}
          </button>
        </form>
      </div>
    </main>
  );
}
