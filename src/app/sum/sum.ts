import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sum',
  imports: [FormsModule,
    TranslatePipe
  ],
  templateUrl: './sum.html',
  styleUrl: './sum.scss'
})
export class Sum {
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