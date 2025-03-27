# Playwright Automation Project

## Project Overview
This project uses Playwright for automated end-to-end testing of a booking platform. It includes test cases for hotels, flights, and other features. The automation framework supports running tests in headless mode, generating reports, and using AI to enhance test automation.

## Installation

Ensure you have Node.js installed, then install dependencies:

```sh
npm install
```

## Running Tests

### Run All Tests
```sh
npm run test:all
```

### Run Hotel Tests
```sh
npm run test:all:hotels
```

### Run Flight Tests
```sh
npm run test:all:flights
```

### Run Tests with UI
```sh
npm run test:ui
```

### Open Playwright Code Generator
```sh
npm run test:codegen
```

## Viewing Test Reports

After executing tests, you can view the report by running:

```sh
npm run test:report
```

## AI Integration in Automation

This project integrates AI to enhance test automation by:
- Using AI-driven selectors to improve element location.
- Implementing self-healing tests that adapt to UI changes.
- Analyzing test results and suggesting improvements.

By leveraging AI, we increase the reliability and maintainability of automated tests, reducing false negatives and minimizing maintenance overhead.
