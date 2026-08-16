# Angular Internationalization (i18n) — جزوه امتحانی + مثال و جواب

این جزوه برای آزمون عملی **Angular 20/21** آماده شده است و تمرکز اصلی آن روی دوزبانه کردن Runtime با `ngx-translate` است.

> نکته نسخه‌ای مهم: در نسخه فعلی `@ngx-translate/core` یعنی v18، روش اصلی Standalone است. `TranslateModule.forRoot()` و `forChild()` حذف شده‌اند و به‌جای آن از `provideTranslateService()` استفاده می‌شود. برای Angular 18 تا 22، ngx-translate 18.x پشتیبانی می‌شود.

---

# 1) Internationalization یعنی چه؟

Internationalization یا **i18n** یعنی برنامه را طوری طراحی کنیم که بتواند چند زبان، فرمت و جهت نوشتاری را پشتیبانی کند.

مثلاً:

```text
فارسی
→ سلام
→ RTL

English
→ Hello
→ LTR
```

در یک پروژه Angular معمولاً می‌خواهیم:

```text
متن‌ها Hard-code نباشند
زبان در Runtime تغییر کند
زبان انتخاب‌شده بعد از Refresh باقی بماند
RTL / LTR تغییر کند
متن پارامتری داشته باشیم
Fallback داشته باشیم
```

---

# 2) مشکل Hard-coded Text

کد زیر برای چندزبانه شدن مناسب نیست:

```html
<h1>لیست محصولات</h1>

<button>
  افزودن به سبد خرید
</button>
```

چون متن فارسی مستقیم در Template نوشته شده است.

راه بهتر:

```html
<h1>
  {{ 'PRODUCTS.TITLE' | translate }}
</h1>

<button>
  {{ 'PRODUCTS.ADD' | translate }}
</button>
```

حالا متن واقعی در فایل ترجمه قرار می‌گیرد.

---

# 3) مدل ذهنی ngx-translate

```text
HTML
 ↓
Translation Key
 ↓
PRODUCTS.TITLE
 ↓
fa.json / en.json
 ↓
متن نهایی
```

مثلاً:

```text
PRODUCTS.TITLE
```

در فارسی:

```text
لیست محصولات
```

و در انگلیسی:

```text
Product List
```

---

# 4) نصب ngx-translate

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

`@ngx-translate/http-loader` فایل‌های JSON ترجمه را از برنامه Load می‌کند.

---

# 5) فایل‌های ترجمه

یک ساختار ساده:

```text
public/
└── i18n/
    ├── fa.json
    └── en.json
```

یا بسته به ساختار پروژه:

```text
assets/i18n/
```

مهم این است که Prefix مربوط به HTTP Loader با مسیر واقعی فایل‌ها هماهنگ باشد.

---

# 6) فایل fa.json

```json
{
  "PRODUCTS": {
    "TITLE": "لیست محصولات",
    "ADD": "افزودن محصول",
    "EMPTY": "محصولی یافت نشد"
  },

  "COMMON": {
    "SAVE": "ذخیره",
    "CANCEL": "انصراف"
  }
}
```

---

# 7) فایل en.json

```json
{
  "PRODUCTS": {
    "TITLE": "Product List",
    "ADD": "Add Product",
    "EMPTY": "No products found"
  },

  "COMMON": {
    "SAVE": "Save",
    "CANCEL": "Cancel"
  }
}
```

### نکته امتحانی

ساختار Keyها را منظم نگه دار:

```text
PRODUCTS.TITLE
PRODUCTS.ADD

LOGIN.TITLE
LOGIN.USERNAME

COMMON.SAVE
COMMON.CANCEL
```

این بهتر از Keyهای پراکنده است.

---

# 8) تنظیم ngx-translate در Angular جدید

در پروژه Standalone، داخل `app.config.ts`:

```ts
import {
  ApplicationConfig
} from '@angular/core';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideTranslateService
} from '@ngx-translate/core';

import {
  provideTranslateHttpLoader
} from '@ngx-translate/http-loader';

export const appConfig:
  ApplicationConfig = {

  providers: [

    provideHttpClient(),

    provideTranslateService({

      loader:
        provideTranslateHttpLoader({
          prefix: '/i18n/',
          suffix: '.json'
        }),

      fallbackLang: 'fa',

      lang: 'fa'
    })

  ]
};
```

اگر فایل‌ها در:

```text
assets/i18n/
```

هستند، Prefix را مطابق همان مسیر تنظیم کن.

---

# 9) استفاده از TranslatePipe

در Standalone Component:

```ts
import {
  Component
} from '@angular/core';

import {
  TranslatePipe
} from '@ngx-translate/core';

@Component({
  selector: 'app-products',

  standalone: true,

  imports: [
    TranslatePipe
  ],

  templateUrl:
    './products.component.html'
})
export class ProductsComponent {}
```

HTML:

```html
<h1>
  {{ 'PRODUCTS.TITLE' | translate }}
</h1>

<button>
  {{ 'PRODUCTS.ADD' | translate }}
</button>
```

---

# 10) تغییر زبان در Runtime

مثلاً دو Button داریم:

```html
<button
  (click)="changeLanguage('fa')">

  فارسی

</button>

<button
  (click)="changeLanguage('en')">

  English

</button>
```

Component:

```ts
import {
  inject
} from '@angular/core';

import {
  TranslateService
} from '@ngx-translate/core';

export class AppComponent {

  private translate =
    inject(TranslateService);

  changeLanguage(
    lang: 'fa' | 'en'
  ): void {

    this.translate.use(lang);
  }
}
```

### نکته اصلی

```ts
translate.use('fa')
```

یعنی:

```text
زبان فعال را فارسی کن
```

و:

```ts
translate.use('en')
```

یعنی:

```text
زبان فعال را انگلیسی کن
```

---

# 11) نگه داشتن زبان بعد از Refresh

اگر فقط:

```ts
this.translate.use(lang);
```

را اجرا کنیم، ممکن است بعد از Refresh دوباره زبان اولیه فعال شود.

پس زبان انتخاب‌شده را ذخیره می‌کنیم:

```ts
changeLanguage(
  lang: 'fa' | 'en'
): void {

  this.translate.use(lang);

  localStorage.setItem(
    'lang',
    lang
  );
}
```

هنگام شروع برنامه:

```ts
const savedLang =
  localStorage.getItem('lang')
  as 'fa' | 'en' | null;

const lang =
  savedLang ?? 'fa';

this.translate.use(lang);
```

مدل ذهنی:

```text
User selects EN
      ↓
translate.use('en')
      ↓
localStorage = en
      ↓
Refresh
      ↓
read localStorage
      ↓
English again
```

---

# 12) RTL و LTR

فارسی:

```text
RTL
```

انگلیسی:

```text
LTR
```

پس هنگام تغییر زبان:

```ts
private setDocumentLanguage(
  lang: 'fa' | 'en'
): void {

  document.documentElement.lang =
    lang;

  document.documentElement.dir =
    lang === 'fa'
      ? 'rtl'
      : 'ltr';
}
```

بعد:

```ts
changeLanguage(
  lang: 'fa' | 'en'
): void {

  this.translate.use(lang);

  localStorage.setItem(
    'lang',
    lang
  );

  this.setDocumentLanguage(lang);
}
```

---

# 13) نسخه ساده کامل Component

```ts
export class AppComponent {

  private translate =
    inject(TranslateService);

  constructor() {

    const savedLang =
      localStorage.getItem('lang')
      as 'fa' | 'en' | null;

    const lang =
      savedLang ?? 'fa';

    this.translate.use(lang);

    this.setDocumentLanguage(lang);
  }

  changeLanguage(
    lang: 'fa' | 'en'
  ): void {

    this.translate.use(lang);

    localStorage.setItem(
      'lang',
      lang
    );

    this.setDocumentLanguage(lang);
  }

  private setDocumentLanguage(
    lang: 'fa' | 'en'
  ): void {

    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      lang === 'fa'
        ? 'rtl'
        : 'ltr';
  }
}
```

---

# 14) Fallback Language چیست؟

فرض کن زبان فعال انگلیسی است:

```text
en
```

ولی یک Key در `en.json` وجود ندارد.

اگر:

```ts
fallbackLang: 'fa'
```

تنظیم شده باشد، ngx-translate می‌تواند برای Key گمشده سراغ زبان fallback برود.

مثلاً `fa.json`:

```json
{
  "COMMON": {
    "SAVE": "ذخیره"
  }
}
```

ولی در `en.json`:

```json
{
  "COMMON": {}
}
```

در این حالت Fallback کمک می‌کند.

### مدل ذهنی

```text
Current Language
      ↓
Key exists?
  ↙       ↘
Yes       No
 ↓         ↓
show     fallback
```

---

# 15) ترجمه پارامتری

خیلی مهم و محتمل برای آزمون.

می‌خواهیم نمایش بدهیم:

```text
سلام حسنا
```

یا:

```text
Hello Hosna
```

`fa.json`:

```json
{
  "WELCOME": "سلام {{name}}"
}
```

`en.json`:

```json
{
  "WELCOME": "Hello {{name}}"
}
```

HTML:

```html
<p>
  {{
    'WELCOME'
      | translate: { name: userName }
  }}
</p>
```

TypeScript:

```ts
userName = 'Hosna';
```

نتیجه فارسی:

```text
سلام Hosna
```

و انگلیسی:

```text
Hello Hosna
```

---

# 16) ترجمه Placeholder

مثلاً:

```json
{
  "LOGIN": {
    "USERNAME": "Username"
  }
}
```

HTML:

```html
<input
  [placeholder]="
    'LOGIN.USERNAME' | translate
  "
/>
```

برای فارسی:

```json
{
  "LOGIN": {
    "USERNAME": "نام کاربری"
  }
}
```

---

# 17) ترجمه title و aria-label

فقط متن داخل `<p>` ترجمه نمی‌شود.

مثلاً:

```html
<button
  [title]="
    'COMMON.SAVE' | translate
  "
  [attr.aria-label]="
    'COMMON.SAVE' | translate
  ">

  {{ 'COMMON.SAVE' | translate }}

</button>
```

این برای Accessibility هم مفید است.

---

# 18) مسئله امتحانی شماره 1 — حذف Hard-code

## صورت سؤال

Template:

```html
<h2>
  لیست کاربران
</h2>

<button>
  افزودن کاربر
</button>

<p>
  کاربری یافت نشد
</p>
```

برنامه باید فارسی و انگلیسی شود.

---

# جواب

`fa.json`:

```json
{
  "USERS": {
    "TITLE": "لیست کاربران",
    "ADD": "افزودن کاربر",
    "EMPTY": "کاربری یافت نشد"
  }
}
```

`en.json`:

```json
{
  "USERS": {
    "TITLE": "User List",
    "ADD": "Add User",
    "EMPTY": "No users found"
  }
}
```

HTML:

```html
<h2>
  {{ 'USERS.TITLE' | translate }}
</h2>

<button>
  {{ 'USERS.ADD' | translate }}
</button>

<p>
  {{ 'USERS.EMPTY' | translate }}
</p>
```

### چیزی که حل کردیم

```text
Hard-coded text
      ↓
Translation Keys
      ↓
JSON files
```

---

# 19) مسئله امتحانی شماره 2 — تغییر زبان + Refresh

## صورت سؤال

برنامه دو Button فارسی و انگلیسی دارد.

خواسته‌ها:

```text
1. زبان بدون Refresh تغییر کند.
2. زبان انتخاب‌شده بعد از Refresh باقی بماند.
3. جهت صفحه تغییر کند.
```

---

# جواب

HTML:

```html
<button
  (click)="changeLanguage('fa')">
  فارسی
</button>

<button
  (click)="changeLanguage('en')">
  English
</button>
```

TypeScript:

```ts
changeLanguage(
  lang: 'fa' | 'en'
): void {

  this.translate.use(lang);

  localStorage.setItem(
    'lang',
    lang
  );

  document.documentElement.lang =
    lang;

  document.documentElement.dir =
    lang === 'fa'
      ? 'rtl'
      : 'ltr';
}
```

Startup:

```ts
const savedLang =
  localStorage.getItem('lang')
  as 'fa' | 'en' | null;

const lang =
  savedLang ?? 'fa';

this.translate.use(lang);

document.documentElement.lang =
  lang;

document.documentElement.dir =
  lang === 'fa'
    ? 'rtl'
    : 'ltr';
```

### سه Requirement

```text
translate.use()
→ Runtime Switch

localStorage
→ Persist after Refresh

document.dir
→ RTL / LTR
```

---

# 20) مسئله امتحانی شماره 3 — متن پارامتری

## صورت سؤال

برنامه باید این متن را نمایش دهد:

```text
Welcome Sara
```

در فارسی:

```text
سارا خوش آمدید
```

نام User Dynamic است.

---

# جواب

`en.json`:

```json
{
  "WELCOME_USER":
    "Welcome {{name}}"
}
```

`fa.json`:

```json
{
  "WELCOME_USER":
    "{{name}} خوش آمدید"
}
```

TypeScript:

```ts
userName = 'Sara';
```

HTML:

```html
<p>
  {{
    'WELCOME_USER'
      | translate: {
          name: userName
        }
  }}
</p>
```

### نکته

اسم User را داخل Translation File Hard-code نمی‌کنیم.

```text
Translation
+
Dynamic Parameter
```

---

# 21) مسئله امتحانی شماره 4 — Missing Translation

## صورت سؤال

زبان برنامه `en` است، ولی بعضی Keyها فقط در فارسی وجود دارند.

چه کار کنیم؟

### جواب ساده

در config:

```ts
provideTranslateService({
  loader:
    provideTranslateHttpLoader({
      prefix: '/i18n/',
      suffix: '.json'
    }),

  fallbackLang: 'fa',
  lang: 'fa'
})
```

پس اگر Key در زبان فعال پیدا نشد، Fallback Language قابل استفاده است.

---

# 22) مسئله امتحانی شماره 5 — خطای Pipe

## صورت سؤال

این HTML داریم:

```html
<h1>
  {{ 'HOME.TITLE' | translate }}
</h1>
```

ولی Angular خطایی شبیه این می‌دهد:

```text
No pipe found with name 'translate'
```

### علت محتمل

`TranslatePipe` در Component وارد نشده.

### جواب در Standalone

```ts
import {
  TranslatePipe
} from '@ngx-translate/core';

@Component({
  standalone: true,

  imports: [
    TranslatePipe
  ]
})
export class HomeComponent {}
```

### مدل ذهنی

```text
| translate
      ↓
TranslatePipe
      ↓
imports
```

---

# 23) مسئله امتحانی شماره 6 — فایل JSON Load نمی‌شود

## مشکل

Translation Key به جای متن نمایش داده می‌شود:

```text
HOME.TITLE
```

### چیزهایی که بررسی می‌کنیم

```text
1. فایل fa.json / en.json وجود دارد؟

2. JSON معتبر است؟

3. Prefix صحیح است؟

4. provideHttpClient() وجود دارد؟

5. HTTP Loader درست configure شده؟

6. Key واقعاً داخل JSON وجود دارد؟
```

مثلاً اگر فایل‌ها:

```text
public/i18n/fa.json
public/i18n/en.json
```

هستند:

```ts
provideTranslateHttpLoader({
  prefix: '/i18n/',
  suffix: '.json'
})
```

---

# 24) یک سؤال ترکیبی شبیه آزمون

## صورت سؤال

پروژه زیر فقط فارسی است:

```html
<h1>داشبورد</h1>

<input
  placeholder="جستجو"
/>

<button>
  خروج
</button>
```

خواسته‌ها:

```text
1. فارسی و انگلیسی شود.
2. زبان در Runtime تغییر کند.
3. بعد از Refresh حفظ شود.
4. RTL/LTR تغییر کند.
5. Placeholder هم ترجمه شود.
```

---

# 25) جواب سؤال ترکیبی

`fa.json`:

```json
{
  "DASHBOARD": {
    "TITLE": "داشبورد",
    "SEARCH": "جستجو",
    "LOGOUT": "خروج"
  }
}
```

`en.json`:

```json
{
  "DASHBOARD": {
    "TITLE": "Dashboard",
    "SEARCH": "Search",
    "LOGOUT": "Logout"
  }
}
```

HTML:

```html
<button
  (click)="changeLanguage('fa')">
  فارسی
</button>

<button
  (click)="changeLanguage('en')">
  English
</button>

<h1>
  {{ 'DASHBOARD.TITLE' | translate }}
</h1>

<input
  [placeholder]="
    'DASHBOARD.SEARCH' | translate
  "
/>

<button>
  {{ 'DASHBOARD.LOGOUT' | translate }}
</button>
```

TypeScript:

```ts
private translate =
  inject(TranslateService);

constructor() {

  const savedLang =
    localStorage.getItem('lang')
    as 'fa' | 'en' | null;

  const lang =
    savedLang ?? 'fa';

  this.applyLanguage(lang);
}

changeLanguage(
  lang: 'fa' | 'en'
): void {

  localStorage.setItem(
    'lang',
    lang
  );

  this.applyLanguage(lang);
}

private applyLanguage(
  lang: 'fa' | 'en'
): void {

  this.translate.use(lang);

  document.documentElement.lang =
    lang;

  document.documentElement.dir =
    lang === 'fa'
      ? 'rtl'
      : 'ltr';
}
```

---

# 26) بهتر کردن ساختار با LanguageService

اگر سؤال معماری‌تر بود، منطق زبان را از Component خارج کن.

```ts
@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private translate =
    inject(TranslateService);

  init(): void {

    const savedLang =
      localStorage.getItem('lang')
      as 'fa' | 'en' | null;

    this.setLanguage(
      savedLang ?? 'fa'
    );
  }

  setLanguage(
    lang: 'fa' | 'en'
  ): void {

    this.translate.use(lang);

    localStorage.setItem(
      'lang',
      lang
    );

    document.documentElement.lang =
      lang;

    document.documentElement.dir =
      lang === 'fa'
        ? 'rtl'
        : 'ltr';
  }
}
```

Component:

```ts
private languageService =
  inject(LanguageService);

changeLanguage(
  lang: 'fa' | 'en'
): void {

  this.languageService
    .setLanguage(lang);
}
```

### مزیت

```text
Component
→ UI

LanguageService
→ Language Logic
```

---

# 27) translate pipe یا instant؟

در Template معمولاً:

```html
{{ 'COMMON.SAVE' | translate }}
```

خیلی ساده و مناسب است.

در TypeScript ممکن است ببینی:

```ts
this.translate.instant(
  'COMMON.SAVE'
);
```

`instant()` یک خواندن synchronous و one-shot است.

اگر ترجمه هنوز Load نشده باشد یا نیاز به Reactivity داشته باشی، باید در انتخاب API دقت کنی.

برای آزمون ساده:

```text
Template
→ TranslatePipe

Change Language
→ TranslateService.use()

One-shot TypeScript lookup
→ instant()
```

---

# 28) نکته Angular/ngx-translate جدید

در ngx-translate v18 علاوه بر Pipe، APIهای Signal-based هم وجود دارند.

مثلاً:

```ts
greeting =
  this.translate.translate(
    'WELCOME'
  );
```

که یک Signal برمی‌گرداند و با تغییر زبان به‌روز می‌شود.

اما اگر سؤال آزمون فقط دوزبانه کردن Template بود، لازم نیست راه‌حل را پیچیده کنی.

```text
JSON
+
TranslatePipe
+
TranslateService.use()
```

کاملاً کافی است.

---

# 29) اشتباهات رایج امتحانی

## اشتباه 1

فقط این را انجام دهی:

```ts
translate.use('en');
```

ولی `dir` را تغییر ندهی.

برای فارسی/انگلیسی:

```text
fa → rtl
en → ltr
```

---

## اشتباه 2

زبان را تغییر بدهی ولی ذخیره نکنی.

بعد Refresh:

```text
English
 ↓
Refresh
 ↓
Persian ❌
```

راه‌حل:

```text
localStorage
```

---

## اشتباه 3

متن Button را ترجمه کنی ولی Placeholder را فراموش کنی.

این‌ها هم ممکن است نیاز به ترجمه داشته باشند:

```text
placeholder
title
aria-label
validation messages
menu labels
dialog texts
```

---

## اشتباه 4

Key را اشتباه بنویسی:

JSON:

```json
{
  "PRODUCT": {
    "TITLE": "Product"
  }
}
```

HTML:

```html
{{ 'PRODUCTS.TITLE' | translate }}
```

`PRODUCT` با `PRODUCTS` فرق دارد.

---

## اشتباه 5

در ngx-translate جدید دنبال:

```ts
TranslateModule.forRoot()
```

بگردی.

در v18 روش اصلی:

```ts
provideTranslateService()
```

است.

---

# 30) Cheat Sheet امتحانی

اگر سؤال گفت:

```text
برنامه را دوزبانه کن
```

فکر کن:

```text
1. ngx-translate
2. fa.json / en.json
3. TranslatePipe
4. TranslateService
5. use(lang)
```

اگر گفت:

```text
بعد Refresh باقی بماند
```

فکر کن:

```text
localStorage
```

اگر گفت:

```text
فارسی / انگلیسی
```

فکر کن:

```text
fa → rtl
en → ltr
```

اگر گفت:

```text
متن Dynamic
```

فکر کن:

```text
{{name}}
```

اگر گفت:

```text
Key وجود نداشت
```

فکر کن:

```text
fallbackLang
```

اگر گفت:

```text
No pipe found with name translate
```

فکر کن:

```text
TranslatePipe
→ imports
```

اگر فایل JSON Load نشد:

```text
path
prefix
suffix
provideHttpClient
loader
JSON syntax
```

---

# 31) پنج خطی که ارزش حفظ کردن دارند

```ts
this.translate.use(lang);

localStorage.setItem(
  'lang',
  lang
);

document.documentElement.lang =
  lang;

document.documentElement.dir =
  lang === 'fa'
    ? 'rtl'
    : 'ltr';
```

اگر همین منطق را بلد باشی، بخش بزرگی از سؤال Runtime Internationalization را می‌توانی حل کنی.

---

# 32) فرمول ذهنی نهایی

```text
Hard-coded Text
       ↓
Translation Key
       ↓
fa.json / en.json
       ↓
TranslatePipe
       ↓
TranslateService.use(lang)
       ↓
localStorage
       ↓
RTL / LTR
```

برای آزمون اول **نسخه ساده و کارکردی** را پیاده کن. اگر وقت اضافه داشتی، منطق زبان را به `LanguageService` منتقل کن، fallback و accessibility را بهتر کن و ساختار Keyها را مرتب‌تر کن.
