"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNotifications } from "@/components/AdminNotifications";

export function AdminNav({
  labels,
}: {
  labels: {
    overview: string;
    posts: string;
    stories: string;
    messages: string;
    settings: string;
    followers: string;
    stats: string;
    community: string;
    viewPage: string;
    notifications: string;
    markAllRead: string;
    noNotifications: string;
    enableBrowserPush: string;
  };
}) {
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: labels.overview, exact: true },
    { href: "/admin/posts", label: labels.posts },
    { href: "/admin/stories", label: labels.stories },
    { href: "/admin/messages", label: labels.messages },
    { href: "/admin/settings", label: labels.settings },
    { href: "/admin/followers", label: labels.followers },
    { href: "/admin/stats", label: labels.stats },
    { href: "/admin/community", label: labels.community },
    { href: "/", label: labels.viewPage },
  ];

  return (
    <div className="admin-nav-row">
      <nav className="admin-nav">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <AdminNotifications
        labels={{
          notifications: labels.notifications,
          markAllRead: labels.markAllRead,
          noNotifications: labels.noNotifications,
          enableBrowserPush: labels.enableBrowserPush,
        }}
      />
    </div>
  );
}
