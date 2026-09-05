#!/usr/bin/env node
const { writeFileSync, mkdirSync } = require("fs");
const { randomUUID } = require("crypto");
const path = require("path");

const root = path.join(__dirname, "..");
const uploadDir = path.join(root, "public", "uploads");
mkdirSync(uploadDir, { recursive: true });

const colors = [
  ["#0d6e6e", "#1f4d57"],
  ["#27475c", "#0a5555"],
  ["#3a6270", "#15202b"],
  ["#1a6b7a", "#0d4f5f"],
  ["#2f5d68", "#16343c"],
  ["#0f766e", "#134e4a"],
];

const captions = [
  "لحظة صباح هادئة",
  "تفاصيل يومية",
  "ضوء المساء",
  "من مساحة العمل",
  "مشهد عابر",
  "نهاية الأسبوع",
];

const files = colors.map(([a, b], i) => {
  const name = `demo-${i + 1}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="900" fill="url(#g)"/>
  <circle cx="680" cy="180" r="90" fill="rgba(255,255,255,0.12)"/>
  <circle cx="160" cy="720" r="140" fill="rgba(255,255,255,0.08)"/>
  <text x="60" y="820" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" font-size="42">${captions[i]}</text>
</svg>`;
  writeFileSync(path.join(uploadDir, name), svg);
  return {
    id: randomUUID(),
    imageUrl: `/uploads/${name}`,
    caption: captions[i],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    likes: 12 - i,
  };
});

const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0d6e6e"/><stop offset="100%" stop-color="#27475c"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#a)"/>
  <circle cx="200" cy="150" r="70" fill="rgba(255,255,255,0.9)"/>
  <ellipse cx="200" cy="330" rx="120" ry="90" fill="rgba(255,255,255,0.9)"/>
</svg>`;
writeFileSync(path.join(uploadDir, "avatar.svg"), avatar);

const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700" viewBox="0 0 1600 700">
  <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#16343c"/><stop offset="50%" stop-color="#0d6e6e"/><stop offset="100%" stop-color="#2a5570"/></linearGradient></defs>
  <rect width="1600" height="700" fill="url(#c)"/>
  <circle cx="1300" cy="120" r="160" fill="rgba(255,255,255,0.08)"/>
  <circle cx="200" cy="560" r="220" fill="rgba(255,255,255,0.06)"/>
</svg>`;
writeFileSync(path.join(uploadDir, "cover.svg"), cover);

const highlightCovers = ["لحظات", "سفر", "أعمال"].map((title, i) => {
  const name = `highlight-${i + 1}.svg`;
  const [a, b] = colors[i];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs>
  <rect width="300" height="300" fill="url(#h)"/>
  <text x="50%" y="54%" text-anchor="middle" fill="white" font-size="36" font-family="Arial">${title}</text>
</svg>`;
  writeFileSync(path.join(uploadDir, name), svg);
  return { id: randomUUID(), title, coverUrl: `/uploads/${name}` };
});

const store = {
  profile: {
    displayName: "حضوري",
    username: "hodouri",
    bio: "مساحة شخصية أنشر فيها لحظاتي وأعمالي. المتابعة عبر Google فقط — بدون إنشاء حساب.",
    avatarUrl: "/uploads/avatar.svg",
    coverUrl: "/uploads/cover.svg",
    website: "https://example.com",
    location: "العالم العربي",
    emailPublic: "",
  },
  posts: files,
  highlights: highlightCovers,
  followers: [],
  settings: {
    siteTitle: "حضوري — صفحتي الشخصية",
    siteDescription:
      "صفحة شخصية احترافية بأسلوب إنستغرام. تابعني عبر حساب Google دون إنشاء حساب جديد.",
    seoKeywords: ["صفحة شخصية", "إنستغرام", "متابعة", "Google", "حضوري"],
    allowFollow: true,
    brandName: "حضوري",
    contactEmail: "",
  },
};

mkdirSync(path.join(root, "data"), { recursive: true });
writeFileSync(path.join(root, "data", "store.json"), JSON.stringify(store, null, 2));
console.log("Seeded demo profile, posts, and highlights.");
