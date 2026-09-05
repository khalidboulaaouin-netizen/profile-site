export const LOCALES = [
  { code: "ar", name: "العربية", nativeName: "العربية", dir: "rtl" },
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export type Dictionary = {
  posts: string;
  followers: string;
  following: string;
  highlights: string;
  followGoogle: string;
  unfollow: string;
  followerSignOut: string;
  loading: string;
  enableGoogleFirst: string;
  emptyPosts: string;
  noCaption: string;
  close: string;
  postAlt: string;
  footerNote: string;
  ownerLogin: string;
  ownerLoginLede: string;
  email: string;
  password: string;
  loginSubmit: string;
  loggingIn: string;
  loginError: string;
  overview: string;
  settings: string;
  viewPage: string;
  dashboard: string;
  dashboardLede: string;
  signOut: string;
  publishPost: string;
  publishLede: string;
  image: string;
  caption: string;
  publish: string;
  publishing: string;
  chooseImage: string;
  chooseMedia: string;
  mediaFile: string;
  mediaHelp: string;
  reelBadge: string;
  hidePost: string;
  showPost: string;
  hiddenBadge: string;
  currentPosts: string;
  noPostsYet: string;
  delete: string;
  profileSection: string;
  profileLede: string;
  displayName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  socialLinksHelp: string;
  followOnSocial: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  avatar: string;
  cover: string;
  saveProfile: string;
  siteSettings: string;
  siteSettingsLede: string;
  brandName: string;
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string;
  allowFollow: string;
  language: string;
  languageHelp: string;
  saveSeo: string;
  highlightsSection: string;
  highlightTitle: string;
  highlightCover: string;
  saveHighlights: string;
  saveStoryToHighlight: string;
  saveToExistingHighlight: string;
  createNewHighlight: string;
  newHighlightTitle: string;
  storySavedToHighlight: string;
  highlightItemsCount: string;
  chooseHighlight: string;
  followersTitle: string;
  followersLede: string;
  noFollowers: string;
  since: string;
  savedProfile: string;
  savedSettings: string;
  savedHighlights: string;
  saveFailed: string;
  loadingSettings: string;
  uploadFailed: string;
  verified: string;
  hideFollowers: string;
  hideFollowing: string;
  enableLikes: string;
  enableComments: string;
  showReadReceipts: string;
  showReadReceiptsHelp: string;
  privacySection: string;
  privacyLede: string;
  like: string;
  unlike: string;
  likesCount: string;
  comments: string;
  addComment: string;
  commentName: string;
  commentText: string;
  sendComment: string;
  noComments: string;
  verifiedLabel: string;
  stories: string;
  yourStory: string;
  viewStory: string;
  storyLoginRequired: string;
  storyLoginCta: string;
  noStories: string;
  storyViewers: string;
  publishStory: string;
  publishStoryLede: string;
  activeStories: string;
  noStoryViewers: string;
  expires: string;
  deleteCommentConfirm: string;
  block: string;
  unblock: string;
  blockConfirm: string;
  blockedUsers: string;
  blockedUsersLede: string;
  noBlockedUsers: string;
  blockedPageTitle: string;
  blockedPageMessage: string;
  youAreBlocked: string;
  appearanceSection: string;
  appearanceLede: string;
  themePresets: string;
  accentColor: string;
  backgroundColor: string;
  decorationStyle: string;
  decorationSoft: string;
  decorationMesh: string;
  decorationDots: string;
  decorationWaves: string;
  decorationNone: string;
  saveAppearance: string;
  presetTeal: string;
  presetOcean: string;
  presetForest: string;
  presetSunset: string;
  presetRose: string;
  presetInk: string;
  messages: string;
  inbox: string;
  inboxLede: string;
  noMessages: string;
  sendMessage: string;
  writeMessage: string;
  messageLoginRequired: string;
  messageLoginCta: string;
  reply: string;
  sendReply: string;
  conversationWith: string;
  unread: string;
  openChat: string;
  yourMessages: string;
  messageSent: string;
  messageFailed: string;
  messageSeen: string;
  backToInbox: string;
  recordVoice: string;
  stopRecording: string;
  recording: string;
  voiceUnsupported: string;
  voicePermissionDenied: string;
  voiceMessage: string;
  sendingVoice: string;
};

const ar: Dictionary = {
  posts: "المنشورات",
  followers: "متابعون",
  following: "يتابع",
  highlights: "أبرز اللحظات",
  followGoogle: "متابعة عبر Google",
  unfollow: "إلغاء المتابعة",
  followerSignOut: "تسجيل خروج المتابع",
  loading: "جارٍ...",
  enableGoogleFirst: "فعّل تسجيل Google أولاً من إعدادات المالك.",
  emptyPosts: "لا منشورات بعد. سيظهر المحتوى هنا عندما ينشر المالك أول صورة.",
  noCaption: "بدون وصف",
  close: "إغلاق",
  postAlt: "منشور",
  footerNote: "المتابعة عبر Google فقط · التحكم الكامل للمالك فقط · جاهز للفهرسة في Google",
  ownerLogin: "دخول المالك",
  ownerLoginLede:
    "هذه الصفحة لك وحدك. الزوار لا يسجّلون حساباً هنا — يتابعون عبر Google فقط من الصفحة العامة.",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  loginSubmit: "دخول لوحة التحكم",
  loggingIn: "جارٍ الدخول...",
  loginError: "البريد أو كلمة المرور غير صحيحة.",
  overview: "نظرة عامة",
  settings: "الإعدادات",
  viewPage: "عرض الصفحة",
  dashboard: "لوحة التحكم",
  dashboardLede: "أنت الوحيد الذي يملك صلاحية النشر والتعديل هنا.",
  signOut: "تسجيل الخروج",
  publishPost: "نشر محتوى جديد",
  publishLede: "أضف صوراً أو فيديوهات ريلز مع وصف. تظهر فوراً في صفحتك العامة.",
  image: "الصورة",
  caption: "الوصف",
  publish: "نشر",
  publishing: "جارٍ النشر...",
  chooseImage: "اختر صورة للمنشور",
  chooseMedia: "اختر صورة أو فيديو",
  mediaFile: "صورة أو فيديو (ريلز)",
  mediaHelp: "الصور حتى 8MB. الفيديو (mp4/webm/mov) حتى 80MB — مثالي للريلز القصيرة.",
  reelBadge: "ريلز",
  hidePost: "إخفاء",
  showPost: "إظهار",
  hiddenBadge: "مخفي",
  currentPosts: "المنشورات الحالية",
  noPostsYet: "لا منشورات بعد.",
  delete: "حذف",
  profileSection: "الملف الشخصي",
  profileLede: "الاسم، البايو، الصورة، والغلاف — كما في إنستغرام.",
  displayName: "الاسم الظاهر",
  username: "اسم المستخدم",
  bio: "النبذة",
  location: "الموقع",
  website: "الموقع الإلكتروني",
  instagramUrl: "رابط إنستغرام",
  facebookUrl: "رابط فيسبوك",
  tiktokUrl: "رابط تيك توك",
  socialLinksHelp:
    "أضف روابط حساباتك ليتمكن الزوار من متابعتك هناك حتى بدون Google. متابعة الموقع والرسائل والستوري تبقى عبر Google.",
  followOnSocial: "تابعني على",
  instagram: "إنستغرام",
  facebook: "فيسبوك",
  tiktok: "تيك توك",
  avatar: "صورة الملف",
  cover: "صورة الغلاف",
  saveProfile: "حفظ الملف الشخصي",
  siteSettings: "إعدادات الموقع وGoogle",
  siteSettingsLede:
    "هذه الحقول تساعد Google على فهرسة صفحتك. بعد النشر على نطاقك، أضف الموقع في Google Search Console.",
  brandName: "اسم العلامة",
  siteTitle: "عنوان الصفحة (SEO)",
  siteDescription: "وصف Google",
  seoKeywords: "كلمات مفتاحية (مفصولة بفاصلة)",
  allowFollow: "السماح بالمتابعة عبر Google",
  language: "لغة الموقع",
  languageHelp: "اختر لغة واجهة الصفحة ولوحة التحكم. اتجاه الكتابة يتغيّر تلقائياً.",
  saveSeo: "حفظ إعدادات الموقع",
  highlightsSection: "أبرز اللحظات",
  highlightTitle: "العنوان",
  highlightCover: "صورة الغلاف",
  saveHighlights: "حفظ أبرز اللحظات",
  saveStoryToHighlight: "حفظ في أبرز اللحظات",
  saveToExistingHighlight: "أضف إلى مجموعة موجودة",
  createNewHighlight: "أنشئ مجموعة جديدة",
  newHighlightTitle: "اسم المجموعة الجديدة",
  storySavedToHighlight: "تم حفظ الستوري تحت البايو في أبرز اللحظات.",
  highlightItemsCount: "ستوري محفوظة",
  chooseHighlight: "اختر مجموعة",
  followersTitle: "المتابعون عبر Google",
  followersLede: "هؤلاء زوّار ضغطوا «متابعة عبر Google» فقط. لا يوجد تسجيل حساب مستقل لهم.",
  noFollowers: "لا متابعين بعد. فعّل Google OAuth ثم شارك رابط صفحتك.",
  since: "منذ",
  savedProfile: "تم حفظ الملف الشخصي.",
  savedSettings: "تم حفظ إعدادات الموقع.",
  savedHighlights: "تم حفظ أبرز اللحظات.",
  saveFailed: "تعذّر الحفظ.",
  loadingSettings: "تحميل الإعدادات...",
  uploadFailed: "فشل الرفع",
  verified: "توثيق الصفحة بالعلامة الزرقاء",
  hideFollowers: "إخفاء عدد المتابعين عن الزوار",
  hideFollowing: "إخفاء عدد «أتابع» عن الزوار",
  enableLikes: "إظهار القلوب والسماح بالإعجاب",
  enableComments: "إظهار التعليقات والسماح بالكتابة",
  showReadReceipts: "إظهار «تمت القراءة» للمتابعين في الرسائل",
  showReadReceiptsHelp:
    "إذا أوقفتها، تُسجَّل قراءة رسائلك داخلياً لصندوق الوارد دون أن يرى المتابع أنك قرأت الرسالة.",
  privacySection: "التحكم بالظهور والتفاعل",
  privacyLede:
    "أخفِ ما تريد: المتابعون، أتابع، القلوب، والتعليقات. ألغِ تحديد القلوب أو التعليقات لإخفائها.",
  like: "إعجاب",
  unlike: "إزالة الإعجاب",
  likesCount: "إعجاب",
  comments: "التعليقات",
  addComment: "أضف تعليقاً",
  commentName: "اسمك",
  commentText: "اكتب تعليقاً...",
  sendComment: "إرسال",
  noComments: "لا تعليقات بعد.",
  verifiedLabel: "حساب موثّق",
  stories: "الستوري",
  yourStory: "الستوري",
  viewStory: "عرض الستوري",
  storyLoginRequired: "فعّل Google أولاً، ثم سجّل الدخول عبر Google لمشاهدة الستوري.",
  storyLoginCta: "تسجيل الدخول عبر Google للمشاهدة",
  noStories: "لا ستوري نشطة حالياً.",
  storyViewers: "المشاهدون",
  publishStory: "نشر ستوري",
  publishStoryLede:
    "الستوري تختفي بعد 24 ساعة من الحلقة أعلى الصفحة. لحفظها للمتابعين تحت البايو لأشهر، استخدم «حفظ في أبرز اللحظات».",
  activeStories: "الستوري النشطة",
  noStoryViewers: "لا مشاهدين بعد.",
  expires: "تنتهي",
  deleteCommentConfirm: "هل تريد حذف هذا التعليق؟",
  block: "حظر",
  unblock: "إلغاء الحظر",
  blockConfirm: "هل تريد حظر هذا الشخص؟ لن يتمكن من رؤية صفحتك أثناء تسجيل دخوله عبر Google.",
  blockedUsers: "المحظورون",
  blockedUsersLede: "هؤلاء لا يمكنهم رؤية الصفحة أو المتابعة أو مشاهدة الستوري أثناء تسجيل دخولهم عبر Google.",
  noBlockedUsers: "لا يوجد أحد في قائمة الحظر.",
  blockedPageTitle: "لا يمكنك عرض هذه الصفحة",
  blockedPageMessage: "تم حظرك من الوصول إلى هذا المحتوى.",
  youAreBlocked: "تم حظرك من هذه الصفحة.",
  appearanceSection: "الألوان والزخرفة",
  appearanceLede: "اختر لوناً أساسياً وخلفية ونمط زخرفة للصفحة العامة. تظهر التغييرات فوراً بعد الحفظ.",
  themePresets: "قوالب جاهزة",
  accentColor: "اللون الأساسي",
  backgroundColor: "لون الخلفية",
  decorationStyle: "نمط الزخرفة",
  decorationSoft: "توهج ناعم",
  decorationMesh: "شبكة ضوئية",
  decorationDots: "نقاط",
  decorationWaves: "أمواج",
  decorationNone: "بدون زخرفة",
  saveAppearance: "حفظ المظهر",
  presetTeal: "فيروزي",
  presetOcean: "محيط",
  presetForest: "غابة",
  presetSunset: "غروب",
  presetRose: "وردي",
  presetInk: "حبر",
  messages: "الرسائل",
  inbox: "صندوق الوارد",
  inboxLede: "رسائل المتابعين عبر Google. يمكنك الرد من هنا.",
  noMessages: "لا رسائل بعد.",
  sendMessage: "إرسال",
  writeMessage: "اكتب رسالة خاصة...",
  messageLoginRequired: "سجّل الدخول عبر Google لإرسال رسالة خاصة.",
  messageLoginCta: "تسجيل الدخول عبر Google للمراسلة",
  reply: "رد",
  sendReply: "إرسال الرد",
  conversationWith: "محادثة مع",
  unread: "غير مقروء",
  openChat: "رسالة",
  yourMessages: "رسائلك الخاصة",
  messageSent: "تم إرسال الرسالة.",
  messageFailed: "تعذّر إرسال الرسالة.",
  messageSeen: "تمت القراءة",
  backToInbox: "العودة للوارد",
  recordVoice: "تسجيل صوت",
  stopRecording: "إيقاف وإرسال",
  recording: "جارٍ التسجيل...",
  voiceUnsupported: "المتصفح لا يدعم التسجيل الصوتي.",
  voicePermissionDenied: "يلزم السماح بالمايكروفون لإرسال صوت.",
  voiceMessage: "رسالة صوتية",
  sendingVoice: "جارٍ إرسال الصوت...",
};

const en: Dictionary = {
  posts: "Posts",
  followers: "Followers",
  following: "Following",
  highlights: "Highlights",
  followGoogle: "Follow with Google",
  unfollow: "Unfollow",
  followerSignOut: "Follower sign out",
  loading: "Loading...",
  enableGoogleFirst: "Enable Google sign-in first from the owner settings.",
  emptyPosts: "No posts yet. Content will appear here when the owner publishes the first photo.",
  noCaption: "No caption",
  close: "Close",
  postAlt: "Post",
  footerNote: "Follow with Google only · Owner-only control · Ready for Google indexing",
  ownerLogin: "Owner login",
  ownerLoginLede:
    "This page is for you only. Visitors do not create accounts here — they follow with Google from the public page.",
  email: "Email",
  password: "Password",
  loginSubmit: "Enter dashboard",
  loggingIn: "Signing in...",
  loginError: "Incorrect email or password.",
  overview: "Overview",
  settings: "Settings",
  viewPage: "View page",
  dashboard: "Dashboard",
  dashboardLede: "You are the only one who can publish and edit here.",
  signOut: "Sign out",
  publishPost: "Publish new content",
  publishLede: "Add photos or reel videos with captions. They appear instantly on your public page.",
  image: "Image",
  caption: "Caption",
  publish: "Publish",
  publishing: "Publishing...",
  chooseImage: "Choose an image for the post",
  chooseMedia: "Choose a photo or video",
  mediaFile: "Photo or reel video",
  mediaHelp: "Images up to 8MB. Video (mp4/webm/mov) up to 80MB — best for short reels.",
  reelBadge: "Reel",
  hidePost: "Hide",
  showPost: "Unhide",
  hiddenBadge: "Hidden",
  currentPosts: "Current posts",
  noPostsYet: "No posts yet.",
  delete: "Delete",
  profileSection: "Profile",
  profileLede: "Name, bio, photo, and cover — like Instagram.",
  displayName: "Display name",
  username: "Username",
  bio: "Bio",
  location: "Location",
  website: "Website",
  instagramUrl: "Instagram URL",
  facebookUrl: "Facebook URL",
  tiktokUrl: "TikTok URL",
  socialLinksHelp:
    "Add your social profile links so visitors can follow you there without Google. Site follow, messages, and stories still use Google.",
  followOnSocial: "Follow me on",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  avatar: "Profile photo",
  cover: "Cover photo",
  saveProfile: "Save profile",
  siteSettings: "Site & Google settings",
  siteSettingsLede:
    "These fields help Google index your page. After publishing on your domain, add the site in Google Search Console.",
  brandName: "Brand name",
  siteTitle: "Page title (SEO)",
  siteDescription: "Google description",
  seoKeywords: "Keywords (comma-separated)",
  allowFollow: "Allow following with Google",
  language: "Site language",
  languageHelp: "Choose the language for the public page and admin panel. Text direction updates automatically.",
  saveSeo: "Save site settings",
  highlightsSection: "Highlights",
  highlightTitle: "Title",
  highlightCover: "Cover image",
  saveHighlights: "Save highlights",
  saveStoryToHighlight: "Save to highlights",
  saveToExistingHighlight: "Add to an existing set",
  createNewHighlight: "Create a new set",
  newHighlightTitle: "New highlight title",
  storySavedToHighlight: "Story saved under the bio in highlights.",
  highlightItemsCount: "saved stories",
  chooseHighlight: "Choose a highlight",
  followersTitle: "Google followers",
  followersLede: "These visitors only pressed “Follow with Google”. They have no separate account.",
  noFollowers: "No followers yet. Enable Google OAuth, then share your page link.",
  since: "Since",
  savedProfile: "Profile saved.",
  savedSettings: "Site settings saved.",
  savedHighlights: "Highlights saved.",
  saveFailed: "Could not save.",
  loadingSettings: "Loading settings...",
  uploadFailed: "Upload failed",
  verified: "Verify page with blue badge",
  hideFollowers: "Hide follower count from visitors",
  hideFollowing: "Hide “Following” count from visitors",
  enableLikes: "Show hearts and allow likes",
  enableComments: "Show comments and allow writing",
  showReadReceipts: "Show “seen” read receipts to followers in chat",
  showReadReceiptsHelp:
    "When off, your inbox still marks messages as read, but followers won’t see that you read them.",
  privacySection: "Visibility & interaction",
  privacyLede:
    "Hide what you want: followers, following, hearts, and comments. Uncheck hearts or comments to hide them.",
  like: "Like",
  unlike: "Unlike",
  likesCount: "likes",
  comments: "Comments",
  addComment: "Add a comment",
  commentName: "Your name",
  commentText: "Write a comment...",
  sendComment: "Send",
  noComments: "No comments yet.",
  verifiedLabel: "Verified account",
  stories: "Stories",
  yourStory: "Story",
  viewStory: "View story",
  storyLoginRequired: "Enable Google first, then sign in with Google to view the story.",
  storyLoginCta: "Sign in with Google to view",
  noStories: "No active stories right now.",
  storyViewers: "Viewers",
  publishStory: "Publish story",
  publishStoryLede:
    "Stories disappear from the top ring after 24 hours. To keep them under the bio for months, use “Save to highlights”.",
  activeStories: "Active stories",
  noStoryViewers: "No viewers yet.",
  expires: "Expires",
  deleteCommentConfirm: "Delete this comment?",
  block: "Block",
  unblock: "Unblock",
  blockConfirm: "Block this person? They won’t be able to view your page while signed in with Google.",
  blockedUsers: "Blocked",
  blockedUsersLede: "These people can’t view the page, follow, or open stories while signed in with Google.",
  noBlockedUsers: "No blocked users yet.",
  blockedPageTitle: "You can’t view this page",
  blockedPageMessage: "You have been blocked from accessing this content.",
  youAreBlocked: "You are blocked from this page.",
  appearanceSection: "Colors & decoration",
  appearanceLede: "Choose an accent color, background, and decoration for the public page. Changes apply right after saving.",
  themePresets: "Ready-made themes",
  accentColor: "Accent color",
  backgroundColor: "Background color",
  decorationStyle: "Decoration style",
  decorationSoft: "Soft glow",
  decorationMesh: "Light mesh",
  decorationDots: "Dots",
  decorationWaves: "Waves",
  decorationNone: "No decoration",
  saveAppearance: "Save appearance",
  presetTeal: "Teal",
  presetOcean: "Ocean",
  presetForest: "Forest",
  presetSunset: "Sunset",
  presetRose: "Rose",
  presetInk: "Ink",
  messages: "Messages",
  inbox: "Inbox",
  inboxLede: "Messages from Google followers. You can reply here.",
  noMessages: "No messages yet.",
  sendMessage: "Send",
  writeMessage: "Write a private message...",
  messageLoginRequired: "Sign in with Google to send a private message.",
  messageLoginCta: "Sign in with Google to message",
  reply: "Reply",
  sendReply: "Send reply",
  conversationWith: "Conversation with",
  unread: "Unread",
  openChat: "Message",
  yourMessages: "Your private messages",
  messageSent: "Message sent.",
  messageFailed: "Could not send the message.",
  messageSeen: "Seen",
  backToInbox: "Back to inbox",
  recordVoice: "Record voice",
  stopRecording: "Stop & send",
  recording: "Recording...",
  voiceUnsupported: "This browser does not support voice recording.",
  voicePermissionDenied: "Microphone permission is required to send voice.",
  voiceMessage: "Voice message",
  sendingVoice: "Sending voice...",
};

const fr: Dictionary = {
  ...en,
  posts: "Publications",
  followers: "Abonnés",
  following: "Abonnements",
  highlights: "À la une",
  followGoogle: "Suivre avec Google",
  unfollow: "Ne plus suivre",
  followerSignOut: "Déconnexion abonné",
  loading: "Chargement...",
  enableGoogleFirst: "Activez d’abord la connexion Google dans les paramètres.",
  emptyPosts: "Aucune publication pour le moment.",
  noCaption: "Sans légende",
  close: "Fermer",
  postAlt: "Publication",
  footerNote: "Suivi via Google uniquement · Contrôle réservé au propriétaire",
  ownerLogin: "Connexion propriétaire",
  ownerLoginLede:
    "Cette page est réservée au propriétaire. Les visiteurs suivent uniquement via Google.",
  email: "E-mail",
  password: "Mot de passe",
  loginSubmit: "Entrer dans le tableau de bord",
  loggingIn: "Connexion...",
  loginError: "E-mail ou mot de passe incorrect.",
  overview: "Aperçu",
  settings: "Paramètres",
  viewPage: "Voir la page",
  dashboard: "Tableau de bord",
  dashboardLede: "Vous seul pouvez publier et modifier ici.",
  signOut: "Déconnexion",
  publishPost: "Publier du contenu",
  publishLede: "Ajoutez des photos avec une légende. Elles apparaissent immédiatement.",
  image: "Image",
  caption: "Légende",
  publish: "Publier",
  publishing: "Publication...",
  chooseImage: "Choisissez une image",
  currentPosts: "Publications actuelles",
  noPostsYet: "Aucune publication.",
  delete: "Supprimer",
  profileSection: "Profil",
  profileLede: "Nom, bio, photo et couverture.",
  displayName: "Nom affiché",
  username: "Identifiant",
  bio: "Bio",
  location: "Lieu",
  website: "Site web",
  avatar: "Photo de profil",
  cover: "Photo de couverture",
  saveProfile: "Enregistrer le profil",
  siteSettings: "Paramètres du site et Google",
  siteSettingsLede: "Ces champs aident Google à indexer votre page.",
  brandName: "Nom de marque",
  siteTitle: "Titre de la page (SEO)",
  siteDescription: "Description Google",
  seoKeywords: "Mots-clés (séparés par des virgules)",
  allowFollow: "Autoriser le suivi via Google",
  language: "Langue du site",
  languageHelp: "Choisissez la langue de l’interface. Le sens du texte change automatiquement.",
  saveSeo: "Enregistrer les paramètres",
  highlightsSection: "À la une",
  highlightTitle: "Titre",
  highlightCover: "Image de couverture",
  saveHighlights: "Enregistrer à la une",
  followersTitle: "Abonnés Google",
  followersLede: "Visiteurs ayant suivi via Google uniquement.",
  noFollowers: "Aucun abonné pour le moment.",
  since: "Depuis",
  savedProfile: "Profil enregistré.",
  savedSettings: "Paramètres enregistrés.",
  savedHighlights: "À la une enregistrée.",
  saveFailed: "Échec de l’enregistrement.",
  loadingSettings: "Chargement des paramètres...",
  uploadFailed: "Échec du téléversement",
};

const es: Dictionary = {
  ...en,
  posts: "Publicaciones",
  followers: "Seguidores",
  following: "Siguiendo",
  highlights: "Destacados",
  followGoogle: "Seguir con Google",
  unfollow: "Dejar de seguir",
  followerSignOut: "Cerrar sesión del seguidor",
  loading: "Cargando...",
  enableGoogleFirst: "Activa primero el inicio con Google en la configuración.",
  emptyPosts: "Aún no hay publicaciones.",
  noCaption: "Sin descripción",
  close: "Cerrar",
  postAlt: "Publicación",
  footerNote: "Seguir solo con Google · Control exclusivo del propietario",
  ownerLogin: "Acceso del propietario",
  ownerLoginLede: "Esta página es solo para ti. Los visitantes siguen solo con Google.",
  email: "Correo electrónico",
  password: "Contraseña",
  loginSubmit: "Entrar al panel",
  loggingIn: "Entrando...",
  loginError: "Correo o contraseña incorrectos.",
  overview: "Resumen",
  settings: "Ajustes",
  viewPage: "Ver página",
  dashboard: "Panel de control",
  dashboardLede: "Solo tú puedes publicar y editar aquí.",
  signOut: "Cerrar sesión",
  publishPost: "Publicar contenido",
  publishLede: "Añade fotos con descripción. Aparecen al instante.",
  image: "Imagen",
  caption: "Descripción",
  publish: "Publicar",
  publishing: "Publicando...",
  chooseImage: "Elige una imagen",
  currentPosts: "Publicaciones actuales",
  noPostsYet: "Aún no hay publicaciones.",
  delete: "Eliminar",
  profileSection: "Perfil",
  profileLede: "Nombre, bio, foto y portada.",
  displayName: "Nombre visible",
  username: "Usuario",
  bio: "Bio",
  location: "Ubicación",
  website: "Sitio web",
  avatar: "Foto de perfil",
  cover: "Foto de portada",
  saveProfile: "Guardar perfil",
  siteSettings: "Ajustes del sitio y Google",
  siteSettingsLede: "Estos campos ayudan a Google a indexar tu página.",
  brandName: "Marca",
  siteTitle: "Título de la página (SEO)",
  siteDescription: "Descripción de Google",
  seoKeywords: "Palabras clave (separadas por coma)",
  allowFollow: "Permitir seguir con Google",
  language: "Idioma del sitio",
  languageHelp: "Elige el idioma de la interfaz. La dirección del texto cambia automáticamente.",
  saveSeo: "Guardar ajustes",
  highlightsSection: "Destacados",
  highlightTitle: "Título",
  highlightCover: "Imagen de portada",
  saveHighlights: "Guardar destacados",
  followersTitle: "Seguidores de Google",
  followersLede: "Visitantes que solo pulsarón “Seguir con Google”.",
  noFollowers: "Aún no hay seguidores.",
  since: "Desde",
  savedProfile: "Perfil guardado.",
  savedSettings: "Ajustes guardados.",
  savedHighlights: "Destacados guardados.",
  saveFailed: "No se pudo guardar.",
  loadingSettings: "Cargando ajustes...",
  uploadFailed: "Error al subir",
};

const de: Dictionary = {
  ...en,
  posts: "Beiträge",
  followers: "Follower",
  following: "Folgt",
  highlights: "Highlights",
  followGoogle: "Mit Google folgen",
  unfollow: "Entfolgen",
  followerSignOut: "Follower abmelden",
  loading: "Lädt...",
  enableGoogleFirst: "Aktiviere zuerst Google-Login in den Einstellungen.",
  emptyPosts: "Noch keine Beiträge.",
  noCaption: "Ohne Beschreibung",
  close: "Schließen",
  postAlt: "Beitrag",
  footerNote: "Nur mit Google folgen · Nur Eigentümer-Steuerung",
  ownerLogin: "Eigentümer-Login",
  ownerLoginLede: "Diese Seite ist nur für dich. Besucher folgen nur mit Google.",
  email: "E-Mail",
  password: "Passwort",
  loginSubmit: "Zum Dashboard",
  loggingIn: "Anmeldung...",
  loginError: "E-Mail oder Passwort falsch.",
  overview: "Übersicht",
  settings: "Einstellungen",
  viewPage: "Seite ansehen",
  dashboard: "Dashboard",
  dashboardLede: "Nur du kannst hier veröffentlichen und bearbeiten.",
  signOut: "Abmelden",
  publishPost: "Neuen Inhalt veröffentlichen",
  publishLede: "Füge Fotos mit Beschreibung hinzu. Sie erscheinen sofort.",
  image: "Bild",
  caption: "Beschreibung",
  publish: "Veröffentlichen",
  publishing: "Wird veröffentlicht...",
  chooseImage: "Bild auswählen",
  currentPosts: "Aktuelle Beiträge",
  noPostsYet: "Noch keine Beiträge.",
  delete: "Löschen",
  profileSection: "Profil",
  profileLede: "Name, Bio, Foto und Cover.",
  displayName: "Anzeigename",
  username: "Benutzername",
  bio: "Bio",
  location: "Standort",
  website: "Website",
  avatar: "Profilbild",
  cover: "Titelbild",
  saveProfile: "Profil speichern",
  siteSettings: "Website- & Google-Einstellungen",
  siteSettingsLede: "Diese Felder helfen Google bei der Indexierung.",
  brandName: "Markenname",
  siteTitle: "Seitentitel (SEO)",
  siteDescription: "Google-Beschreibung",
  seoKeywords: "Keywords (kommagetrennt)",
  allowFollow: "Folgen mit Google erlauben",
  language: "Website-Sprache",
  languageHelp: "Wähle die Sprache der Oberfläche. Die Schreibrichtung wird automatisch angepasst.",
  saveSeo: "Einstellungen speichern",
  highlightsSection: "Highlights",
  highlightTitle: "Titel",
  highlightCover: "Cover-Bild",
  saveHighlights: "Highlights speichern",
  followersTitle: "Google-Follower",
  followersLede: "Besucher, die nur mit Google gefolgt sind.",
  noFollowers: "Noch keine Follower.",
  since: "Seit",
  savedProfile: "Profil gespeichert.",
  savedSettings: "Einstellungen gespeichert.",
  savedHighlights: "Highlights gespeichert.",
  saveFailed: "Speichern fehlgeschlagen.",
  loadingSettings: "Einstellungen werden geladen...",
  uploadFailed: "Upload fehlgeschlagen",
};

const tr: Dictionary = {
  ...en,
  posts: "Gönderiler",
  followers: "Takipçiler",
  following: "Takip",
  highlights: "Öne çıkanlar",
  followGoogle: "Google ile takip et",
  unfollow: "Takibi bırak",
  followerSignOut: "Takipçi çıkışı",
  loading: "Yükleniyor...",
  enableGoogleFirst: "Önce ayarlardan Google girişini etkinleştirin.",
  emptyPosts: "Henüz gönderi yok.",
  noCaption: "Açıklama yok",
  close: "Kapat",
  postAlt: "Gönderi",
  footerNote: "Yalnızca Google ile takip · Sadece sahip kontrolü",
  ownerLogin: "Sahip girişi",
  ownerLoginLede: "Bu sayfa yalnızca size aittir. Ziyaretçiler sadece Google ile takip eder.",
  email: "E-posta",
  password: "Şifre",
  loginSubmit: "Panele gir",
  loggingIn: "Giriş yapılıyor...",
  loginError: "E-posta veya şifre hatalı.",
  overview: "Genel bakış",
  settings: "Ayarlar",
  viewPage: "Sayfayı gör",
  dashboard: "Kontrol paneli",
  dashboardLede: "Burada yalnızca siz yayınlayıp düzenleyebilirsiniz.",
  signOut: "Çıkış yap",
  publishPost: "Yeni içerik yayınla",
  publishLede: "Açıklamalı fotoğraflar ekleyin. Anında görünürler.",
  image: "Görsel",
  caption: "Açıklama",
  publish: "Yayınla",
  publishing: "Yayınlanıyor...",
  chooseImage: "Bir görsel seçin",
  currentPosts: "Mevcut gönderiler",
  noPostsYet: "Henüz gönderi yok.",
  delete: "Sil",
  profileSection: "Profil",
  profileLede: "İsim, biyografi, fotoğraf ve kapak.",
  displayName: "Görünen ad",
  username: "Kullanıcı adı",
  bio: "Biyografi",
  location: "Konum",
  website: "Web sitesi",
  avatar: "Profil fotoğrafı",
  cover: "Kapak fotoğrafı",
  saveProfile: "Profili kaydet",
  siteSettings: "Site ve Google ayarları",
  siteSettingsLede: "Bu alanlar Google’ın sayfanızı dizine eklemesine yardımcı olur.",
  brandName: "Marka adı",
  siteTitle: "Sayfa başlığı (SEO)",
  siteDescription: "Google açıklaması",
  seoKeywords: "Anahtar kelimeler (virgülle)",
  allowFollow: "Google ile takibe izin ver",
  language: "Site dili",
  languageHelp: "Arayüz dilini seçin. Yazı yönü otomatik değişir.",
  saveSeo: "Ayarları kaydet",
  highlightsSection: "Öne çıkanlar",
  highlightTitle: "Başlık",
  highlightCover: "Kapak görseli",
  saveHighlights: "Öne çıkanları kaydet",
  followersTitle: "Google takipçileri",
  followersLede: "Sadece Google ile takip eden ziyaretçiler.",
  noFollowers: "Henüz takipçi yok.",
  since: "Başlangıç",
  savedProfile: "Profil kaydedildi.",
  savedSettings: "Ayarlar kaydedildi.",
  savedHighlights: "Öne çıkanlar kaydedildi.",
  saveFailed: "Kaydedilemedi.",
  loadingSettings: "Ayarlar yükleniyor...",
  uploadFailed: "Yükleme başarısız",
};

const dictionaries: Record<LocaleCode, Dictionary> = {
  ar,
  en,
  fr,
  es,
  de,
  tr,
  pt: {
    ...en,
    posts: "Publicações",
    followers: "Seguidores",
    following: "A seguir",
    highlights: "Destaques",
    followGoogle: "Seguir com Google",
    unfollow: "Deixar de seguir",
    language: "Idioma do site",
    languageHelp: "Escolha o idioma da interface. A direção do texto muda automaticamente.",
    settings: "Definições",
    overview: "Visão geral",
    dashboard: "Painel",
    saveSeo: "Guardar definições",
  },
  id: {
    ...en,
    posts: "Postingan",
    followers: "Pengikut",
    following: "Mengikuti",
    highlights: "Sorotan",
    followGoogle: "Ikuti dengan Google",
    unfollow: "Berhenti mengikuti",
    language: "Bahasa situs",
    languageHelp: "Pilih bahasa antarmuka. Arah teks berubah otomatis.",
    settings: "Pengaturan",
    overview: "Ringkasan",
    dashboard: "Dasbor",
    saveSeo: "Simpan pengaturan",
  },
  hi: {
    ...en,
    posts: "पोस्ट",
    followers: "फ़ॉलोअर्स",
    following: "फ़ॉलोइंग",
    highlights: "हाइलाइट्स",
    followGoogle: "Google से फ़ॉलो करें",
    unfollow: "अनफ़ॉलो",
    language: "साइट भाषा",
    languageHelp: "इंटरफ़ेस की भाषा चुनें। लेखन दिशा अपने आप बदलती है।",
    settings: "सेटिंग्स",
    overview: "अवलोकन",
    dashboard: "डैशबोर्ड",
    saveSeo: "सेटिंग्स सहेजें",
  },
  ur: {
    ...ar,
    posts: "پوسٹس",
    followers: "فالوورز",
    following: "فالو کر رہا ہے",
    highlights: "نمایاں",
    followGoogle: "Google سے فالو کریں",
    unfollow: "ان فالو",
    language: "سائٹ کی زبان",
    languageHelp: "انٹرفیس کی زبان منتخب کریں۔ لکھائی کی سمت خود بخود بدل جاتی ہے۔",
    settings: "ترتیبات",
    overview: "جائزہ",
    dashboard: "ڈیش بورڈ",
    saveSeo: "ترتیبات محفوظ کریں",
  },
};

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}

export function normalizeLocale(value?: string | null): LocaleCode {
  if (value && isLocaleCode(value)) return value;
  return "ar";
}

export function getLocaleMeta(code?: string | null) {
  const locale = normalizeLocale(code);
  return LOCALES.find((l) => l.code === locale)!;
}

export function getDictionary(code?: string | null): Dictionary {
  return dictionaries[normalizeLocale(code)];
}

export function getOgLocale(code?: string | null): string {
  const locale = normalizeLocale(code);
  const map: Record<LocaleCode, string> = {
    ar: "ar_AR",
    en: "en_US",
    fr: "fr_FR",
    es: "es_ES",
    de: "de_DE",
    tr: "tr_TR",
    pt: "pt_PT",
    id: "id_ID",
    hi: "hi_IN",
    ur: "ur_PK",
  };
  return map[locale];
}
