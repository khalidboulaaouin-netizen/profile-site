"use client";

import { AdminNav } from "@/components/AdminNav";
import { useEffect, useState } from "react";
import { getDictionary, normalizeLocale, type Dictionary } from "@/lib/i18n";

type Summary = {
  totalViews: number;
  todayViews: number;
  todayUnique: number;
  last7Views: number;
  last7Unique: number;
  last30Views: number;
  followers: number;
  days: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
    countries: Record<string, number>;
  }>;
  countries: Array<{ code: string; views: number }>;
};

const COUNTRY_NAMES_AR: Record<string, string> = {
  SA: "السعودية",
  AE: "الإمارات",
  EG: "مصر",
  MA: "المغرب",
  DZ: "الجزائر",
  TN: "تونس",
  LY: "ليبيا",
  JO: "الأردن",
  LB: "لبنان",
  IQ: "العراق",
  KW: "الكويت",
  QA: "قطر",
  BH: "البحرين",
  OM: "عُمان",
  YE: "اليمن",
  SD: "السودان",
  SY: "سوريا",
  PS: "فلسطين",
  US: "الولايات المتحدة",
  GB: "بريطانيا",
  FR: "فرنسا",
  DE: "ألمانيا",
  ES: "إسبانيا",
  IT: "إيطاليا",
  TR: "تركيا",
  CA: "كندا",
  ZZ: "غير معروف",
};

export default function AdminStatsPage() {
  const [t, setT] = useState<Dictionary>(() => getDictionary("ar"));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setT(getDictionary(normalizeLocale(d.settings?.language))))
      .catch(() => undefined);

    fetch("/api/analytics?days=30")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data: Summary) => setSummary(data))
      .catch(() => setError(true));
  }, []);

  const maxViews = Math.max(1, ...(summary?.days.map((d) => d.views) || [1]));

  return (
    <main className="admin-page">
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
        <h1>{t.statsTitle}</h1>
        <p className="lede">{t.statsLede}</p>
        {error ? <p className="hint">{t.statsLoadFailed}</p> : null}
        {!summary && !error ? <p className="lede">{t.loading}</p> : null}

        {summary ? (
          <dl className="stats" style={{ borderTop: "none", paddingTop: 0, marginTop: "0.5rem" }}>
            <div>
              <dt>{t.statsTodayViews}</dt>
              <dd>{summary.todayViews}</dd>
            </div>
            <div>
              <dt>{t.statsTodayUnique}</dt>
              <dd>{summary.todayUnique}</dd>
            </div>
            <div>
              <dt>{t.statsLast7}</dt>
              <dd>{summary.last7Views}</dd>
            </div>
            <div>
              <dt>{t.statsLast30}</dt>
              <dd>{summary.last30Views}</dd>
            </div>
            <div>
              <dt>{t.statsTotalViews}</dt>
              <dd>{summary.totalViews}</dd>
            </div>
            <div>
              <dt>{t.followers}</dt>
              <dd>{summary.followers}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {summary ? (
        <>
          <div className="panel" style={{ marginTop: "1rem" }}>
            <h2>{t.statsDailyTitle}</h2>
            <p className="lede">{t.statsDailyLede}</p>
            <div className="stats-bars">
              {summary.days.length === 0 ? (
                <p className="lede">{t.statsEmpty}</p>
              ) : (
                summary.days
                  .slice()
                  .reverse()
                  .map((day) => (
                    <div key={day.date} className="stats-bar-row">
                      <span className="stats-bar-date" dir="ltr">
                        {day.date}
                      </span>
                      <div className="stats-bar-track" aria-hidden="true">
                        <span
                          className="stats-bar-fill"
                          style={{ width: `${Math.max(4, (day.views / maxViews) * 100)}%` }}
                        />
                      </div>
                      <span className="stats-bar-num">
                        {day.views} / {day.uniqueVisitors}
                      </span>
                    </div>
                  ))
              )}
            </div>
            <p className="lede" style={{ marginTop: "0.75rem" }}>
              {t.statsBarLegend}
            </p>
          </div>

          <div className="panel" style={{ marginTop: "1rem" }}>
            <h2>{t.statsCountriesTitle}</h2>
            <p className="lede">{t.statsCountriesLede}</p>
            {summary.countries.length === 0 ? (
              <p className="lede">{t.statsEmpty}</p>
            ) : (
              <ul className="stats-countries">
                {summary.countries.map((c) => (
                  <li key={c.code}>
                    <strong>{COUNTRY_NAMES_AR[c.code] || c.code}</strong>
                    <span dir="ltr">{c.code}</span>
                    <span>{c.views}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel" style={{ marginTop: "1rem" }}>
            <h2>{t.statsLimitsTitle}</h2>
            <p className="lede">{t.statsLimitsLede}</p>
          </div>
        </>
      ) : null}
    </main>
  );
}
