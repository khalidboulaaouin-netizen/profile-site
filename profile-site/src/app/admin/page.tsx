import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { readStore } from "@/lib/db";

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const store = await readStore();

  return (
    <main className="admin-page">
      <p className="brand-mark" style={{ fontSize: "2.2rem" }}>
        {store.settings.brandName}
      </p>
      <nav className="admin-nav">
        <Link href="/admin" className="active">
          نظرة عامة
        </Link>
        <Link href="/admin/posts">المنشورات</Link>
        <Link href="/admin/settings">الإعدادات</Link>
        <Link href="/admin/followers">المتابعون</Link>
        <Link href="/">عرض الصفحة</Link>
      </nav>

      <div className="panel">
        <h1>لوحة التحكم</h1>
        <p className="lede">
          مرحباً {session.user.email}. أنت الوحيد الذي يملك صلاحية النشر والتعديل هنا.
        </p>

        <dl className="stats" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
          <div>
            <dt>منشورات</dt>
            <dd>{store.posts.length}</dd>
          </div>
          <div>
            <dt>متابعون</dt>
            <dd>{store.followers.length}</dd>
          </div>
          <div>
            <dt>أبرز</dt>
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
            تسجيل الخروج
          </button>
        </form>
      </div>
    </main>
  );
}
