# سؤال ۵ Angular --- Performance و Production (نسخه ساده)

در این سؤال فعلاً سراغ راه‌حل‌های پیچیده مثل `shareReplay`، `OnPush` و Pure
Pipe نمی‌رویم.

برای آزمون، اول فقط **۳ ایراد واضح** را پیدا کن:

1.  `console.log`ها را حذف کن، مخصوصاً اطلاعات حساسی مثل Token.
2.  اگر یک API چند بار یکسان صدا زده شده، تا جای ممکن فقط **یک بار** آن
    را فراخوانی کن.
3.  متدی مثل `calculatePrice()` را از HTML حذف کن و مقدار موردنیاز را
    هنگام دریافت داده‌ها محاسبه کن.

------------------------------------------------------------------------

## ۱. حذف console.log

کد اولیه:

``` ts
console.log('User:', user);
console.log('Token:', token);
```

در Production بهتر است این Logها حذف شوند، مخصوصاً:

``` ts
console.log('Token:', token);
```

چون Token اطلاعات حساس است.

پس در نسخه ساده:

``` ts
// console.log ها حذف شوند
```

------------------------------------------------------------------------

## ۲. جلوگیری از درخواست تکراری API

اگر چنین کدی داشتیم:

``` ts
this.http.get<Product[]>('/api/products').subscribe(...);
this.http.get<Product[]>('/api/products').subscribe(...);
this.http.get<Product[]>('/api/products').subscribe(...);
```

یعنی یک API یکسان سه بار فراخوانی شده است.

در حالت ساده، فقط یک بار آن را صدا می‌زنیم:

``` ts
this.http.get<Product[]>('/api/products')
  .subscribe(products => {
    this.products = products;
  });
```

مدل ذهنی:

``` text
API
API
API
```

تبدیل شود به:

``` text
API → یک بار
```

------------------------------------------------------------------------

## ۳. حذف Method از Template

کد اولیه HTML:

``` html
<div *ngFor="let product of products">
  {{ calculatePrice(product) }}
</div>
```

و در TypeScript:

``` ts
calculatePrice(product: Product) {
  return product.price * product.tax;
}
```

مشکل این است که Angular ممکن است هنگام Change Detection، متد
`calculatePrice()` را چندین بار اجرا کند.

پس بهتر است مقدار را هنگام دریافت اطلاعات محاسبه کنیم.

### TypeScript

``` ts
this.http.get<Product[]>('/api/products')
  .subscribe(products => {

    this.products = products.map(product => ({
      ...product,
      finalPrice: product.price * product.tax
    }));

  });
```

### HTML

حالا دیگر متد را صدا نمی‌زنیم:

``` html
<div *ngFor="let product of products">
  {{ product.finalPrice }}
</div>
```

مدل ذهنی:

``` text
API
 ↓
products
 ↓
calculate finalPrice
 ↓
نمایش در HTML
```

به‌جای اینکه Angular مرتب این کار را انجام دهد:

``` text
calculatePrice()
calculatePrice()
calculatePrice()
calculatePrice()
...
```

مقدار `finalPrice` را یک بار هنگام دریافت داده‌ها محاسبه می‌کنیم.

------------------------------------------------------------------------

# جواب ساده و نهایی برای آزمون

### TypeScript

``` ts
ngOnInit(): void {

  this.http.get<Product[]>('/api/products')
    .subscribe(products => {

      this.products = products.map(product => ({
        ...product,
        finalPrice: product.price * product.tax
      }));

    });
}
```

### HTML

``` html
<div *ngFor="let product of products">
  {{ product.finalPrice }}
</div>
```

و `console.log`های غیرضروری یا حساس حذف می‌شوند.

------------------------------------------------------------------------

# سه نکته‌ای که فعلاً باید یادت بماند

``` text
console.log
    ↓
حذف
```

``` text
API تکراری
    ↓
یک Request
```

``` text
Method در HTML
    ↓
مقدار را قبل از نمایش محاسبه کن
```

اگر در آزمون همین سه مشکل را تشخیص بدهی و درست اصلاح کنی، بخش اصلی سؤال
Performance را حل کرده‌ای.

بعد از مسلط شدن به این حالت ساده، می‌توان سراغ راه‌حل‌های حرفه‌ای‌تر مثل
`shareReplay`، `ChangeDetectionStrategy.OnPush`، Pure Pipe و Virtual
Scroll رفت.
