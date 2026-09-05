# حضوري — صفحة شخصية بأسلوب إنستغرام

موقع بروفايل عربي احترافي:

- أنت وحدك تدخل بالإيميل وكلمة المرور وتتحكم بكل شيء
- الزوار يتابعون عبر **Google فقط** بدون إنشاء حساب في الموقع
- جاهز للفهرسة في Google (SEO + sitemap + robots + بيانات منظمة)

## التشغيل محلياً

```bash
cd profile-site
cp .env.example .env.local
npm install
npm run seed
npm run dev
```

افتح: [http://localhost:3000](http://localhost:3000)

### دخول المالك

- الرابط: `/login`
- الإيميل فقط: `KhalidBoulaaouin@gmail.com` (مثبت في صفحة الدخول والتحقق)
- كلمة المرور: تضعها أنت لاحقاً في `ADMIN_PASSWORD` داخل `.env.local` (أو متغيرات Vercel)

## اللغات

من **لوحة التحكم → الإعدادات** اختر لغة الموقع:

- العربية، English، Français، Español، Deutsch، Türkçe، Português، Bahasa Indonesia، हिन्दी، اردو
- تتغير واجهة الصفحة العامة ولوحة التحكم معاً
- اتجاه الكتابة (يمين/يسار) يتحدث تلقائياً حسب اللغة

## متابعة عبر Google

1. أنشئ مشروعاً في [Google Cloud Console](https://console.cloud.google.com/)
2. فعّل OAuth consent screen
3. أنشئ OAuth Client ID من نوع Web
4. Authorized redirect URI:
   - `https://YOUR_DOMAIN/api/auth/callback/google`
   - للتطوير: `http://localhost:3000/api/auth/callback/google`
5. ضع `GOOGLE_CLIENT_ID` و`GOOGLE_CLIENT_SECRET` في `.env.local`

بعدها يظهر زر «متابعة عبر Google» ويعمل بدون تسجيل حساب منفصل.

## الظهور في Google

1. انشر الموقع على نطاقك (Vercel / Netlify / أي استضافة Node)
2. عيّن `NEXTAUTH_URL` إلى رابط موقعك النهائي
3. عيّن `NEXTAUTH_SECRET` إلى نص عشوائي طويل
4. أضف الموقع في [Google Search Console](https://search.google.com/search-console)
5. أرسل خريطة الموقع: `https://YOUR_DOMAIN/sitemap.xml`

من لوحة التحكم → الإعدادات يمكنك تعديل عنوان الصفحة والوصف والكلمات المفتاحية.

## لوحة التحكم

- `/admin` نظرة عامة
- `/admin/posts` نشر وحذف المنشورات
- `/admin/stories` نشر ستوري ومشاهدة أسماء من شاهدوها
- `/admin/settings` الملف الشخصي، الغلاف، أبرز اللحظات، اللغة، SEO، والتحكم بالظهور
- `/admin/followers` قائمة من تابعوك عبر Google

### الستوري (24 ساعة)

- انشر ستوري من `/admin/stories` (صورة + وصف اختياري)
- تظهر حلقة الستوري في الصفحة العامة وتنتهي بعد 24 ساعة
- المشاهدة تتطلب تسجيل الدخول عبر **Google** (نفس متابعة الزائر)
- يظهر **اسم** كل مشاهد وبريده ووقت المشاهدة في لوحة التحكم

### التحكم بالظهور والتفاعل

من الإعدادات يمكنك:
- تفعيل **العلامة الزرقاء** (توثيق الصفحة)
- **إخفاء عدد المتابعين** عن الزوار
- إظهار/إخفاء **القلوب** والسماح بالإعجاب
- إظهار/إخفاء **التعليقات** والسماح بالكتابة

## ملاحظات أمنية

- لا تشارك بيانات دخول المالك
- لا ترفع `.env.local` إلى Git
- المتابعون لا يحصلون على لوحة تحكم ولا يمكنهم النشر
