# سؤال ۲ Angular --- نسخه ساده‌شده برای یادگیری

طبیعیه که این یکی سخت‌تر به نظر بیاد، چون نسخه‌ی کاملش را تا سطح
**cancellation + Subject + error recovery** بردیم؛ در حالی که هسته‌ی اصلی
سؤال خیلی ساده‌تر است.

برای آزمون، فعلاً این ۳ مرحله را از سؤال ۲ یاد بگیر.

## 1. اول Nested Subscribe را تشخیص بده

اگر دیدی:

``` ts
serviceA.get().subscribe(a => {
  serviceB.get(a.id).subscribe(b => {
  });
});
```

زنگ خطر:

> دو API به هم وابسته‌اند → احتمالاً باید `switchMap` استفاده کنم.

## 2. ساده‌ترین تبدیلش را بلد باش

``` ts
this.invoiceService.getInvoice(id)
  .pipe(
    switchMap(invoice => {
      this.invoice = invoice;

      return this.paymentService.getPaymentInfo(invoice.id);
    })
  )
  .subscribe(payment => {
    this.paymentInfo = payment;
  });
```

اگر همین را در آزمون درست بنویسی، بخش خیلی مهمی از سؤال را حل کرده‌ای.

### مدل ذهنی

``` text
Invoice API
     ↓
 invoice
     ↓
switchMap
     ↓
Payment API
     ↓
paymentInfo
```

یعنی:

> جواب API قبلی را گرفتم، حالا با آن می‌روم سراغ Observable بعدی.

------------------------------------------------------------------------

## 3. بعد Loading را اضافه کن

``` ts
this.loading = true;

this.invoiceService.getInvoice(id)
  .pipe(
    switchMap(invoice => {
      this.invoice = invoice;

      return this.paymentService.getPaymentInfo(invoice.id);
    }),

    finalize(() => {
      this.loading = false;
    })
  )
  .subscribe({
    next: payment => {
      this.paymentInfo = payment;
    },

    error: error => {
      console.error(error);
    }
  });
```

### چرا `finalize`؟

چون می‌خواهیم چه درخواست موفق شود و چه خطا بدهد، در پایان:

``` ts
this.loading = false;
```

اجرا شود.

به‌جای اینکه این خط را هم در `next` و هم در `error` تکرار کنیم، آن را
داخل `finalize` قرار می‌دهیم.

------------------------------------------------------------------------

## سه کلمه کلیدی سؤال

  صورت سؤال                                       چیزی که باید یادت بیاید
  ----------------------------------------------- -------------------------
  API دوم به نتیجه API اول وابسته است             `switchMap`
  success یا error در هر دو حالت کاری انجام بده   `finalize`
  با آمدن مقدار جدید، درخواست قبلی لغو شود        `switchMap`

فعلاً `takeUntilDestroyed`، `Subject`، `EMPTY` و محل دقیق `catchError` را
کنار می‌گذاریم. این‌ها مرحله بعدی یادگیری هستند.

## چیزی که فعلاً باید بلد باشی

وقتی این را می‌بینی:

``` ts
this.invoiceService.getInvoice(id).subscribe(invoice => {
  this.paymentService.getPaymentInfo(invoice.id)
    .subscribe(payment => {
      this.paymentInfo = payment;
    });
});
```

باید بتوانی آن را به این تبدیل کنی:

``` ts
this.invoiceService.getInvoice(id)
  .pipe(
    switchMap(invoice => {
      return this.paymentService.getPaymentInfo(invoice.id);
    })
  )
  .subscribe(payment => {
    this.paymentInfo = payment;
  });
```

بعد اگر سؤال `loading` داشت:

``` ts
finalize(() => {
  this.loading = false;
})
```

را اضافه کن.

------------------------------------------------------------------------

## نکته امتحانی

اسم `switchMap` را فقط حفظ نکن؛ رفتارش را تصور کن:

``` text
API اول
   ↓
نتیجه API اول
   ↓
switchMap
   ↓
API دوم
   ↓
subscribe نهایی
```

اگر API دوم برای اجرا به نتیجه API اول نیاز داشته باشد، `switchMap` یکی
از اولین گزینه‌هایی است که باید بررسی کنی.
