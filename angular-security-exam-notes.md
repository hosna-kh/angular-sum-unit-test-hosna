# Angular Security — جزوه امتحانی + مسئله برنامه‌نویسی و جواب

این جزوه برای مرور **Security در Angular 20/21** نوشته شده است. هدف این است که در آزمون، وقتی یک پروژه ناقص یا ناامن به تو می‌دهند، بتوانی سریع مشکل را پیدا کنی و یک راه‌حل ساده و نمره‌گیر ارائه بدهی.

---

# 1) اول از همه: Angular Security یعنی چه؟

در Frontend چند موضوع خیلی مهم داریم:

```text
XSS
→ تزریق کد مخرب به صفحه

Token Security
→ نگهداری و ارسال امن Token

Route Guard
→ جلوگیری از ورود معمولی کاربر به Route غیرمجاز

CSRF / XSRF
→ جلوگیری از Request جعلی با هویت کاربر

Sensitive Data
→ عدم نمایش Password / Token / اطلاعات حساس

Dependency Security
→ استفاده از Packageهای به‌روز و امن
```

> نکته مهم: Frontend به‌تنهایی امنیت کامل ایجاد نمی‌کند. **Authorization واقعی باید در Backend هم بررسی شود.** Guard در Angular بیشتر از Navigation و UX محافظت می‌کند و جای بررسی مجوز در Server را نمی‌گیرد.

---

# 2) XSS چیست؟

XSS یعنی مهاجم بتواند محتوای مخرب را وارد DOM کند.

مثلاً فرض کن Backend این مقدار را برگرداند:

```ts
comment = `
  <img src="x" onerror="alert('Hacked')">
`;
```

اگر داده کنترل‌نشده به شکل ناامن وارد DOM شود، می‌تواند خطرناک باشد.

Angular مقادیر Template Binding را به‌صورت پیش‌فرض untrusted در نظر می‌گیرد و در contextهای مناسب آن‌ها را sanitize/escape می‌کند.

---

# 3) روش امن‌تر برای نمایش متن

اگر فقط متن می‌خواهی نمایش بدهی:

```html
<p>{{ comment }}</p>
```

Interpolation انتخاب خوبی است.

مثلاً:

```ts
comment = '<script>alert("hack")</script>';
```

و:

```html
<p>{{ comment }}</p>
```

Angular آن را به عنوان Template اجرایی جدید کامپایل نمی‌کند؛ متن را نمایش می‌دهد.

### مدل ذهنی

```text
User/API Data
    ↓
Interpolation
    ↓
Angular escaping
    ↓
DOM
```

---

# 4) مراقب innerHTML باش

گاهی پروژه دارد:

```html
<div [innerHTML]="description"></div>
```

Angular برای HTML binding عملیات sanitization انجام می‌دهد، اما `innerHTML` همچنان یک **security-sensitive sink** است و باید منشأ داده را بررسی کنی.

اگر فقط Text نیاز داری، ترجیح بده:

```html
<div>{{ description }}</div>
```

اگر واقعاً HTML لازم داری، اجازه بده Angular آن را sanitize کند و از bypass کردن بی‌دلیل امنیت خودداری کن.

---

# 5) اشتباه خطرناک: bypassSecurityTrustHtml

ممکن است این کد را ببینی:

```ts
this.safeHtml =
  this.sanitizer.bypassSecurityTrustHtml(
    userInput
  );
```

و:

```html
<div [innerHTML]="safeHtml"></div>
```

اسم `bypassSecurityTrustHtml` ممکن است گمراه‌کننده باشد.

این متد نمی‌گوید:

> «Angular لطفاً این داده را امن کن.»

بلکه تقریباً می‌گوید:

> «من خودم این مقدار را بررسی کرده‌ام؛ به آن اعتماد کن و sanitization معمول را bypass کن.»

پس برای ورودی مستقیم کاربر:

```ts
bypassSecurityTrustHtml(userInput)
```

می‌تواند بسیار خطرناک باشد.

### قانون امتحانی

```text
bypassSecurityTrust...
≠ sanitize

bypassSecurityTrust...
= من مسئولیت امن بودن این مقدار را قبول می‌کنم
```

---

# 6) اگر مجبور شدم خودم sanitize کنم چه؟

Angular `DomSanitizer` دارد.

مثال:

```ts
import {
  SecurityContext
} from '@angular/core';

import {
  DomSanitizer
} from '@angular/platform-browser';
```

بعد:

```ts
constructor(
  private sanitizer: DomSanitizer
) {}
```

و:

```ts
const sanitized =
  this.sanitizer.sanitize(
    SecurityContext.HTML,
    html
  );
```

اما برای بسیاری از سناریوهای معمول Template، بهتر است اجازه بدهی Angular Binding خودش کار لازم را انجام دهد.

---

# 7) مستقیم DOM را دستکاری نکن

کدی مثل این را با دقت بررسی کن:

```ts
document.getElementById('content')!
  .innerHTML = userInput;
```

یا:

```ts
elementRef.nativeElement.innerHTML =
  userInput;
```

چون با DOM API مستقیم، ممکن است از protectionهای معمول Angular Template خارج شوی.

### بهتر

تا جای ممکن:

```html
<div>{{ userInput }}</div>
```

یا Binding مناسب Angular استفاده کن.

---

# 8) Token را Console نکن

بد:

```ts
console.log('token:', token);
```

به‌خصوص در Production این کار مناسب نیست.

همچنین این موارد را بی‌دلیل Log نکن:

```text
Password
Access Token
Refresh Token
Authorization Header
اطلاعات حساس کاربر
```

### نکته امتحانی

اگر در سؤال دیدی:

```ts
console.log(token);
```

یکی از اولین اصلاح‌ها:

```text
حذف Log
```

است.

---

# 9) Token را داخل Source Code Hard-code نکن

خیلی بد:

```ts
const token =
  'eyJhbGciOiJIUzI1Ni...';
```

یا:

```ts
const password = '123456';
```

هیچ Secret واقعی نباید داخل کد Frontend قرار بگیرد.

چرا؟

چون JavaScript برنامه به Browser کاربر ارسال می‌شود و قابل مشاهده است.

### نکته خیلی مهم

حتی `environment.ts` جای نگهداری **Secret واقعی** نیست.

مثلاً این:

```ts
export const environment = {
  secretKey: 'SUPER_SECRET_KEY'
};
```

امن نیست؛ چون در Build نهایی Frontend قابل استخراج است.

---

# 10) HTTP Interceptor برای Authorization

فرض کن چند API داری و همه نیاز به Token دارند.

بد:

```ts
this.http.get('/api/users', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

و دوباره در API بعدی:

```ts
this.http.get('/api/orders', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

کد تکراری می‌شود.

می‌توانیم از Interceptor استفاده کنیم.

---

# 11) مثال ساده Auth Interceptor

نمونه Functional Interceptor:

```ts
import {
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor:
  HttpInterceptorFn = (req, next) => {

  const token =
    localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const clonedRequest =
    req.clone({
      setHeaders: {
        Authorization:
          `Bearer ${token}`
      }
    });

  return next(clonedRequest);
};
```

و در config:

```ts
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

providers: [
  provideHttpClient(
    withInterceptors([
      authInterceptor
    ])
  )
]
```

### چرا clone؟

`HttpRequest` در Angular immutable است.

پس به جای تغییر مستقیم Request:

```text
request
 ↓
clone
 ↓
اضافه کردن Authorization
 ↓
ارسال
```

---

# 12) نکته درباره localStorage و Token

برای تمرین امتحانی ممکن است Token را در `localStorage` ببینی و Interceptor از آن بخواند.

اما از نظر امنیت واقعی:

```text
localStorage
→ JavaScript می‌تواند آن را بخواند
→ در صورت XSS ممکن است Token در معرض سرقت باشد
```

در معماری‌های مبتنی بر Cookie، استفاده از Cookie امن با تنظیماتی مثل `HttpOnly`, `Secure`, `SameSite` می‌تواند مزیت‌های امنیتی داشته باشد، اما انتخاب معماری Authentication به Backend و نیازهای سیستم هم وابسته است.

### چیزی که در آزمون بگویی

```text
Token را Hard-code یا Log نمی‌کنم.
اگر معماری پروژه localStorage دارد، خطر XSS را در نظر می‌گیرم.
امنیت نهایی Token باید با طراحی Backend و Authentication هماهنگ باشد.
```

---

# 13) Route Guard

فرض کن Route زیر فقط برای User لاگین‌شده است:

```ts
{
  path: 'dashboard',
  component: DashboardComponent
}
```

می‌توانیم Guard اضافه کنیم.

نمونه ساده:

```ts
import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  inject
} from '@angular/core';

export const authGuard:
  CanActivateFn = () => {

  const router = inject(Router);

  const token =
    localStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree([
    '/login'
  ]);
};
```

Route:

```ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

### مدل ذهنی

```text
User
 ↓
Route
 ↓
Guard
 ↓
Logged in?
 ↙      ↘
Yes      No
 ↓        ↓
Page     Login
```

---

# 14) Guard امنیت Backend نیست

این نکته خیلی مهم است.

مهاجم می‌تواند مستقیماً API را صدا بزند.

پس این کافی نیست:

```text
Angular Guard
→ User نمی‌تواند Page را باز کند
```

Backend هم باید بگوید:

```text
آیا این User اجازه اجرای این API را دارد؟
```

### جمله نمره‌گیر

> Route Guard جای Server-side authorization را نمی‌گیرد.

---

# 15) مسئله برنامه‌نویسی شماره ۱ — XSS

## صورت سؤال

پروژه Angular نظرات کاربران را از API دریافت می‌کند.

کد فعلی:

```ts
export class CommentComponent {

  comment = '';

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  setComment(value: string): void {

    this.comment =
      this.sanitizer
        .bypassSecurityTrustHtml(value)
        as string;
  }
}
```

HTML:

```html
<div [innerHTML]="comment"></div>
```

کاربر می‌تواند HTML دلخواه ارسال کند.

### مشکل امنیتی را پیدا و اصلاح کنید.

---

# جواب مسئله ۱

مشکل اصلی:

```ts
bypassSecurityTrustHtml(value)
```

است.

ما داریم به **ورودی کاربر** اعتماد می‌کنیم.

اگر فقط متن Comment لازم داریم، ساده‌ترین راه:

TypeScript:

```ts
export class CommentComponent {
  comment = '';

  setComment(value: string): void {
    this.comment = value;
  }
}
```

HTML:

```html
<div>
  {{ comment }}
</div>
```

### چرا بهتر است؟

چون Comment قرار نیست HTML اجرایی باشد.

پس اصلاً نیازی به:

```text
innerHTML
DomSanitizer
bypassSecurityTrustHtml
```

نداریم.

### نکته امتحانی

اول از خودت بپرس:

> آیا واقعاً باید HTML نمایش بدهم؟

اگر جواب **نه** بود:

```html
{{ value }}
```

معمولاً راه ساده‌تر و امن‌تری است.

---

# 16) مسئله برنامه‌نویسی شماره ۲ — Authorization Header

## صورت سؤال

پروژه در سه Service مختلف این کد را تکرار کرده است:

```ts
const token =
  localStorage.getItem('token');

return this.http.get(
  '/api/orders',
  {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  }
);
```

خواسته:

```text
کد تکراری حذف شود و Token به Requestهای API اضافه شود.
```

---

# جواب مسئله ۲

یک Interceptor می‌سازیم:

```ts
export const authInterceptor:
  HttpInterceptorFn = (req, next) => {

  const token =
    localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const authReq =
    req.clone({
      setHeaders: {
        Authorization:
          `Bearer ${token}`
      }
    });

  return next(authReq);
};
```

سپس:

```ts
provideHttpClient(
  withInterceptors([
    authInterceptor
  ])
)
```

حالا Service:

```ts
getOrders(): Observable<Order[]> {

  return this.http.get<Order[]>(
    '/api/orders'
  );
}
```

دیگر Service مسئول اضافه کردن Token نیست.

### مزیت

```text
Service
→ API Logic

Interceptor
→ Authorization Header
```

Separation of Concerns بهتر می‌شود.

---

# 17) مسئله برنامه‌نویسی شماره ۳ — Route Security

## صورت سؤال

Route زیر بدون هیچ بررسی باز می‌شود:

```ts
{
  path: 'admin',
  component: AdminComponent
}
```

فقط User لاگین‌شده باید بتواند وارد آن شود.

---

# جواب ساده

Guard:

```ts
export const authGuard:
  CanActivateFn = () => {

  const router =
    inject(Router);

  const token =
    localStorage.getItem('token');

  return token
    ? true
    : router.createUrlTree(['/login']);
};
```

Route:

```ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard]
}
```

اما در توضیح اضافه کن:

```text
Backend نیز باید دسترسی Admin را بررسی کند.
```

اگر فقط وجود Token را بررسی کنیم، هنوز بررسی Role انجام نشده است.

مثلاً در پروژه واقعی ممکن است:

```text
AuthService
→ isAuthenticated()
→ hasRole('admin')
```

داشته باشیم.

---

# 18) مسئله برنامه‌نویسی شماره ۴ — Sensitive Logs

## صورت سؤال

کد:

```ts
login(): void {

  console.log(
    'password:',
    this.password
  );

  this.authService
    .login(this.username, this.password)
    .subscribe(response => {

      console.log(
        'token:',
        response.accessToken
      );

    });
}
```

### ایرادها؟

اطلاعات حساس Log شده‌اند:

```text
Password
Token
```

### جواب

```ts
login(): void {

  this.authService
    .login(
      this.username,
      this.password
    )
    .subscribe({
      next: response => {
        // handle successful login
      },

      error: () => {
        // show generic error message
      }
    });
}
```

### نکته

در Error Message هم اطلاعات داخلی Server را بی‌دلیل به کاربر نمایش نده.

بد:

```ts
this.errorMessage =
  error.stack;
```

بهتر:

```ts
this.errorMessage =
  'ورود با خطا مواجه شد.';
```

---

# 19) XSRF / CSRF خیلی ساده

فرض کن User وارد سایت بانک شده است.

Browser Cookie احراز هویت را دارد.

User وارد یک سایت مخرب می‌شود و آن سایت تلاش می‌کند Request تغییر وضعیت به سایت بانک ارسال کند.

این همان سناریویی است که CSRF/XSRF می‌تواند مطرح شود.

Angular `HttpClient` برای مکانیزم رایج XSRF پشتیبانی دارد.

به‌صورت پیش‌فرض نام‌های رایج Angular:

```text
Cookie:
XSRF-TOKEN

Header:
X-XSRF-TOKEN
```

برای Requestهای mutating به same-origin/relative URL، Angular می‌تواند Token را از Cookie بخواند و Header را اضافه کند.

اما:

> Backend باید Cookie/Token را تولید و Header را validate کند.

Frontend به‌تنهایی کافی نیست.

---

# 20) اگر Backend نام XSRF متفاوت داشت

مثلاً Backend می‌گوید:

```text
Cookie:
MY-XSRF

Header:
X-MY-XSRF
```

می‌توانیم HttpClient را تنظیم کنیم:

```ts
provideHttpClient(
  withXsrfConfiguration({
    cookieName: 'MY-XSRF',
    headerName: 'X-MY-XSRF'
  })
)
```

این بخش برای سؤال پیشرفته‌تر است؛ برای مرور اولیه فقط مفهوم XSRF را بفهم.

---

# 21) CSP چیست؟

Content Security Policy یک لایه دفاعی اضافه در برابر XSS است.

CSP از طریق HTTP Header سمت Server تنظیم می‌شود.

به زبان ساده:

```text
Browser
 ↓
CSP Header
 ↓
چه Script/Style/Resourceهایی اجازه اجرا دارند؟
```

برای آزمون اگر سؤال تئوری بود، کافی است بگویی:

> CSP یک Defense-in-depth در برابر XSS است و باید در Server/Hosting تنظیم شود.

Angular همچنین استفاده از Trusted Types را برای تقویت محافظت در برابر XSS توصیه می‌کند.

---

# 22) Dependency Security

Package قدیمی می‌تواند Vulnerability داشته باشد.

برای بررسی اولیه:

```bash
npm audit
```

و:

```bash
npm outdated
```

اما:

```bash
npm audit fix
```

را در پروژه آزمون **کورکورانه اجرا نکن**؛ ممکن است نسخه Dependencyها را تغییر دهد و پروژه را خراب کند.

اول گزارش را بخوان.

### نکته امتحانی

```text
npm audit
→ پیدا کردن vulnerabilityهای شناخته‌شده
```

---

# 23) Production Security Checklist

اگر سؤال گفت:

> مشکلات امنیتی پروژه را پیدا کنید.

این موارد را سریع بررسی کن:

```text
[ ] console.log(token/password) وجود دارد؟
[ ] Secret داخل source code نوشته شده؟
[ ] user input با innerHTML نمایش داده شده؟
[ ] bypassSecurityTrust... روی داده غیرقابل اعتماد استفاده شده؟
[ ] DOM مستقیم دستکاری شده؟
[ ] Route حساس Guard دارد؟
[ ] Backend authorization در طراحی در نظر گرفته شده؟
[ ] Authorization Header در یک Interceptor مدیریت می‌شود؟
[ ] Dependencyهای آسیب‌پذیر وجود دارند؟
[ ] CSP / Trusted Types برای Production قابل بررسی است؟
```

---

# 24) یک سؤال ترکیبی شبیه آزمون

## صورت سؤال

پروژه زیر برای نمایش Profile کاربر نوشته شده است:

```ts
export class ProfileComponent {

  profileHtml!: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  loadProfile(): void {

    const token =
      localStorage.getItem('token');

    console.log(
      'TOKEN:',
      token
    );

    this.http.get<any>(
      '/api/profile',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )
    .subscribe(profile => {

      this.profileHtml =
        this.sanitizer
          .bypassSecurityTrustHtml(
            profile.bio
          );

    });
  }
}
```

HTML:

```html
<div [innerHTML]="profileHtml"></div>
```

### خواسته

حداقل سه مشکل امنیتی پیدا کنید و کد را بهتر کنید.

---

# 25) تحلیل سؤال ترکیبی

### مشکل ۱

```ts
console.log(token)
```

Token نباید Log شود.

### مشکل ۲

Authorization در Component نوشته شده.

بهتر است Interceptor مسئول آن باشد.

### مشکل ۳

```ts
bypassSecurityTrustHtml(profile.bio)
```

اگر `bio` از User یا API غیرقابل اعتماد آمده باشد، نباید کورکورانه trusted شود.

اگر Bio فقط متن است:

```html
<p>{{ profile.bio }}</p>
```

کافی است.

### مشکل ۴

Component مستقیماً HTTP را مدیریت می‌کند.

از نظر Separation of Concerns بهتر است API داخل Service باشد. این مورد بیشتر معماری است تا آسیب‌پذیری مستقیم، ولی کد را قابل کنترل و تست‌تر می‌کند.

---

# 26) نسخه بهتر سؤال ترکیبی

Service:

```ts
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private http: HttpClient
  ) {}

  getProfile():
    Observable<Profile> {

    return this.http.get<Profile>(
      '/api/profile'
    );
  }
}
```

Interceptor:

```ts
export const authInterceptor:
  HttpInterceptorFn = (req, next) => {

  const token =
    localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization:
          `Bearer ${token}`
      }
    })
  );
};
```

Component:

```ts
export class ProfileComponent {

  profile?: Profile;

  constructor(
    private profileService:
      ProfileService
  ) {}

  loadProfile(): void {

    this.profileService
      .getProfile()
      .subscribe(profile => {

        this.profile = profile;

      });
  }
}
```

HTML:

```html
@if (profile) {

  <h2>
    {{ profile.name }}
  </h2>

  <p>
    {{ profile.bio }}
  </p>

}
```

### نتیجه

```text
Token Log
→ حذف

Authorization Header
→ Interceptor

API Logic
→ Service

User Bio
→ Interpolation

bypassSecurityTrustHtml
→ حذف
```

این یک جواب بسیار مناسب برای سؤال عملی Security است.

---

# 27) چند دام امتحانی

## دام ۱

```ts
bypassSecurityTrustHtml(userInput)
```

فکر نکنی این متد داده را sanitize می‌کند.

---

## دام ۲

```ts
environment.secretKey
```

فکر نکنی چون در `environment.ts` است، Secret شده.

Frontend Build برای کاربر قابل دریافت است.

---

## دام ۳

```text
Route Guard
```

فکر نکنی API را امن می‌کند.

Backend باید Authorization را enforce کند.

---

## دام ۴

فکر نکنی:

```text
HTTPS
```

به‌تنهایی XSS را حل می‌کند.

HTTPS ارتباط را در مسیر محافظت می‌کند؛ XSS مسئله دیگری است.

---

## دام ۵

فکر نکنی فقط حذف `console.log` یعنی Security کامل شده.

Security چند لایه دارد.

---

# 28) Cheat Sheet خیلی کوتاه

اگر دیدی:

```ts
console.log(token)
```

جواب:

```text
حذف
```

اگر دیدی:

```ts
bypassSecurityTrustHtml(userInput)
```

جواب:

```text
خطر XSS
→ حذف bypass
→ ترجیح interpolation
```

اگر دیدی:

```ts
document...innerHTML = userInput
```

جواب:

```text
Direct DOM manipulation خطرناک
→ Angular binding
```

اگر دیدی Authorization در همه Serviceها تکرار شده:

```text
HTTP Interceptor
```

اگر Route حساس بود:

```text
Guard
+
Backend Authorization
```

اگر Secret داخل Angular بود:

```text
حذف از Frontend
→ Secret باید Server-side باشد
```

اگر سؤال CSRF/XSRF بود:

```text
Angular HttpClient XSRF support
+
Backend validation
```

اگر سؤال Production Security بود:

```text
CSP
Trusted Types
AOT
Dependency updates
```

---

# 29) فرمول ذهنی Security برای آزمون

هر وقت کد Security دیدی، این ۵ سؤال را از خودت بپرس:

```text
1. آیا داده User مستقیم وارد DOM شده؟

2. آیا Token / Password / Secret لو می‌رود؟

3. آیا Authentication/Authorization درست مدیریت شده؟

4. آیا Requestهای HTTP یک نقطه مرکزی مثل Interceptor دارند؟

5. آیا Backend هم امنیت را enforce می‌کند؟
```

اگر همین پنج مورد را بررسی کنی، بخش بزرگی از سؤال‌های معمول Security در Angular را می‌توانی تشخیص بدهی.

---

# 30) چیزی که برای امتحان حتماً بلد باش

اولویت یادگیری:

```text
XSS + interpolation
        ↓
خطر bypassSecurityTrust
        ↓
Token / Sensitive Logs
        ↓
HTTP Interceptor
        ↓
Route Guard
        ↓
CSRF/XSRF
        ↓
CSP / Trusted Types
```

اگر وقت کم داری، **چهار مورد اول** را خیلی خوب یاد بگیر. معمولاً برای یک سؤال عملی Angular Security، همین‌ها پایه بسیار خوبی هستند.
