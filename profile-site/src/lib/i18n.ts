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
  enableLikes: string;
  enableComments: string;
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
  publishLede: "أضف صوراً مع وصف كما في إنستغرام. تظهر فوراً في صفحتك العامة.",
  image: "الصورة",
  caption: "الوصف",
  publish: "نشر",
  publishing: "جارٍ النشر...",
  chooseImage: "اختر صورة للمنشور",
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
  enableLikes: "إظهار القلوب والسماح بالإعجاب",
  enableComments: "إظهار التعليقات والسماح بالكتابة",
  privacySection: "التحكم بالظهور والتفاعل",
  privacyLede: "تحكّم بما يظهر للزوار: التوثيق، المتابعون، القلوب، والتعليقات.",
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
  publishLede: "Add photos with captions like Instagram. They appear instantly on your public page.",
  image: "Image",
  caption: "Caption",
  publish: "Publish",
  publishing: "Publishing...",
  chooseImage: "Choose an image for the post",
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
  enableLikes: "Show hearts and allow likes",
  enableComments: "Show comments and allow writing",
  privacySection: "Visibility & interaction",
  privacyLede: "Control what visitors see: verification, followers, hearts, and comments.",
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
