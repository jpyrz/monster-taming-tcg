/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    mount: typeof import('cypress/react').mount
  }
}
