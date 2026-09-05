import { AdminNav } from "@/components/AdminNav";
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
      <AdminNav
        labels={{
          overview: t.overview,
          posts: t.posts,
          stories: t.stories,
          messages: t.messages,
          settings: t.settings,
          followers: t.followers,
          stats: t.stats,
          viewPage: t.viewPage,
          notifications: t.notifications,
          markAllRead: t.markAllRead,
          noNotifications: t.noNotifications,
          enableBrowserPush: t.enableBrowserPush,
        }}
      />

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
