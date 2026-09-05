import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { readStore } from "@/lib/db";

export default async function AdminFollowersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const store = await readStore();

  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <Link href="/admin">نظرة عامة</Link>
        <Link href="/admin/posts">المنشورات</Link>
        <Link href="/admin/settings">الإعدادات</Link>
        <Link href="/admin/followers" className="active">
          المتابعون
        </Link>
        <Link href="/">عرض الصفحة</Link>
      </nav>

      <div className="panel">
        <h1>المتابعون عبر Google</h1>
        <p className="lede">
          هؤلاء زوّار ضغطوا «متابعة عبر Google» فقط. لا يوجد تسجيل حساب مستقل لهم.
        </p>

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
                    منذ {new Date(f.followedAt).toLocaleString("ar")}
                  </small>
                </div>
              </div>
            </div>
          ))}
          {!store.followers.length && (
            <p className="lede">لا متابعين بعد. فعّل Google OAuth ثم شارك رابط صفحتك.</p>
          )}
        </div>
      </div>
    </main>
  );
}
