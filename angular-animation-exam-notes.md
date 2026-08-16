# Angular Animation — جزوه امتحانی برای Angular 20/21

این فایل برای مرور سریع **Animation در Angular 20/21** آماده شده است؛ با تمرکز روی چیزهایی که احتمال دارد در آزمون عملی از تو خواسته شود.

> نکته مهم: از Angular 20.2، پکیج قدیمی `@angular/animations` و APIهایی مثل `trigger`، `transition`، `state` و `provideAnimations` deprecated شده‌اند. برای کد جدید، Angular استفاده از **CSS animations/transitions همراه با `animate.enter` و `animate.leave`** را پیشنهاد می‌کند.

---

## 1) Animation یعنی چه؟

Animation یعنی تغییر تدریجی ظاهر یا موقعیت یک Element.

مثلاً:

```text
مخفی
 ↓
ظاهر شدن آرام
 ↓
نمایش کامل
```

یا:

```text
خارج صفحه
 ↓
حرکت
 ↓
موقعیت اصلی
```

در Angular جدید، معمولاً CSS خود Animation را انجام می‌دهد و Angular مشخص می‌کند Element چه زمانی وارد DOM یا از DOM خارج شود.

---

## 2) animate.enter

وقتی Element وارد DOM می‌شود، می‌توانی با `animate.enter` یک کلاس CSS موقت برای Animation به آن بدهی.

### مثال Fade In

TypeScript:

```ts
export class AppComponent {
  showMessage = false;

  show(): void {
    this.showMessage = true;
  }
}
```

HTML:

```html
<button (click)="show()">Show</button>

@if (showMessage) {
  <div animate.enter="fade-in">
    Welcome!
  </div>
}
```

SCSS:

```scss
.fade-in {
  animation: fadeIn 400ms ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

مدل ذهنی:

```text
Element وارد DOM می‌شود
        ↓
animate.enter
        ↓
CSS class
        ↓
Animation اجرا می‌شود
```

---

## 3) animate.leave

وقتی Element از DOM حذف می‌شود، `animate.leave` اجازه می‌دهد قبل از حذف کامل، Animation خروج اجرا شود.

HTML:

```html
<button (click)="showBox = false">Hide</button>

@if (showBox) {
  <div
    animate.enter="fade-in"
    animate.leave="fade-out">
    My Box
  </div>
}
```

SCSS:

```scss
.fade-in {
  animation: fadeIn 400ms ease;
}

.fade-out {
  animation: fadeOut 400ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

---

## 4) مثال Slide In

اگر سؤال گفت:

> یک Panel هنگام نمایش از سمت راست وارد صفحه شود.

HTML:

```html
@if (showPanel) {
  <div animate.enter="slide-in">
    Settings Panel
  </div>
}
```

SCSS:

```scss
.slide-in {
  animation: slideIn 500ms ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

یادآوری:

```text
translateX(100%)
→ خارج صفحه

translateX(0)
→ موقعیت اصلی
```

---

## 5) Slide In + Slide Out

HTML:

```html
@if (showPanel) {
  <div
    animate.enter="slide-in"
    animate.leave="slide-out">
    Settings Panel
  </div>
}
```

SCSS:

```scss
.slide-in {
  animation: slideIn 400ms ease;
}

.slide-out {
  animation: slideOut 400ms ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

---

## 6) Transition با CSS

همه Animationها نیاز به `@keyframes` ندارند. برای تغییر ساده بین دو حالت، `transition` کافی است.

مثال Button:

```html
<button class="save-button">Save</button>
```

```scss
.save-button {
  transform: scale(1);
  transition: transform 200ms ease;
}

.save-button:hover {
  transform: scale(1.05);
}
```

مدل ذهنی:

```text
Normal
→ scale(1)

Hover
→ scale(1.05)
```

---

## 7) تفاوت transition و animation

### transition

برای تغییر ساده بین دو State:

```scss
button {
  background: white;
  transition: background 300ms;
}

button:hover {
  background: gray;
}
```

### animation + keyframes

برای Animation چندمرحله‌ای:

```scss
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}
```

خلاصه:

```text
transition
→ تغییر بین دو حالت

animation / @keyframes
→ چند مرحله یا حرکت پیچیده‌تر
```

---

## 8) مثال Loading Spinner

HTML:

```html
<div class="spinner"></div>
```

SCSS:

```scss
.spinner {
  width: 30px;
  height: 30px;
  border: 4px solid #ddd;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
```

کلمه مهم:

```text
infinite
```

یعنی Animation دائماً تکرار می‌شود.

---

## 9) Duration، Delay و Timing Function

مثال:

```scss
animation: fadeIn 500ms ease-in 200ms;
```

معنی:

```text
fadeIn
→ نام Animation

500ms
→ مدت اجرا

ease-in
→ نوع سرعت حرکت

200ms
→ Delay
```

Timing Functionهای رایج:

```text
linear
ease
ease-in
ease-out
ease-in-out
```

---

## 10) Animation برای List

TypeScript:

```ts
users = [
  { id: 1, name: 'Ali' },
  { id: 2, name: 'Sara' }
];
```

HTML:

```html
@for (user of users; track user.id) {
  <div animate.enter="list-item-enter">
    {{ user.name }}
  </div>
}
```

SCSS:

```scss
.list-item-enter {
  animation: listEnter 300ms ease-out;
}

@keyframes listEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 11) مثال Modal

TypeScript:

```ts
showModal = false;

openModal(): void {
  this.showModal = true;
}

closeModal(): void {
  this.showModal = false;
}
```

HTML:

```html
<button (click)="openModal()">Open Modal</button>

@if (showModal) {
  <div class="backdrop">
    <div
      class="modal"
      animate.enter="modal-enter"
      animate.leave="modal-leave">

      Modal Content

      <button (click)="closeModal()">Close</button>
    </div>
  </div>
}
```

SCSS:

```scss
.modal-enter {
  animation: modalEnter 300ms ease-out;
}

.modal-leave {
  animation: modalLeave 200ms ease-in;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modalLeave {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
```

---

## 12) Accessibility در Animation

برای کاربرانی که Motion Sensitivity دارند، بهتر است `prefers-reduced-motion` را در نظر بگیری:

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

اگر سؤال ترکیبی Accessibility + Animation بود، اشاره به این مورد امتیاز خوبی دارد.

---

## 13) Animation قدیمی Angular

در پروژه‌های قدیمی ممکن است ببینی:

```ts
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
```

و:

```ts
animations: [
  trigger('fade', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms', style({ opacity: 1 }))
    ])
  ])
]
```

HTML:

```html
<div @fade>
  Content
</div>
```

این مدل ممکن است هنوز در پروژه‌های قدیمی وجود داشته باشد، ولی در Angular جدید **Legacy Animation API** محسوب می‌شود.

از Angular 20.2، `@angular/animations` deprecated شده است. برای کد جدید Angular پیشنهاد می‌کند از:

```text
animate.enter
animate.leave
CSS animations
CSS transitions
```

استفاده شود.

---

## 14) اگر پروژه آزمون قدیمی بود چه کار کنم؟

اگر خود پروژه از قبل از این ساختار استفاده کرده:

```ts
trigger(...)
transition(...)
animate(...)
```

لازم نیست وسط آزمون کل پروژه را Migration بدهی.

اگر سؤال فقط گفته Animation همان Component را اصلاح کن، می‌توانی ساختار موجود را ادامه بدهی.

اما اگر سؤال گفت:

> برای Angular 20/21 یک Animation جدید پیاده‌سازی کن.

بهتر است سراغ:

```html
animate.enter
animate.leave
```

و CSS بروی.

---

## 15) BrowserAnimationsModule و provideAnimations

در پروژه‌های قدیمی ممکن است ببینی:

```ts
BrowserAnimationsModule
```

یا:

```ts
provideAnimations()
```

این APIها نیز از Angular 20.2 deprecated شده‌اند. برای Animation جدید، `animate.enter` و `animate.leave` مسیر پیشنهادی Angular هستند.

---

# چند سؤال نمونه امتحانی

## نمونه 1 — Fade Alert

### سؤال

یک Alert فقط وقتی `showAlert = true` است نمایش داده می‌شود. هنگام ظاهر شدن Fade In و هنگام حذف Fade Out شود.

### جواب

```html
@if (showAlert) {
  <div
    animate.enter="alert-enter"
    animate.leave="alert-leave">
    Operation Successful
  </div>
}
```

```scss
.alert-enter {
  animation: fadeIn 300ms ease;
}

.alert-leave {
  animation: fadeOut 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

---

## نمونه 2 — Sidebar

### سؤال

هنگام نمایش Sidebar، آن را از سمت چپ وارد صفحه کنید.

### جواب

```html
@if (showSidebar) {
  <aside animate.enter="sidebar-enter">
    Menu
  </aside>
}
```

```scss
.sidebar-enter {
  animation: sidebarEnter 400ms ease-out;
}

@keyframes sidebarEnter {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}
```

---

## نمونه 3 — Hover Button

### سؤال

Button هنگام Hover کمی بزرگ شود.

### جواب

```scss
button {
  transform: scale(1);
  transition: transform 200ms ease;
}

button:hover {
  transform: scale(1.05);
}
```

این سؤال اصلاً نیازی به Angular Animation ندارد و CSS کافی است.

---

## نمونه 4 — Product List

### سؤال

هنگام اضافه شدن Product جدید، Item با Fade + Slide نمایش داده شود.

### جواب

```html
@for (product of products; track product.id) {
  <div animate.enter="product-enter">
    {{ product.name }}
  </div>
}
```

```scss
.product-enter {
  animation: productEnter 300ms ease-out;
}

@keyframes productEnter {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

# Cheat Sheet امتحانی

اگر سؤال گفت:

```text
Element هنگام نمایش Animation داشته باشد
```

یادت بیاید:

```html
animate.enter
```

اگر گفت:

```text
هنگام حذف Animation داشته باشد
```

یادت بیاید:

```html
animate.leave
```

اگر گفت Fade:

```scss
opacity: 0 → 1
```

اگر گفت Slide:

```scss
transform: translateX(...)
```

اگر گفت Zoom:

```scss
transform: scale(...)
```

اگر گفت Rotate:

```scss
transform: rotate(...)
```

اگر گفت Hover Animation:

```scss
transition
```

اگر گفت Animation چندمرحله‌ای:

```scss
@keyframes
```

---

# چهار الگوی مهم برای حفظ کردن

## Fade

```scss
from { opacity: 0; }
to { opacity: 1; }
```

## Slide

```scss
from { transform: translateX(100%); }
to { transform: translateX(0); }
```

## Zoom

```scss
from { transform: scale(0.8); }
to { transform: scale(1); }
```

## Rotate

```scss
from { transform: rotate(0); }
to { transform: rotate(360deg); }
```

با همین چهار الگو می‌توانی بخش بزرگی از سؤال‌های ساده Animation را حل کنی.

---

# جمع‌بندی خیلی کوتاه

برای Angular 20/21 در کد جدید:

```text
CSS Animation / Transition
        +
animate.enter / animate.leave
```

مدل ذهنی ورود:

```text
@if
 ↓
Element ساخته می‌شود
 ↓
animate.enter
 ↓
CSS Animation
```

مدل ذهنی خروج:

```text
Element
 ↓
animate.leave
 ↓
CSS Animation
 ↓
حذف از DOM
```

برای آزمون اول راه‌حل ساده، قابل اجرا و قابل توضیح را تحویل بده. اگر زمان داشتی بعداً Accessibility و Animationهای پیچیده‌تر را اضافه کن.
