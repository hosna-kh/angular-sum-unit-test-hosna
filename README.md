# بررسی سیستم
node -v
npm -v
ng version

# ساخت پروژه
ng new angular-exam --routing --style=scss

# ورود به پروژه
cd angular-exam

# اجرا
ng serve

# Component
ng g c user-list

# Service
ng g s services/user

# Interface
ng g interface models/user

# تست
ng test

# Build
ng build

# Production build
ng build --configuration production

# ngx-translate
npm install @ngx-translate/core @ngx-translate/http-loader

# PWA
ng add @angular/pwa


git config user.name "Your Name"
git config user.email "your-email@example.com"

# ===== GET PROJECT =====

git clone REPOSITORY_URL
cd PROJECT_NAME

git status
git branch
git remote -v


# ===== RUN PROJECT =====

npm install
ng serve


# ===== DO THE EXAM =====

# کدنویسی...


# ===== CHECK =====

ng test
ng build


# ===== SUBMIT =====

git status
git add .
git status

git commit -m "Complete Angular exam task"

git push