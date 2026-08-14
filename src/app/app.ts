import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('HOSNA TEST');

  firstNumber: number | null = null;
  secondNumber: number | null = null;
  result: number | null = null;
  message = '';

  calculate(): void {
    if (this.firstNumber === null || this.secondNumber === null) {
      return;
    }

    this.result = this.firstNumber + this.secondNumber;

    if (this.result < 10) {
      this.message = 'جمع دو عدد کوچک‌تر از ۱۰ است';
    } else {
      this.message = 'جمع دو عدد بزرگتر از ۱۰ است';
    }
  }
}