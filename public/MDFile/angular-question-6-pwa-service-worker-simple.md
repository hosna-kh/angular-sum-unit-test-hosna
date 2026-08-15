# سؤال ۶ Angular --- PWA و Service Worker (نسخه ساده)

## صورت ساده سؤال

فرض کن یک پروژه Angular داری و گفته شده:

> برنامه باید بعد از اولین بار اجرا، در صورت قطع اینترنت بتواند فایل‌های
> اصلی خودش را نمایش دهد.

پروژه فعلاً Service Worker ندارد.

------------------------------------------------------------------------

# PWA و Service Worker چه کاری می‌کنند؟

کاربر دفعه اول آنلاین وارد سایت می‌شود:

``` text
Angular App
     ↓
Service Worker
     ↓
Cache
```

بعضی فایل‌های برنامه مثل JavaScript و CSS ذخیره می‌شوند.

بعد اگر اینترنت قطع شود:

``` text
Internet ❌

Browser
   ↓
Service Worker
   ↓
Cache
   ↓
Angular App ✅
```

پس Service Worker مثل یک واسطه بین Browser و Network عمل می‌کند و می‌تواند
بعضی فایل‌ها و داده‌ها را Cache کند.

------------------------------------------------------------------------

# ۱. اضافه کردن PWA به پروژه

در Angular معمولاً اولین کار:

``` bash
ng add @angular/pwa
```

این دستور بخش زیادی از تنظیمات لازم PWA و Service Worker را به پروژه
اضافه می‌کند.

یکی از فایل‌های مهمی که باید بشناسیم:

``` text
ngsw-config.json
```

این فایل برای تنظیم Cache مربوط به Angular Service Worker استفاده می‌شود.

### نکته امتحانی

اگر در سؤال گفت:

> به پروژه Angular قابلیت PWA اضافه کنید.

اولین چیزی که باید یادت بیاید:

``` bash
ng add @angular/pwa
```

------------------------------------------------------------------------

# ۲. فایل ngsw-config.json چیست؟

نمونه:

``` json
{
  "index": "/index.html",

  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",

      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    }
  ]
}
```

لازم نیست تمام جزئیات این فایل را از حفظ باشی.

فعلاً این مدل ذهنی کافی است:

``` text
assetGroups
     ↓
فایل‌های خود برنامه
     ↓
HTML / JS / CSS / assets
```

------------------------------------------------------------------------

# ۳. Cache کردن API

فرض کنیم سؤال گفته:

``` text
/api/products
```

باید Cache شود.

برای Cache کردن APIها معمولاً از:

``` text
dataGroups
```

استفاده می‌کنیم.

مثلاً:

``` json
{
  "dataGroups": [
    {
      "name": "products-api",

      "urls": [
        "/api/products"
      ],

      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1h"
      }
    }
  ]
}
```

### تفاوت مهم

``` text
assetGroups
→ فایل‌های برنامه
```

``` text
dataGroups
→ API / Data
```

این تفاوت را برای آزمون حتماً به خاطر داشته باش.

------------------------------------------------------------------------

# ۴. strategy: performance یعنی چه؟

اگر بنویسیم:

``` json
"strategy": "performance"
```

Service Worker بیشتر به Cache اهمیت می‌دهد.

مدل ساده:

``` text
Cache هست؟
   ↓
بله
   ↓
از Cache بده
```

یعنی سرعت برای ما مهم‌تر است.

به شکل ساده:

``` text
performance
→ Cache First
```

مثلاً برای Productهایی که لازم نیست هر لحظه از Backend دوباره گرفته شوند،
می‌تواند مناسب باشد.

------------------------------------------------------------------------

# ۵. strategy: freshness یعنی چه؟

در `freshness` اول تلاش می‌کنیم اطلاعات جدید را از Network دریافت کنیم.

``` text
اول Network
     ↓
اگر جواب گرفتیم
     ↓
اطلاعات جدید
```

اگر Network در دسترس نباشد، امکان استفاده از Cache وجود دارد.

پس برای آزمون این دو را این‌طور به خاطر بسپار:

``` text
performance
→ Cache First
→ سرعت مهم‌تر
```

``` text
freshness
→ Network First
→ اطلاعات تازه‌تر
```

------------------------------------------------------------------------

# ۶. API اطلاعات User چه می‌شود؟

فرض کنیم سؤال گفته:

``` text
/api/user/profile
```

نباید برای مدت طولانی Cache شود.

چون اطلاعات User ممکن است تغییر کند و نمی‌خواهیم اطلاعات قدیمی نمایش داده
شود.

ساده‌ترین جواب در آزمون:

> این API را وارد `dataGroups` مربوط به Cache طولانی نمی‌کنم.

اگر نیاز به Cache داشته باشد، مدت Cache آن را کوتاه‌تر تنظیم می‌کنیم.

------------------------------------------------------------------------

# ۷. Service Worker در Development و Production

اگر پروژه را معمولی اجرا کنیم:

``` bash
ng serve
```

نباید بدون بررسی تنظیمات انتظار داشته باشیم Service Worker دقیقاً مانند
محیط Production رفتار کند.

برای تست PWA معمولاً Production Build می‌گیریم:

``` bash
ng build --configuration production
```

سپس خروجی Build را با یک HTTP Server اجرا می‌کنیم.

### نکته امتحانی

اگر سؤال گفت:

> Service Worker کار نمی‌کند و پروژه با `ng serve` اجرا شده است.

یکی از اولین مواردی که باید بررسی کنی:

-   نحوه Build و Serve پروژه
-   فعال بودن Service Worker در Configuration موردنظر

------------------------------------------------------------------------

# چیزی که فعلاً باید از سؤال بلد باشی

کل سؤال را به چهار نکته اصلی تبدیل کن:

## ۱. اضافه کردن PWA

``` bash
ng add @angular/pwa
```

## ۲. فایل تنظیمات

``` text
ngsw-config.json
```

## ۳. فایل‌های برنامه

``` text
assetGroups
→ HTML / JS / CSS / assets
```

## ۴. APIها

``` text
dataGroups
→ API
```

و دو Strategy مهم:

``` text
performance
→ Cache First
→ سریع‌تر
```

``` text
freshness
→ Network First
→ اطلاعات تازه‌تر
```

------------------------------------------------------------------------

# روش برخورد با سؤال در آزمون

اگر سؤال PWA دیدی و جزئیات را کامل یادت نبود:

ابتدا:

``` bash
ng add @angular/pwa
```

بعد سراغ فایل:

``` text
ngsw-config.json
```

برو.

اگر گفته بود یک API را Cache کن، دنبال:

``` json
"dataGroups": []
```

بگرد.

لازم نیست تمام `ngsw-config.json` را از حفظ بنویسی. مهم‌تر این است که
بدانی چه چیزی را باید جستجو کنی و کدام قسمت پروژه را تغییر بدهی.
