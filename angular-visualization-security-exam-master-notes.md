# Angular Visualization + Security --- جزوه جامع آزمون

> مناسب Angular 20/21 --- شامل مطالب تشریحی، نکات نمره‌گیر، چالش‌های آسان
> تا سخت و جواب.

# بخش اول: Visualization

## 1) Visualization چیست؟

Visualization یعنی تبدیل داده خام به نمایش بصری قابل فهم. هدف فقط زیبایی
نیست؛ نمودار باید مقایسه، روند و وضعیت داده را سریع‌تر قابل درک کند.

انتخاب رایج:

-   **Bar Chart**: مقایسه چند مقدار.
-   **Line Chart**: روند در طول زمان.
-   **Pie/Doughnut**: سهم چند بخش از کل؛ برای Categoryهای زیاد مناسب
    نیست.
-   **Progress Bar**: یک مقدار نسبت به یک محدوده، مثل 70%.
-   **Table + Chart**: وقتی کاربر هم جزئیات عددی و هم نمای کلی می‌خواهد.

مدل ذهنی:

``` text
API/Data
  ↓
Service
  ↓
Component
  ↓
Transform / Aggregate
  ↓
Chart
```

در جواب تشریحی می‌توان نوشت:

> در Visualization ابتدا نوع نمودار را بر اساس ماهیت داده انتخاب می‌کنم.
> منطق دریافت داده را در Service نگه می‌دارم، داده را قبل از Render آماده
> می‌کنم و Loading، Error و Empty State را مدیریت می‌کنم. نمودار باید
> Responsive و Accessible باشد و برای داده‌های بزرگ از Aggregate،
> Pagination یا کاهش Data Point استفاده شود.

------------------------------------------------------------------------

## 2) ساده‌ترین نمودار بدون Library

``` ts
sales = [
  { name: 'Laptop', value: 80 },
  { name: 'Mobile', value: 50 },
  { name: 'Tablet', value: 30 }
];
```

``` html
@for (item of sales; track item.name) {
  <div class="chart-row">
    <span>{{ item.name }}</span>

    <div class="bar-container">
      <div
        class="bar"
        [style.width.%]="item.value">
      </div>
    </div>

    <span>{{ item.value }}%</span>
  </div>
}
```

``` scss
.chart-row {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.bar-container {
  height: 20px;
  background: #eee;
  overflow: hidden;
  border-radius: 4px;
}

.bar {
  height: 100%;
  background: #555;
}
```

این راه‌حل برای سؤال ساده Visualization کاملاً قابل دفاع است و Dependency
جدید هم نمی‌خواهد.

------------------------------------------------------------------------

## 3) چالش آسان: Progress Bar

### سؤال

``` ts
progress = 65;
```

آن را به شکل Progress Bar قابل دسترس نمایش بده.

### جواب

``` html
<div
  class="progress"
  role="progressbar"
  aria-label="Download progress"
  aria-valuemin="0"
  aria-valuemax="100"
  [attr.aria-valuenow]="progress">

  <div
    class="progress-value"
    [style.width.%]="progress">
  </div>
</div>

<span>{{ progress }}%</span>
```

``` scss
.progress {
  width: 100%;
  height: 20px;
  background: #eee;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background: #555;
  transition: width 300ms ease;
}
```

**توضیح امتحانی:** با Property Binding مقدار `progress` به درصد عرض متصل
شده است. برای Screen Reader نیز `role="progressbar"` و مقادیر ARIA قرار
داده شده‌اند.

------------------------------------------------------------------------

## 4) Normalization

اگر داده این باشد:

``` ts
sales = [
  { name: 'A', value: 100 },
  { name: 'B', value: 300 },
  { name: 'C', value: 200 }
];
```

نمی‌توان مستقیم `300%` به عرض داد. باید Normalize کنیم:

``` ts
const max = Math.max(...this.sales.map(x => x.value));

this.chartData = this.sales.map(item => ({
  ...item,
  percentage: max === 0
    ? 0
    : (item.value / max) * 100
}));
```

بعد:

``` html
<div
  class="bar"
  [style.width.%]="item.percentage">
</div>
```

**نکته:** اگر لیست بزرگ است، محاسبه را از قبل انجام بده و Method
محاسباتی را در Template مرتب صدا نزن.

------------------------------------------------------------------------

## 5) چالش متوسط: Visualization از API

### سؤال

API:

``` ts
[
  { status: 'Success', count: 80 },
  { status: 'Failed', count: 20 },
  { status: 'Pending', count: 40 }
]
```

### Interface

``` ts
export interface StatusReport {
  status: string;
  count: number;
}
```

### Service

``` ts
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getStatusReport(): Observable<StatusReport[]> {
    return this.http.get<StatusReport[]>(
      '/api/report/status'
    );
  }
}
```

### Component

``` ts
reports: StatusReport[] = [];
loading = false;
errorMessage = '';

load(): void {
  this.loading = true;

  this.reportService
    .getStatusReport()
    .subscribe({
      next: data => {
        this.reports = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load report';
        this.loading = false;
      }
    });
}
```

### Template

``` html
@if (loading) {
  <p>Loading...</p>
} @else if (errorMessage) {
  <p>{{ errorMessage }}</p>
} @else if (reports.length === 0) {
  <p>No data available.</p>
} @else {
  @for (item of reports; track item.status) {
    <div>
      {{ item.status }} — {{ item.count }}
    </div>
  }
}
```

**نکته نمره‌گیر:** Visualization فقط Success نیست؛
`Loading + Error + Empty + Success` را در نظر بگیر.

------------------------------------------------------------------------

## 6) Responsive و Accessibility

برای Responsive:

``` scss
.chart-container {
  width: 100%;
  overflow-x: auto;
}
```

در نمودارهای Canvas بهتر است Container ابعاد Responsive داشته باشد.

برای Accessibility فقط رنگ کافی نیست:

``` text
بد:
سبز
قرمز

بهتر:
Success — 80
Failed — 20
```

یعنی:

``` text
Color + Label + Number
```

در Angular برای ARIAهای Dynamic از Attribute Binding استفاده کن، مثلاً:

``` html
<div [attr.aria-label]="chartLabel"></div>
```

------------------------------------------------------------------------

## 7) Chart.js --- اگر Library در پروژه بود

قبل از نصب Library جدید `package.json` را بررسی کن. اگر Chart.js از قبل
وجود داشت:

``` ts
import Chart from 'chart.js/auto';
```

HTML:

``` html
<div class="chart-wrapper">
  <canvas #salesChart></canvas>
</div>
```

``` scss
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
}
```

Component:

``` ts
@ViewChild('salesChart', { static: true })
salesChart!: ElementRef<HTMLCanvasElement>;

private chart?: Chart;

ngAfterViewInit(): void {
  this.chart = new Chart(
    this.salesChart.nativeElement,
    {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
          label: 'Sales',
          data: [100, 250, 170]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  );
}

ngOnDestroy(): void {
  this.chart?.destroy();
}
```

نکته مهم:

``` text
Create Chart
→ Use
→ Destroy
```

`destroy()` برای Cleanup referenceها و event listenerهای Chart مهم است.

اگر Data عوض شد:

``` ts
this.chart.data.labels =
  newData.map(x => x.label);

this.chart.data.datasets[0].data =
  newData.map(x => x.value);

this.chart.update();
```

------------------------------------------------------------------------

## 8) چالش سخت: Search + Visualization

### کد بد

``` ts
this.searchControl.valueChanges
  .subscribe(value => {

    this.reportService
      .search(value)
      .subscribe(data => {
        this.reports = data;
      });

  });
```

مشکل:

-   Nested Subscribe
-   Request زیاد هنگام تایپ
-   Race condition
-   Response قدیمی ممکن است دیرتر برسد.

### جواب

``` ts
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(value =>
      this.reportService.search(value ?? '')
    )
  )
  .subscribe(data => {
    this.reports = data;
  });
```

حفظ کن:

``` text
debounceTime
→ کم کردن Request هنگام تایپ

distinctUntilChanged
→ مقدار تکراری را نفرست

switchMap
→ آخرین Request مهم است
```

------------------------------------------------------------------------

## 9) چالش سخت: چند API برای Dashboard

سه API مستقل:

``` text
/api/sales
/api/users
/api/orders
```

جواب:

``` ts
forkJoin({
  sales: this.reportService.getSales(),
  users: this.reportService.getUsers(),
  orders: this.reportService.getOrders()
})
.subscribe(result => {
  this.sales = result.sales;
  this.users = result.users;
  this.orders = result.orders;
});
```

مدل:

``` text
Sales  ──┐
Users  ──┼→ forkJoin → Dashboard
Orders ──┘
```

برای HTTPهای مستقل که باید همگی کامل شوند، `forkJoin` انتخاب خوبی است.

------------------------------------------------------------------------

## 10) چالش سخت: Data بسیار زیاد

اگر 100,000 رکورد برای Chart داریم:

``` text
100,000 raw records
        ↓
کندی
```

راه‌حل‌ها:

-   Server-side aggregation
-   Pagination
-   نمایش بازه موردنیاز
-   کاهش Data Point
-   Lazy Loading
-   عدم محاسبه سنگین در Template
-   `track` برای List
-   جلوگیری از Render غیرضروری

مثلاً:

``` text
100,000 transactions
        ↓
Backend aggregation
        ↓
12 monthly totals
        ↓
Chart
```

------------------------------------------------------------------------

## 11) پاسخ تشریحی آماده Visualization

> Visualization برای تبدیل داده خام به نمایش قابل فهم استفاده می‌شود. نوع
> نمودار را بر اساس نوع داده انتخاب می‌کنم؛ Bar Chart برای مقایسه، Line
> Chart برای روند زمانی و Pie/Doughnut برای سهم از کل مناسب است. دریافت
> داده را در Service قرار می‌دهم و Component را مسئول آماده‌سازی داده و
> نمایش نگه می‌دارم. Loading، Error و Empty State را مدیریت می‌کنم. برای
> Performance از محاسبات سنگین در Template جلوگیری می‌کنم و برای داده‌های
> بزرگ از Aggregation، Pagination یا کاهش Data Point استفاده می‌کنم.
> نمودار باید Responsive باشد و برای Accessibility اطلاعات فقط با رنگ
> منتقل نشوند؛ Label، مقدار عددی و ARIA مناسب نیز باید در نظر گرفته
> شوند.

------------------------------------------------------------------------

## 12) Cheat Sheet Visualization

``` text
Compare → Bar
Trend → Line
Part of whole → Pie/Doughnut
Percentage → Progress

API → Service
Search → debounceTime + distinctUntilChanged + switchMap
Multiple HTTP → forkJoin
Large Data → Aggregate / Paginate
List → track
Responsive → Responsive Container
A11y → Label + Value + ARIA
Chart instance → destroy()
```

------------------------------------------------------------------------

# بخش دوم: Security

## 13) Security در Angular

موضوعات مهم:

``` text
XSS
Unsafe DOM Manipulation
Token Exposure
Authentication
Authorization
Route Guard
HTTP Interceptor
CSRF / XSRF
CSP
Trusted Types
Dependency Security
```

اصل مهم:

> Frontend به‌تنهایی Security Boundary نیست. Authorization واقعی API باید
> در Backend نیز بررسی شود.

------------------------------------------------------------------------

## 14) XSS

XSS یعنی داده مخرب بتواند وارد DOM شود و کد اجرا کند.

مثلاً:

``` html
<img src="x" onerror="alert('hacked')">
```

Angular مقادیر Template Binding را به‌صورت پیش‌فرض untrusted در نظر می‌گیرد
و در context مناسب آن‌ها را sanitize/escape می‌کند.

اگر فقط Text لازم داری:

``` html
<p>{{ userComment }}</p>
```

معمولاً از Render کردن HTML بی‌دلیل بهتر است.

------------------------------------------------------------------------

## 15) `innerHTML` و `bypassSecurityTrustHtml`

این کد حساس است:

``` html
<div [innerHTML]="userInput"></div>
```

و این کد خطرناک‌تر می‌شود اگر ورودی غیرقابل اعتماد را دستی trusted کنیم:

``` ts
this.safeValue =
  this.sanitizer
    .bypassSecurityTrustHtml(userInput);
```

نکته بسیار مهم:

``` text
bypassSecurityTrustHtml
≠ sanitize

bypassSecurityTrustHtml
= Angular، من خودم به این مقدار اعتماد دارم
```

پس روی User Input کورکورانه استفاده نکن.

اگر فقط متن است:

``` html
<div>{{ userInput }}</div>
```

------------------------------------------------------------------------

## 16) Direct DOM Manipulation

با احتیاط:

``` ts
document
  .getElementById('content')!
  .innerHTML = userInput;
```

یا:

``` ts
elementRef.nativeElement.innerHTML =
  userInput;
```

تا جای ممکن Angular Template Binding را ترجیح بده.

------------------------------------------------------------------------

## 17) Token / Password / Secret

بد:

``` ts
console.log('token', token);
console.log('password', password);
```

همچنین Secret واقعی را در Frontend نگذار:

``` ts
export const environment = {
  secretKey: 'SUPER_SECRET'
};
```

حفظ کن:

``` text
environment.ts
≠ Secret Storage
```

Frontend bundle به Browser ارسال می‌شود.

------------------------------------------------------------------------

## 18) HTTP Interceptor

اگر Authorization در چند Service تکرار شده:

``` ts
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
        Authorization: `Bearer ${token}`
      }
    })
  );
};
```

Config:

``` ts
provideHttpClient(
  withInterceptors([
    authInterceptor
  ])
)
```

مدل:

``` text
Request
  ↓
Interceptor
  ↓
Authorization Header
  ↓
Backend
```

------------------------------------------------------------------------

## 19) نکته localStorage

در پروژه‌های تمرینی Token ممکن است در `localStorage` باشد، اما در پاسخ
تشریحی بدان:

``` text
localStorage
→ JavaScript can read it
→ XSS can expose it
```

پس می‌توان نوشت:

> ذخیره Token در localStorage در برابر XSS ریسک دارد. روش نگهداری Token
> باید با معماری Authentication و Backend هماهنگ باشد. در معماری‌های
> Cookie-based، Cookie امن با `HttpOnly`, `Secure` و `SameSite` می‌تواند
> دسترسی مستقیم JavaScript به Token را محدود کند.

------------------------------------------------------------------------

## 20) Route Guard

``` ts
export const authGuard:
  CanActivateFn = () => {

  const router = inject(Router);
  const token =
    localStorage.getItem('token');

  return token
    ? true
    : router.createUrlTree(['/login']);
};
```

Route:

``` ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

اما مهم‌ترین جمله:

> Route Guard جای Server-side Authorization را نمی‌گیرد.

------------------------------------------------------------------------

## 21) Authentication vs Authorization

``` text
Authentication
→ تو چه کسی هستی؟

Authorization
→ اجازه انجام چه کاری داری؟
```

مثال:

``` text
Login
→ Authentication

Admin Permission
→ Authorization
```

------------------------------------------------------------------------

## 22) CSRF / XSRF

Angular `HttpClient` برای الگوی رایج XSRF پشتیبانی دارد. نام‌های پیش‌فرض
رایج:

``` text
Cookie:
XSRF-TOKEN

Header:
X-XSRF-TOKEN
```

اما Server باید Token/Header را validate کند.

پاسخ تشریحی:

> XSRF فقط با Frontend حل نمی‌شود. Angular HttpClient می‌تواند در
> Requestهای مناسب Token را از Cookie خوانده و Header ارسال کند، اما
> اعتبارسنجی اصلی باید در Backend انجام شود.

------------------------------------------------------------------------

## 23) CSP و Trusted Types

**CSP** یک Defense-in-depth برای محدود کردن منابع و Scriptهای قابل
اجراست و معمولاً با HTTP Header سمت Server تنظیم می‌شود.

**Trusted Types** نیز یک لایه Browser-level برای کاهش DOM-based XSS است.

پاسخ کوتاه:

> برای Production علاوه بر sanitization Angular می‌توان CSP و Trusted
> Types را به‌عنوان لایه‌های دفاعی اضافه در برابر XSS در نظر گرفت.

------------------------------------------------------------------------

## 24) AOT و Security

در Production از AOT استفاده کن و Template را با User Input به شکل
Dynamic تولید نکن.

پاسخ:

> Angular Template را executable code در نظر می‌گیرد. استفاده از AOT در
> Production و جلوگیری از ساخت Dynamic Template با ورودی کاربر ریسک
> Template Injection را کاهش می‌دهد.

------------------------------------------------------------------------

## 25) Dependency Security

``` bash
npm audit
npm outdated
```

اما در آزمون `npm audit fix` را بدون بررسی اجرا نکن، چون ممکن است
Dependencyها تغییر کنند و پروژه خراب شود.

------------------------------------------------------------------------

## 26) چالش آسان Security

### سؤال

``` ts
login(): void {
  console.log(this.password);

  this.authService.login()
    .subscribe(result => {
      console.log(result.accessToken);
    });
}
```

### جواب

``` ts
login(): void {
  this.authService.login()
    .subscribe({
      next: result => {
        // Handle login result
      },
      error: () => {
        this.errorMessage = 'Login failed';
      }
    });
}
```

مشکل‌ها:

``` text
Password Log
Token Log
Sensitive Data Exposure
```

------------------------------------------------------------------------

## 27) چالش متوسط XSS

### سؤال

``` ts
showComment(comment: string): void {
  this.safeComment =
    this.sanitizer
      .bypassSecurityTrustHtml(comment);
}
```

``` html
<div [innerHTML]="safeComment"></div>
```

`comment` از User آمده.

### جواب

اگر فقط Text است:

``` ts
comment = '';

showComment(value: string): void {
  this.comment = value;
}
```

``` html
<div>{{ comment }}</div>
```

توضیح:

``` text
Untrusted User Input
→ bypass نکن
→ برای Text از interpolation استفاده کن
```

------------------------------------------------------------------------

## 28) چالش متوسط Authorization

### سؤال

در چند Service این کد تکرار شده:

``` ts
const token =
  localStorage.getItem('token');

return this.http.get(
  '/api/orders',
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
```

### جواب

Authorization را به Interceptor منتقل کن و Service را ساده نگه دار:

``` ts
getOrders(): Observable<Order[]> {
  return this.http.get<Order[]>(
    '/api/orders'
  );
}
```

------------------------------------------------------------------------

## 29) چالش سخت Security --- Code Review

### کد

``` ts
export class ProfileComponent {

  profileHtml!: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  loadProfile(): void {

    const token =
      localStorage.getItem('token');

    console.log('TOKEN:', token);

    this.http.get<any>(
      '/api/profile',
      {
        headers: {
          Authorization: `Bearer ${token}`
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

### مشکلات

1.  Token در Console چاپ شده.
2.  Authorization داخل Component مدیریت شده؛ بهتر است Interceptor باشد.
3.  HTTP logic بهتر است داخل Service باشد.
4.  `profile.bio` بدون دلیل با `bypassSecurityTrustHtml` trusted شده.
5.  اگر Bio فقط Text است، `innerHTML` اصلاً لازم نیست.

### نسخه بهتر

Service:

``` ts
@Injectable({ providedIn: 'root' })
export class ProfileService {

  private http = inject(HttpClient);

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(
      '/api/profile'
    );
  }
}
```

Component:

``` ts
profile?: Profile;

loadProfile(): void {
  this.profileService
    .getProfile()
    .subscribe(profile => {
      this.profile = profile;
    });
}
```

Template:

``` html
@if (profile) {
  <h2>{{ profile.name }}</h2>
  <p>{{ profile.bio }}</p>
}
```

و Authorization در Interceptor قرار می‌گیرد.

------------------------------------------------------------------------

## 30) چالش سخت Role Guard

``` ts
export const adminGuard:
  CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  return router.createUrlTree([
    '/forbidden'
  ]);
};
```

``` ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}
```

در توضیح حتماً بنویس:

> Backend نیز باید Role و Permission را برای API بررسی کند.

------------------------------------------------------------------------

## 31) پاسخ تشریحی آماده Security

> Angular برای کاهش XSS، داده‌های Template Binding را به‌صورت پیش‌فرض
> untrusted در نظر می‌گیرد و در contextهای مناسب آن‌ها را sanitize یا
> escape می‌کند. برای نمایش Text از interpolation استفاده می‌کنم و از
> `bypassSecurityTrust...` روی ورودی غیرقابل اعتماد خودداری می‌کنم.
> همچنین از دستکاری مستقیم DOM تا حد امکان اجتناب می‌کنم. Token، Password
> و Secret نباید در Console یا Frontend Source Code قرار گیرند. برای
> اضافه کردن Authorization Header می‌توان از HTTP Interceptor و برای
> Routeهای محافظت‌شده از Guard استفاده کرد، اما Authorization واقعی باید
> در Backend نیز enforce شود. برای Production می‌توان CSP، Trusted Types،
> AOT و به‌روزرسانی Dependencyها را نیز در نظر گرفت.

------------------------------------------------------------------------

# بخش سوم: سؤال ترکیبی Visualization + Security

## 32) صورت سؤال

API:

``` ts
[
  {
    id: 1,
    title: '<b>Transfer</b>',
    amount: 200
  },
  {
    id: 2,
    title: '<img src=x onerror=alert(1)>',
    amount: 500
  }
]
```

Template فعلی:

``` html
@for (
  item of transactions;
  track $index
) {

  <div [innerHTML]="item.title"></div>

  <div
    class="bar"
    [style.width.px]="item.amount">
  </div>

}
```

### مشکلات

**Security:** `title` داده API است و HTML Render می‌شود. اگر Title فقط
متن است:

``` html
<span>{{ item.title }}</span>
```

**Visualization:** مقدار `amount` نباید بدون Normalize به Pixel تبدیل
شود.

**Tracking:** اگر `id` داریم:

``` html
@for (item of chartData; track item.id)
```

**Accessibility:** مقدار عددی را کنار Bar نمایش بده.

**Responsive:** درصد نسبت به Container بهتر از Pixel خام است.

### تبدیل داده

``` ts
const max = Math.max(
  ...this.transactions.map(x => x.amount)
);

this.chartData =
  this.transactions.map(item => ({
    ...item,
    percentage:
      max === 0
        ? 0
        : (item.amount / max) * 100
  }));
```

### Template بهتر

``` html
@for (item of chartData; track item.id) {

  <div class="chart-row">

    <span>{{ item.title }}</span>

    <div class="bar-container">
      <div
        class="bar"
        [style.width.%]="item.percentage">
      </div>
    </div>

    <span>{{ item.amount }}</span>

  </div>
}
```

این سؤال هم‌زمان می‌تواند این موارد را بسنجد:

``` text
Security
Visualization
Performance
Accessibility
Angular Template
```

------------------------------------------------------------------------

# 33) Checklist سریع Code Review

## Visualization

``` text
[ ] نوع Chart مناسب است؟
[ ] داده قبل از Render آماده شده؟
[ ] Loading مدیریت شده؟
[ ] Error مدیریت شده؟
[ ] Empty State داریم؟
[ ] Responsive است؟
[ ] فقط به Color وابسته نیست؟
[ ] Label/Number/ARIA داریم؟
[ ] محاسبه سنگین در Template نیست؟
[ ] List از track مناسب استفاده می‌کند؟
[ ] Chart instance cleanup می‌شود؟
```

## Security

``` text
[ ] console.log(token/password) داریم؟
[ ] Secret در Source Code داریم؟
[ ] innerHTML روی داده خارجی داریم؟
[ ] bypassSecurityTrust... روی User Input داریم؟
[ ] document/ElementRef/nativeElement خطرناک داریم؟
[ ] Authorization تکراری است؟
[ ] Route حساس Guard دارد؟
[ ] Backend Authorization هم لازم است؟
[ ] Error داخلی مستقیم نمایش داده می‌شود؟
[ ] Dependencyها بررسی شده‌اند؟
```

------------------------------------------------------------------------

# 34) ده جمله نمره‌گیر

1.  «Bar Chart برای مقایسه و Line Chart برای نمایش روند زمانی مناسب
    است.»
2.  «Visualization باید Loading، Error، Empty و Success State را مدیریت
    کند.»
3.  «برای داده زیاد، از Aggregation/Pagination و کاهش Data Point استفاده
    می‌کنم.»
4.  «اطلاعات نباید فقط با Color منتقل شوند؛ Label و مقدار عددی هم لازم
    است.»
5.  «محاسبات سنگین را داخل Template قرار نمی‌دهم.»
6.  «Angular داده‌های Template Binding را به‌صورت پیش‌فرض untrusted در نظر
    می‌گیرد.»
7.  «`bypassSecurityTrust...` sanitization نیست و روی ورودی غیرقابل
    اعتماد نباید کورکورانه استفاده شود.»
8.  «Token، Password و Secret نباید Log یا Hard-code شوند.»
9.  «Route Guard جای Backend Authorization را نمی‌گیرد.»
10. «CSP، Trusted Types، AOT و Dependency Updates لایه‌های مهم Security
    در Production هستند.»

------------------------------------------------------------------------

# 35) مرور 5 دقیقه‌ای قبل از امتحان

## Visualization

``` text
Bar = Compare
Line = Trend
Pie = Part of Whole
Progress = Percentage

API → Service
Search → debounceTime + switchMap
Multiple API → forkJoin
Large Data → Aggregate
Responsive → Container
A11y → Label + Number + ARIA
Chart → destroy()
```

## Security

``` text
Text → {{ value }}

innerHTML → حساس

bypassSecurityTrust...
→ Trust، نه Sanitize

Token / Password
→ Log نکن

Secret
→ Frontend نگذار

Authorization
→ Interceptor

Route
→ Guard

Guard
≠ Backend Security

XSRF
→ Client support + Server validation

Production
→ AOT + CSP + Trusted Types
```

------------------------------------------------------------------------

# 36) برنامه پیشنهادی برای سؤال یک‌ساعته

## اگر Visualization بود

``` text
0–10 min  → Requirement و Data
10–20 min → Interface / Service
20–35 min → Visualization اصلی
35–45 min → Loading / Error / Empty
45–52 min → Responsive / Accessibility
52–60 min → Run / Build / Review
```

## اگر Security بود

``` text
0–10 min  → Scan: token / innerHTML / bypass / DOM / guard
10–25 min → رفع خطر اصلی
25–40 min → Interceptor / Guard / Service
40–50 min → Error handling و cleanup
50–60 min → Run / Build / Security review
```

هدف در آزمون این است که ابتدا **ساده‌ترین راه‌حل درست و قابل اجرا** را
تحویل بدهی و بعد، اگر زمان باقی ماند، آن را حرفه‌ای‌تر کنی.
