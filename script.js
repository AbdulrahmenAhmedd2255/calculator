const display = document.querySelector(".display");
const numbers = document.querySelectorAll(".number");
const operators = document.querySelectorAll(".operator");
const decimal = document.querySelector(".decimal");
const equal = document.querySelector(".equal");
const clear = document.getElementById("clear");
const del = document.getElementById("del");

let currentValue = "";
let justCalculated = false;

// ========================================
// Update Display
// ========================================

function updateDisplay() {
display.textContent = currentValue || "0";
}

// ========================================
// Number Buttons
// ========================================

numbers.forEach((button) => {

button.addEventListener("click", () => {

    if (justCalculated) {
        currentValue = "";
        justCalculated = false;
    }

    if (currentValue === "0") {
        currentValue = button.textContent;
    } else {
        currentValue += button.textContent;
    }

    updateDisplay();
});

});

// ========================================
// Operator Buttons
// ========================================

operators.forEach((button) => {

button.addEventListener("click", () => {

    if (currentValue === "") {
        return;
    }

    const lastCharacter = currentValue.slice(-1);

    // Prevent two operators in a row
    if ("+-%*/".includes(lastCharacter)) {
        return;
    }

    currentValue += button.textContent;

    justCalculated = false;

    updateDisplay();
});

});

// ========================================
// Decimal Button
// ========================================

decimal.addEventListener("click", () => {

if (justCalculated) {
    currentValue = "0";
    justCalculated = false;
}

const currentNumber = currentValue
    .split(/[+%*/-]/)
    .pop();

// Prevent multiple decimal points
if (currentNumber.includes(".")) {
    return;
}

// Start decimal number with 0
if (
    currentValue === "" ||
    "+-%*/".includes(currentValue.slice(-1))
) {
    currentValue += "0";
}

currentValue += ".";

updateDisplay();

});

// ========================================
// Equal Button
// ========================================

equal.addEventListener("click", () => {

if (currentValue === "") {
    return;
}

const lastCharacter = currentValue.slice(-1);

// Don't calculate incomplete expressions
if ("+-%*/".includes(lastCharacter)) {
    return;
}

try {

    const result = calculate(currentValue);

    if (!Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    // Avoid long floating-point results
    currentValue = String(
        Number(result.toFixed(10))
    );

    justCalculated = true;

    updateDisplay();

} catch {

    currentValue = "";

    display.textContent = "Error";

    justCalculated = true;
}

});

// ========================================
// Clear Button
// ========================================

clear.addEventListener("click", () => {

currentValue = "";

justCalculated = false;

updateDisplay();

});

// ========================================
// Delete Button
// ========================================

del.addEventListener("click", () => {

if (justCalculated) {

    currentValue = "";

    justCalculated = false;

} else {

    currentValue = currentValue.slice(0, -1);
}

updateDisplay();

});

// ========================================
// Keyboard Support
// ========================================

document.addEventListener("keydown", (event) => {

const key = event.key;


// Numbers
if (/^[0-9]$/.test(key)) {

    if (justCalculated) {
        currentValue = "";
        justCalculated = false;
    }

    if (currentValue === "0") {
        currentValue = key;
    } else {
        currentValue += key;
    }

    updateDisplay();

    return;
}


// Operators
if ("+-*/%".includes(key)) {

    const lastCharacter = currentValue.slice(-1);

    if (
        currentValue !== "" &&
        !"+-%*/".includes(lastCharacter)
    ) {

        currentValue += key;

        justCalculated = false;

        updateDisplay();
    }

    return;
}


// Decimal
if (key === ".") {

    decimal.click();

    return;
}


// Equal
if (
    key === "Enter" ||
    key === "="
) {

    equal.click();

    return;
}


// Delete
if (key === "Backspace") {

    del.click();

    return;
}


// Clear
if (
    key === "Escape" ||
    key.toLowerCase() === "c"
) {

    clear.click();
}

});

// ========================================
// Calculator Engine
// Operator Precedence
// ========================================

function calculate(expression) {

/*
    Example:

    2 + 3 * 4

    First:
    3 * 4 = 12

    Then:
    2 + 12 = 14
*/

const tokens = expression.match(
    /(\d*\.?\d+|[+\-%*/])/g
);

if (!tokens) {
    throw new Error("Invalid expression");
}


// ------------------------------------
// First Pass
// * / %
// ------------------------------------

const firstPass = [];

let i = 0;

while (i < tokens.length) {

    const token = tokens[i];


    if (
        token === "*" ||
        token === "/" ||
        token === "%"
    ) {

        const previous = firstPass.pop();

        const next = Number(tokens[i + 1]);


        if (
            previous === undefined ||
            Number.isNaN(next)
        ) {
            throw new Error("Invalid expression");
        }


        let result;


        // Multiplication
        if (token === "*") {

            result = previous * next;
        }


        // Division
        if (token === "/") {

            if (next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = previous / next;
        }


        // Modulo
        if (token === "%") {

            if (next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = previous % next;
        }


        firstPass.push(result);

        i += 2;

    } else {

        if (!Number.isNaN(Number(token))) {

            firstPass.push(Number(token));

        } else {

            firstPass.push(token);
        }

        i++;
    }
}


// ------------------------------------
// Second Pass
// + -
// ------------------------------------

let result = firstPass[0];


for (let i = 1; i < firstPass.length; i += 2) {

    const operator = firstPass[i];

    const nextNumber = firstPass[i + 1];


    if (operator === "+") {

        result += nextNumber;
    }


    if (operator === "-") {

        result -= nextNumber;
    }
}


return result;

}