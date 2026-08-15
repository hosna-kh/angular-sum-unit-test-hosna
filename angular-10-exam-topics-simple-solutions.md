# راه‌حل ۱۰ محور محتمل آزمون Angular — نسخه ساده و نمره‌گیر

این جزوه برای شرایط آزمون طراحی شده است: اگر سؤال مشابه یکی از این ۱۰ مورد آمد، هدف این است که **اول راه‌حل ساده، قابل اجرا و قابل توضیح** را پیاده‌سازی کنی تا بخش اصلی نمره را بگیری. بعد اگر زمان داشتی سراغ نسخه حرفه‌ای‌تر برو.

---

## 1) تنظیمات Production Build بهینه نیست

### چیزی که باید تشخیص بدهی
اگر سؤال گفت Build پروژه برای Production بهینه نیست، اول `angular.json` و configuration مربوط به `production` را بررسی کن.

### راه‌حل ساده

Build تولیدی بگیر:

```bash
ng build --configuration production
```

در `angular.json` بررسی کن که production optimization غیرفعال نشده باشد. ساختار ممکن است شبیه این باشد:

```json
"configurations": {
  "production": {
    "optimization": true,
    "sourceMap": false,
    "extractLicenses": true
  }
}
```

### چیزی که در توضیح بنویسی

```text
Production build باید optimized باشد.
در Production معمولاً minification، tree-shaking و حذف dead code انجام می‌شود.
Source map نیز در صورت عدم نیاز می‌تواند غیرفعال شود.
```

### اگر فقط ۵ دقیقه وقت داشتی

```bash
ng build --configuration production
```

و `optimization` را در `angular.json` بررسی کن.

---

## 2) حذف کدهای بلااستفاده و Logها در Production

### مشکل

مثلاً:

```ts
console.log('user', user);
console.log('token', token);
```

مخصوصاً Log کردن Token یا داده حساس مناسب Production نیست.

### راه‌حل ساده

Logهای اضافی را حذف کن:

```ts
// console.log ها حذف شوند
```

کدها، importها و variableهای بلااستفاده را نیز پاک کن.

اگر واقعاً Log برای Development لازم بود:

```ts
if (!environment.production) {
  console.log('debug info');
}
```

### نکته نمره‌گیر

در توضیحت بگو:

```text
لاگ‌های Debug و اطلاعات حساس نباید در Production نمایش داده شوند.
کد و import بلااستفاده نیز باید حذف شوند تا پروژه تمیزتر و Build سبک‌تر باشد.
```

---

## 3) بهبود Accessibility فرم: Keyboard، Screen Reader و Mobile

### چیزی که باید انجام بدهی

اول از HTML استاندارد استفاده کن:

```html
<label for="email">Email</label>

<input
  id="email"
  type="email"
  aria-describedby="emailHelp"
/>

<small id="emailHelp">
  Enter your email address
</small>

<button type="submit">
  Submit
</button>
```

### برای Keyboard

از `div` قابل کلیک به جای Button استفاده نکن.

بد:

```html
<div (click)="save()">Save</div>
```

بهتر:

```html
<button type="button" (click)="save()">
  Save
</button>
```

Button به‌صورت طبیعی با Keyboard قابل استفاده است.

### برای Screen Reader

برای inputها `label` مناسب بگذار:

```html
<label for="username">Username</label>
<input id="username" />
```

در صورت نیاز از `aria-label` یا `aria-describedby` استفاده کن.

### برای Mobile

عرض input و button را مناسب کن:

```scss
input,
button {
  width: 100%;
  box-sizing: border-box;
}
```

### جواب کوتاه امتحانی

```text
1. label مناسب برای input
2. استفاده از button واقعی برای عملیات
3. پشتیبانی Keyboard
4. aria attributes در صورت نیاز
5. Responsive کردن فرم برای Mobile
```

---

## 4) افزودن Focus Style و بهینه‌سازی برای Mobile

### Focus

ممکن است CSS پروژه Focus را حذف کرده باشد:

```scss
button:focus {
  outline: none;
}
```

این کار برای Accessibility مناسب نیست.

راه بهتر:

```scss
button:focus-visible,
input:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}
```

### Mobile

Mobile-first بنویس:

```scss
.form-container {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

button {
  width: 100%;
}

@media (min-width: 768px) {
  .form-container {
    max-width: 600px;
    margin: 0 auto;
  }

  button {
    width: auto;
  }
}
```

### نکته نمره‌گیر

```text
Focus indicator را حذف نمی‌کنم.
برای Keyboard از :focus-visible استفاده می‌کنم.
برای Mobile ابتدا width: 100% و سپس Media Query برای صفحه‌های بزرگ‌تر می‌گذارم.
```

---

## 5) پیکربندی ناقص Service Worker و عدم پشتیبانی کامل Offline

### اولین کاری که باید یادت بیاید

```bash
ng add @angular/pwa
```

این کار پشتیبانی Angular Service Worker را به پروژه اضافه می‌کند.

بعد فایل مهم را بررسی کن:

```text
ngsw-config.json
```

در آن `assetGroups` باید فایل‌های اصلی برنامه را پوشش دهد.

نمونه:

```json
{
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

### تست

Build بگیر:

```bash
ng build --configuration production
```

### نکته امتحانی

```text
Service Worker فایل‌های برنامه را Cache می‌کند تا برنامه بعد از اولین Load بتواند در حالت Offline نیز بخشی از UI را نمایش دهد.
```

---

## 6) عدم وجود dataGroups در ngsw-config.json برای Cache کردن API

### مشکل

`assetGroups` برای فایل‌های برنامه است.

برای API از:

```text
dataGroups
```

استفاده می‌کنیم.

### راه‌حل ساده

مثلاً برای Products:

```json
{
  "dataGroups": [
    {
      "name": "products-api",
      "urls": [
        "/api/products"
      ],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 50,
        "maxAge": "1h"
      }
    }
  ]
}
```

### این دو را حفظ کن

```text
performance
→ Cache First
→ سرعت مهم‌تر
```

```text
freshness
→ Network First
→ اطلاعات جدید مهم‌تر
```

### نکته نمره‌گیر

اگر API اطلاعات حساس یا خیلی متغیر دارد، آن را بی‌دلیل برای مدت طولانی Cache نکن.

---

## 7) پیکربندی ناقص angular.json برای فعال‌سازی Service Worker

### چیزی که باید بررسی کنی

بعد از افزودن PWA، configuration پروژه را در `angular.json` بررسی کن.

بسته به ساختار و Builder پروژه، باید Angular بداند فایل تنظیمات Service Worker کجاست.

ممکن است چیزی شبیه این ببینی:

```json
"serviceWorker": "ngsw-config.json"
```

یا تنظیم متناظر Builder نسخه پروژه.

### روش مطمئن‌تر در آزمون

اگر Service Worker از اول وجود ندارد:

```bash
ng add @angular/pwa
```

اجازه بده Angular CLI تنظیمات مناسب نسخه پروژه را ایجاد کند.

بعد:

```bash
ng build --configuration production
```

و خروجی build را بررسی کن.

### نکته مهم

ساختار دقیق `angular.json` ممکن است با Builder و نسخه Angular فرق کند؛ بنابراین در آزمون **تنظیم موجود پروژه را بررسی کن و کورکورانه configuration نسخه قدیمی را کپی نکن.**

---

## 8) عدم وجود @angular/service-worker در package.json

### اول بررسی کن

```bash
npm ls @angular/service-worker
```

یا `package.json` را باز کن.

اگر Package وجود ندارد، ساده‌ترین راه معمولاً:

```bash
ng add @angular/pwa
```

است.

این روش علاوه بر Package، تنظیمات لازم PWA را نیز انجام می‌دهد.

اگر فقط نصب Package لازم بود:

```bash
npm install @angular/service-worker
```

ولی برای سؤال کامل PWA ترجیحاً:

```bash
ng add @angular/pwa
```

### بعد بررسی

```bash
npm install
ng build --configuration production
```

### نکته نمره‌گیر

نسخه `@angular/service-worker` باید با نسخه اصلی Angular پروژه سازگار باشد.

---

## 9) همگام‌سازی وضعیت NgRx با localStorage و مقداردهی اولیه صحیح

### مسئله

مثلاً State داریم:

```ts
interface AppState {
  theme: string;
}
```

می‌خواهیم بعد از Refresh مقدار State باقی بماند.

### راه‌حل ساده قابل فهم

وقتی State تغییر کرد، مقدار لازم را در `localStorage` ذخیره کن:

```ts
localStorage.setItem(
  'appState',
  JSON.stringify(state)
);
```

در شروع برنامه آن را بخوان:

```ts
const savedState =
  localStorage.getItem('appState');

const initialState = savedState
  ? JSON.parse(savedState)
  : defaultState;
```

### اگر سؤال مشخصاً NgRx خواست

یک روش مناسب، استفاده از `meta-reducer` برای persistence/rehydration است.

نمونه ساده:

```ts
export function hydrationMetaReducer(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {

  return (state, action) => {

    if (!state) {
      const saved =
        localStorage.getItem('appState');

      if (saved) {
        state = JSON.parse(saved);
      }
    }

    const nextState =
      reducer(state, action);

    localStorage.setItem(
      'appState',
      JSON.stringify(nextState)
    );

    return nextState;
  };
}
```

سپس آن را در `metaReducers` ثبت می‌کنی.

### نکته خیلی مهم

همه State را بی‌دلیل Persist نکن، مخصوصاً:

```text
token
password
اطلاعات حساس
```

### برای نصف نمره حداقل بگو

```text
State را serialize می‌کنم و در localStorage ذخیره می‌کنم.
در Startup آن را می‌خوانم و به عنوان initial state برمی‌گردانم.
در NgRx می‌توان این کار را با meta-reducer انجام داد.
```

---

## 10) ارتباط ایزوله بین دو Micro-frontend در Angular

### هدف

دو Micro-frontend نباید مستقیم به Component داخلی یکدیگر وابسته شوند.

مثلاً MFE شماره 1 می‌خواهد به MFE شماره 2 بگوید:

```text
User Selected
```

### راه‌حل ساده و ایزوله: CustomEvent

در Micro-frontend اول:

```ts
window.dispatchEvent(
  new CustomEvent('user-selected', {
    detail: {
      userId: 10
    }
  })
);
```

در Micro-frontend دوم:

```ts
window.addEventListener(
  'user-selected',
  (event: Event) => {

    const customEvent =
      event as CustomEvent;

    console.log(
      customEvent.detail.userId
    );
  }
);
```

### مزیت

دو MFE مستقیماً همدیگر را import نکرده‌اند:

```text
MFE 1
  ↓
Event
  ↓
MFE 2
```

پس Coupling کمتر می‌شود.

### Cleanup را فراموش نکن

اگر Listener اضافه کردی، هنگام Destroy پاکش کن.

مثلاً Handler را نگه دار:

```ts
private readonly userSelectedHandler =
  (event: Event) => {
    const customEvent =
      event as CustomEvent;

    console.log(customEvent.detail);
  };
```

اضافه کردن:

```ts
window.addEventListener(
  'user-selected',
  this.userSelectedHandler
);
```

حذف:

```ts
window.removeEventListener(
  'user-selected',
  this.userSelectedHandler
);
```

### جواب نمره‌گیر

```text
برای حفظ Isolation، دو Micro-frontend را مستقیماً به هم وابسته نمی‌کنم.
ارتباط را Event-based می‌کنم؛ مثلاً CustomEvent یا event bus در Shell.
Contract رویداد باید مشخص و ساده باشد.
Listener نیز هنگام Destroy پاک شود.
```

---

# خلاصه خیلی سریع ۱۰ سؤال

| موضوع | اولین چیزی که باید یادت بیاید |
|---|---|
| Production Build | `ng build --configuration production` + optimization |
| Production Logs | حذف `console.log` و داده حساس |
| Accessibility | label + button + keyboard + aria |
| Focus/Mobile | `:focus-visible` + mobile-first |
| PWA Offline | `ng add @angular/pwa` |
| Cache API | `dataGroups` |
| Service Worker config | `angular.json` + `ngsw-config.json` |
| Service Worker package | `@angular/service-worker` |
| NgRx persistence | `localStorage` + hydration/meta-reducer |
| Micro-frontend | Event-based communication / CustomEvent |

---

# اگر سر آزمون وقت خیلی کم داشتی

ترتیب کار:

```text
1. اول مشکل را دقیق پیدا کن.
2. ساده‌ترین راه‌حل قابل اجرا را پیاده کن.
3. پروژه را Run/Build کن.
4. اگر زمان ماند، راه‌حل را حرفه‌ای‌تر کن.
```

هدف این نیست که پیچیده‌ترین معماری دنیا را بنویسی؛ هدف این است که **راه‌حل درست، قابل توضیح و قابل اجرا** تحویل بدهی.
