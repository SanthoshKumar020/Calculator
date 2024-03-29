import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Calculator';
  inputStr: any;
  typedData: string = '';
  calculationHistory: any = [];
  showHis: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.inputStr = this.formBuilder.group({
      text: ['', Validators.pattern(/^[0-9]*$/)],
    });
  }

  ngOnInit(): void {
    this.inputStr = new FormGroup({
      text: new FormControl(),
    });
  }
  clearHistory() {
    this.calculationHistory = [];
  }

  buttonClicked(buttonElement: any) {
    let buttontext = buttonElement.textContent;

    // Check if the button clicked is an operator
    if (['+', '-', 'x', '÷', '%'].includes(buttontext)) {
      if (typeof this.inputStr.controls.text.value == 'string') {
        let lastChar = this.inputStr.controls.text.value.slice(-1);
        // Check if last character is an operator, if so, replace it
        if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        } else {
          this.inputStr.controls.text.setValue(
            this.inputStr.controls.text.value + buttontext
          );
        }
      } else {
        this.inputStr.controls.text.setValue(
          this.inputStr.controls.text.value + buttontext
        );
      }
    } else {
      // For numbers and other characters, just append to the input
      if (typeof this.inputStr.controls.text.value == 'string') {
        // Check if the current input is a result
        if (this.inputStr.controls.text.value.includes('=')) {
          this.inputStr.controls.text.setValue(buttontext);
        } else {
          this.inputStr.controls.text.setValue(
            this.inputStr.controls.text.value + buttontext
          );
        }
      } else {
        this.inputStr.controls.text.setValue(buttontext);
      }
    }
  }

  clearDisplay() {
    this.inputStr.controls.text.setValue('');
  }

  calculate() {
    let calculation = this.inputStr.controls.text.value;
    let result = 0;

    // Function to split the calculation string into tokens
    const tokenize = (expression: string) => {
      return expression.match(/\d+|\+|\-|\x|\÷|\%/g) || []; // Add a type guard to handle potential null value
    };

    // Function to perform an operation
    const performOperation = (
      operand1: number,
      operator: string,
      operand2: number
    ) => {
      switch (operator) {
        case '+':
          return operand1 + operand2;
        case '-':
          return operand1 - operand2;
        case 'x':
          return operand1 * operand2;
        case '÷':
          return operand1 / operand2;
        case '%':
          return (operand1 / 100) * operand2;
        default:
          throw new Error('Invalid operator');
      }
    };

    // Evaluate expression using BODMAS rule
    const evaluateExpression = (tokens: string[]) => {
      // Perform operations within brackets first
      while (tokens.includes('(')) {
        const startIndex = tokens.lastIndexOf('(');
        const endIndex = tokens.indexOf(')', startIndex);
        const subExpression = tokens.slice(startIndex + 1, endIndex);
        const subResult = evaluateExpression(subExpression);
        tokens.splice(
          startIndex,
          endIndex - startIndex + 1,
          subResult.toString()
        );
      }

      // Perform exponentiation
      while (tokens.includes('x')) {
        const index = tokens.indexOf('x');
        const operand1 = parseFloat(tokens[index - 1]);
        const operand2 = parseFloat(tokens[index + 1]);
        const result = performOperation(operand1, 'x', operand2);
        tokens.splice(index - 1, 3, result.toString());
      }

      // Perform division
      while (tokens.includes('÷')) {
        const index = tokens.indexOf('÷');
        const operand1 = parseFloat(tokens[index - 1]);
        const operand2 = parseFloat(tokens[index + 1]);
        const result = performOperation(operand1, '÷', operand2);
        tokens.splice(index - 1, 3, result.toString());
      }

      // Perform addition and subtraction
      let index = 1;
      while (index < tokens.length) {
        const operator = tokens[index];
        if (operator === '+' || operator === '-') {
          const operand1 = parseFloat(tokens[index - 1]);
          const operand2 = parseFloat(tokens[index + 1]);
          const result = performOperation(operand1, operator, operand2);
          tokens.splice(index - 1, 3, result.toString());
        } else {
          index += 2;
        }
      }

      return parseFloat(tokens[0]);
    };

    // Tokenize the calculation
    const tokens = tokenize(calculation);

    // Evaluate the expression if tokens are not null
    if (tokens.length > 0) {
      result = evaluateExpression(tokens);
    }

    console.log(result);

    this.inputStr.controls.text.setValue(result);
    this.calculationHistory.push(calculation + ' = ' + result);
    console.log(this.calculationHistory);
  }

  showTypedData() {
    this.typedData = this.inputStr.controls.text.value;
    console.log(this.typedData);
  }

  History() {
    this.showHis = !this.showHis;
  }
  restrictInput(event: any) {
    const pattern = /^[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
      // Emitting input event to ensure Angular form control is updated
      event.target.dispatchEvent(new Event('input'));
    }
  }

  negate() {
    if (this.inputStr.controls.text.value != '0') {
      let currentValue = parseFloat(this.inputStr.controls.text.value);
      if (currentValue > 0) {
        this.inputStr.controls.text.setValue(
          '-' + this.inputStr.controls.text.value
        );
      } else if (currentValue < 0) {
        this.inputStr.controls.text.setValue(
          this.inputStr.controls.text.value.slice(1)
        );
      }
    }
  }
}
