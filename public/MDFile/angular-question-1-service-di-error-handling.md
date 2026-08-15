# سوال ۱ — Service + Dependency Injection + Error Handling

## صورت سوال

یک پروژه Angular در اختیار شما قرار گرفته است که کامپوننت `UserListComponent` مستقیماً با `HttpClient` اطلاعات کاربران را از API دریافت می‌کند.

کد فعلی تقریباً به این شکل است:

```ts
export class UserListComponent implements OnInit {

  users: User[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>('/api/users')
      .subscribe({
        next: users => this.users = users,
        error: error => console.log(error)
      });
  }
}
```

نیازمندی‌ها:

- منطق ارتباط با API نباید داخل Component باشد.
- یک `UserService` قابل Inject ایجاد کنید.
- دریافت کاربران باید از طریق Service انجام شود.
- خطاهای API باید مدیریت شوند.
- در صورت بروز خطا، Component باید بتواند پیام مناسبی به کاربر نمایش دهد.
- کد باید تا حد ممکن قابل تست باشد.
- از nested subscribe استفاده نکنید.

**خروجی مورد انتظار:** اصلاح ساختار پروژه و پیاده‌سازی Service و Component.

---

# تحلیل مسئله

مشکل اصلی کد اولیه این است که `UserListComponent` هم مسئول UI است و هم مستقیماً مسئول ارتباط با Backend. در نتیجه دو مسئولیت مختلف داخل یک کلاس قرار گرفته‌اند.

ساختار بهتر:

```text
UserListComponent
       ↓
   UserService
       ↓
   HttpClient
       ↓
     API
```

به این ترتیب:

- Component فقط مسئول UI و state صفحه است.
- Service مسئول ارتباط با API و منطق مرتبط با دریافت داده است.

این جداسازی باعث می‌شود کد تمیزتر، قابل نگهداری‌تر و قابل تست‌تر شود.

---

# مرحله ۱ — ساخت UserService

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Failed to load users', error);
          return throwError(() => error);
        })
      );
  }
}
```

## نکته مهم امتحانی

داخل Service بهتر است معمولاً `subscribe` نکنیم.

بد:

```ts
getUsers(): void {
  this.http.get<User[]>(this.apiUrl)
    .subscribe(...);
}
```

بهتر:

```ts
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl);
}
```

یعنی:

```text
Service → Observable می‌سازد و برمی‌گرداند
Component → Observable را مصرف می‌کند
```

---

# مرحله ۲ — استفاده از Service در Component

```ts
export class UserListComponent implements OnInit {

  users: User[] = [];
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers()
      .subscribe({
        next: users => {
          this.users = users;
        },
        error: () => {
          this.errorMessage = 'خطا در دریافت اطلاعات کاربران';
        }
      });
  }
}
```

در این حالت Component دیگر به `HttpClient` وابسته نیست.

---

# مدیریت خطا در Service یا Component؟

هر دو می‌توانند نقش داشته باشند، ولی مسئولیت آن‌ها متفاوت است.

- Service می‌تواند خطای فنی را log یا پردازش کند.
- Component باید تصمیم بگیرد چه پیامی به کاربر نمایش دهد.

مثال:

```ts
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl)
    .pipe(
      catchError(error => {
        console.error('Get users failed:', error);
        return throwError(() => error);
      })
    );
}
```

و در Component:

```ts
this.userService.getUsers()
  .subscribe({
    next: users => {
      this.users = users;
    },
    error: () => {
      this.errorMessage = 'دریافت کاربران با خطا مواجه شد.';
    }
  });
```

## نکته مهم

اگر این کار را انجام دهیم:

```ts
catchError(() => of([]))
```

Component دیگر متوجه نمی‌شود API خطا داده است و فقط یک آرایه خالی دریافت می‌کند.

ممکن است UI اشتباه فکر کند:

```text
هیچ کاربری وجود ندارد
```

در حالی که در واقع:

```text
Backend با خطا مواجه شده است
```

پس در این سناریو بهتر است خطا propagate شود:

```ts
return throwError(() => error);
```

---

# اضافه کردن Loading

```ts
import { finalize } from 'rxjs';

export class UserListComponent implements OnInit {

  users: User[] = [];
  errorMessage = '';
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: users => {
          this.users = users;
        },
        error: () => {
          this.errorMessage = 'خطا در دریافت اطلاعات کاربران';
        }
      });
  }
}
```

## چرا finalize بهتر است؟

به جای اینکه `loading = false` را هم در `next` و هم در `error` تکرار کنیم:

```ts
next: () => {
  this.loading = false;
},
error: () => {
  this.loading = false;
}
```

می‌توانیم از `finalize` استفاده کنیم:

```ts
finalize(() => {
  this.loading = false;
})
```

`finalize` در پایان جریان اجرا می‌شود، چه عملیات موفق شود، چه error بدهد و چه unsubscribe رخ دهد.

---

# مدیریت Subscription و Memory Leak

برای یک request ساده `HttpClient` معمولاً Observable بعد از دریافت response خودش complete می‌شود و خطر memory leak پایین است.

با این حال در Angular 20/21 می‌توانیم از `takeUntilDestroyed` استفاده کنیم:

```ts
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class UserListComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  users: User[] = [];
  loading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: users => {
          this.users = users;
        },
        error: () => {
          this.errorMessage = 'خطا در دریافت اطلاعات کاربران';
        }
      });
  }
}
```

## روش قدیمی‌تر

```ts
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

و سپس:

```ts
takeUntil(this.destroy$)
```

این روش هنوز معتبر است، اما در Angular جدید `takeUntilDestroyed` تمیزتر است.

---

# چرا کد تست‌پذیرتر شد؟

در نسخه اولیه Component مستقیماً به `HttpClient` وابسته بود.

بعد از refactor، Component فقط به `UserService` وابسته است و در تست می‌توان Service را mock کرد.

مثال:

```ts
const userServiceMock = {
  getUsers: jasmine.createSpy().and.returnValue(
    of([
      { id: 1, name: 'Hosna' }
    ])
  )
};
```

به این ترتیب می‌توان Component را بدون request واقعی تست کرد.

این همان Separation of Concerns است.

---

# نسخه نهایی پیشنهادی برای آزمون

## UserService

```ts
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Failed to load users', error);
          return throwError(() => error);
        })
      );
  }
}
```

## UserListComponent

```ts
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  users: User[] = [];
  loading = false;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: users => {
          this.users = users;
        },
        error: () => {
          this.errorMessage = 'خطا در دریافت اطلاعات کاربران';
        }
      });
  }
}
```

## Template

```html
@if (loading) {
  <p>در حال دریافت اطلاعات...</p>
}

@if (errorMessage) {
  <p class="error">
    {{ errorMessage }}
  </p>
}

@if (!loading && !errorMessage) {
  @for (user of users; track user.id) {
    <div>
      {{ user.name }}
    </div>
  }
}
```

---

# نکات مهم امتحانی

وقتی داخل Component دیدی:

```ts
constructor(private http: HttpClient)
```

به این فکر کن که آیا منطق HTTP بهتر است به Service منتقل شود یا نه.

وقتی Service ساختی، بهتر است معمولاً:

```ts
Observable برگردانی
```

و داخل Service بی‌دلیل `subscribe` نکنی.

برای مدیریت loading، `finalize` معمولاً از تکرار `loading = false` در چند مسیر جلوگیری می‌کند.

برای مدیریت lifecycle subscription در Angular جدید، `takeUntilDestroyed` ابزار مناسبی است.

اصل معماری مهم:

```text
Component → مسئول UI و state صفحه
Service → مسئول API و business/data access logic
```

---

# سطح سخت‌تر احتمالی در آزمون

ممکن است ممتحن همین سوال را با شرطی مثل این سخت‌تر کند:

> در صورت خطای API سه بار retry انجام شود، اما برای خطای 404 retry نشود.

در این حالت باید از operatorهایی مثل `retry` یا `retryWhen` همراه با بررسی status code استفاده کنی و برای 404 درخواست مجدد انجام ندهی.
