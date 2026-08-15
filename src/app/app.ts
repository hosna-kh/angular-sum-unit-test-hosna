import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('expert-angular-lab');

  private readonly translate = inject(TranslateService);

  constructor() {
    const language = localStorage.getItem('language') ?? 'fa';

    this.changeLanguage(language as 'fa' | 'en');
  }

  changeLanguage(language: 'fa' | 'en'): void {
    this.translate.use(language);

    localStorage.setItem('language', language);

    document.documentElement.lang = language;
    document.documentElement.dir =
      language === 'fa' ? 'rtl' : 'ltr';
  }
}