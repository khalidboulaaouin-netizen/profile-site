import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listOwnerNotifications, markOwnerNotificationsRead } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const notifications = await listOwnerNotifications();
  return NextResponse.json({
    notifications,
    unread: notifications.filter((n) => !n.read).length,
  });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : undefined;
  const notifications = await markOwnerNotificationsRead(
    body.markAllRead ? undefined : ids,
  );
  return NextResponse.json({
    notifications,
    unread: notifications.filter((n) => !n.read).length,
  });
}
