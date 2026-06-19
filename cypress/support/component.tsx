/* eslint-disable @typescript-eslint/no-namespace */
import { mount } from 'cypress/react'
import '@mantine/core/styles.css'
import '../../src/index.scss'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
