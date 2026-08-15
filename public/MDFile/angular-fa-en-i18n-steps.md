# دوزبانه کردن پروژه Angular (فارسی و انگلیسی)

این فایل خلاصه‌ی مراحلی است که برای دوزبانه کردن پروژه‌ی `expert-angular-lab` و صفحه‌ی جمع دو عدد انجام دادیم.

## 1. نصب ngx-translate

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

## 2. ساخت فایل‌های ترجمه

در پروژه این ساختار را ایجاد کردیم:

```text
public/
└── i18n/
    ├── fa.json
    └── en.json
```

### `fa.json`

```json
{
  "MENU": {
    "SUM": "جمع اعداد"
  },
  "SUM": {
    "TITLE": "جمع دو عدد",
    "FIRST_NUMBER": "عدد اول",
    "SECOND_NUMBER": "عدد دوم",
    "CALCULATE": "محاسبه",
    "RESULT": "نتیجه"
  }
}
```

### `en.json`

```json
{
  "MENU": {
    "SUM": "Add Numbers"
  },
  "SUM": {
    "TITLE": "Add Two Numbers",
    "FIRST_NUMBER": "First Number",
    "SECOND_NUMBER": "Second Number",
    "CALCULATE": "Calculate",
    "RESULT": "Result"
  }
}
```

## 3. تنظیم TranslateService در `app.config.ts`

```ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'fa',
      lang: 'fa'
    })
  ]
};
```

## 4. اضافه کردن `TranslatePipe` به کامپوننت‌های standalone

هر کامپوننتی که در HTML آن از `| translate` استفاده می‌کند، باید `TranslatePipe` را import کند.

مثلاً در `sum.ts`:

```ts
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sum',
  imports: [
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './sum.html',
  styleUrl: './sum.scss'
})
export class Sum {
  // ...
}
```

همین کار برای `App` هم انجام شد چون در Navbar از pipe ترجمه استفاده کردیم:

```ts
imports: [
  RouterOutlet,
  RouterLink,
  TranslatePipe
]
```

## 5. استفاده از کلیدهای ترجمه در HTML

مثلاً در `sum.html`:

```html
<h2>{{ 'SUM.TITLE' | translate }}</h2>

<input
  type="number"
  [(ngModel)]="firstNumber"
  [placeholder]="'SUM.FIRST_NUMBER' | translate">

<input
  type="number"
  [(ngModel)]="secondNumber"
  [placeholder]="'SUM.SECOND_NUMBER' | translate">

<button (click)="calculate()">
  {{ 'SUM.CALCULATE' | translate }}
</button>

@if (result !== null) {
  <div class="result">
    <p>
      {{ 'SUM.RESULT' | translate }}:
      <strong>{{ result }}</strong>
    </p>
  </div>
}
```

## 6. تغییر زبان و جهت صفحه

در `app.ts` از `TranslateService` استفاده کردیم:

```ts
private readonly translate = inject(TranslateService);

constructor() {
  const language = localStorage.getItem('language') ?? 'fa';
  this.changeLanguage(language as 'fa' | 'en');
}

changeLanguage(language: 'fa' | 'en'): void {
  this.translate.use(language);
  localStorage.setItem('language', language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
}
```

نتیجه:

- فارسی → `dir="rtl"`
- انگلیسی → `dir="ltr"`
- زبان انتخاب‌شده در `localStorage` باقی می‌ماند.

## 7. ترجمه‌ی Navbar

`app.html`:

```html
<nav class="menu">
  <div class="language-switch">
    <button (click)="changeLanguage('fa')">
      فارسی
    </button>

    <button (click)="changeLanguage('en')">
      English
    </button>
  </div>

  <a routerLink="/sum" class="menu-link">
    {{ 'MENU.SUM' | translate }}
  </a>
</nav>

<main>
  <router-outlet></router-outlet>
</main>
```

## 8. چیدمان متفاوت منو برای فارسی و انگلیسی

خواسته‌ی نهایی این بود:

### انگلیسی

```text
[ فارسی ] [ English ]   ← 30px →   Add Numbers
```

### فارسی

```text
[ فارسی ] [ English ]                         جمع اعداد
```

یعنی دکمه‌های زبان **همیشه سمت چپ** باشند، اما:

- در انگلیسی، منو 30px بعد از دکمه‌ها قرار بگیرد.
- در فارسی، منو در سمت راست Navbar قرار بگیرد.

برای این کار `app.scss` را به شکل زیر تنظیم کردیم:

```scss
.menu {
  display: flex;
  align-items: center;

  // چیدمان خود Navbar همیشه از سمت چپ شروع می‌شود.
  direction: ltr;

  padding: 12px 20px;

  .language-switch {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    button {
      padding: 6px 12px;
      cursor: pointer;
    }
  }

  .menu-link {
    white-space: nowrap;
  }
}

// زبان انگلیسی: منو 30px بعد از دکمه‌های زبان
:host-context(html[dir='ltr']) {
  .menu-link {
    margin-left: 30px;
    margin-right: 0;
    direction: ltr;
  }
}

// زبان فارسی: منو به سمت راست هل داده می‌شود
:host-context(html[dir='rtl']) {
  .menu-link {
    margin-left: auto;
    margin-right: 0;
    direction: rtl;
  }
}
```

### نکته‌ی اصلی برای فارسی

مهم‌ترین قسمت برای قرار گرفتن منوی فارسی در سمت راست این بود:

```scss
:host-context(html[dir='rtl']) {
  .menu-link {
    margin-left: auto;
    direction: rtl;
  }
}
```

`margin-left: auto` تمام فضای خالی بین دکمه‌های زبان و لینک منو را می‌گیرد و در نتیجه لینک منو را به **سمت راست Navbar** هل می‌دهد.

از طرف دیگر، خود `.menu` همیشه `direction: ltr` دارد تا دکمه‌های `فارسی / English` بدون توجه به زبان صفحه همیشه در **سمت چپ** باقی بمانند.

## خلاصه‌ی ترتیب کار

1. نصب `ngx-translate`.
2. ساخت `fa.json` و `en.json`.
3. تنظیم `provideTranslateService` و HTTP loader.
4. اضافه کردن `TranslatePipe` به هر standalone component که از `| translate` استفاده می‌کند.
5. جایگزین کردن متن‌های hard-code با کلیدهای ترجمه.
6. ساخت `changeLanguage()` برای تغییر `fa/en`.
7. تغییر `dir` بین `rtl/ltr`.
8. ذخیره زبان در `localStorage`.
9. ثابت نگه داشتن دکمه‌های زبان در سمت چپ Navbar با `direction: ltr`.
10. استفاده از `:host-context(html[dir='rtl'])` و `margin-left: auto` برای بردن منوی فارسی به سمت راست.
11. استفاده از `margin-left: 30px` برای قرار دادن منوی انگلیسی بعد از دکمه‌های زبان.
