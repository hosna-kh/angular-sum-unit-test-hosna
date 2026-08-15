import { TestBed } from '@angular/core/testing';
import { Sum } from '../sum/sum';


describe('Sum', () => {
  let component: Sum;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sum]
    }).compileComponents();

    const fixture = TestBed.createComponent(Sum);
    component = fixture.componentInstance;
  });

  // Test 1
  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  // Test 2
  it('should calculate sum less than 10', () => {
    component.firstNumber = 3;
    component.secondNumber = 4;

    component.calculate();

    expect(component.result).toBe(7);
    expect(component.message).toBe('جمع دو عدد کوچک‌تر از ۱۰ است');
  });

  // Test 3
  it('should calculate sum greater than 10', () => {
    component.firstNumber = 6;
    component.secondNumber = 5;

    component.calculate();

    expect(component.result).toBe(11);
    expect(component.message).toBe('جمع دو عدد بزرگتر از ۱۰ است');
  });
});