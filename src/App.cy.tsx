import App from './App'
import { TcgThemeProvider } from './theme/TcgThemeProvider'

function mountApp() {
  cy.mount(
    <TcgThemeProvider>
      <App />
    </TcgThemeProvider>,
  )
}

describe('Monster Command TCG lab', () => {
  it('starts with a roster and asks for an opening stance', () => {
    mountApp()

    cy.contains('Cindermane')
    cy.contains('Ember Whelp')
    cy.contains('Nightmoth')
    cy.get('[data-cy="opening-stance-panel"]').should('be.visible')
    cy.get('[data-cy="choose-opening-hunting"]').should('be.visible')
  })

  it('chooses a starting stance and resolves stance-modified commands', () => {
    mountApp()

    cy.get('[data-cy="choose-opening-frenzy"]').click()
    cy.get('[data-cy="player-active-monster"]').contains('Frenzy')
    cy.get('[data-cy="card-rake"]').first().click()

    cy.contains('for 5 damage')
    cy.get('[data-cy="player-active-monster"]').contains('17/18 HP')
  })

  it('allows one free stance switch at the start of the turn', () => {
    mountApp()

    cy.get('[data-cy="choose-opening-hunting"]').click()
    cy.get('[data-cy="stance-ashcloak"]').click()
    cy.get('[data-cy="player-active-monster"]').contains('Ashcloak')
    cy.get('[data-cy="stance-frenzy"]').should('be.disabled')
  })

  it('spends Focus across multiple cards and attaches adaptations', () => {
    mountApp()

    cy.get('[data-cy="choose-opening-hunting"]').click()
    cy.get('[data-cy="card-rake"]').first().click()
    cy.get('[data-cy="card-rake"]').first().click()
    cy.get('[data-cy="card-emberSnap"]').first().click()

    cy.get('[data-cy="focus-count"]').contains('0')
    cy.get('[data-cy="card-brace"]').should('be.disabled')
    cy.contains('End turn').click()
    cy.get('[data-cy="card-hardenedScar"]').first().click()
    cy.get('[data-cy="player-active-monster"]').contains('Hardened Scar')
  })

  it('replaces a defeated rival monster from the bench', () => {
    mountApp()

    cy.get('[data-cy="choose-opening-frenzy"]').click()
    for (let turn = 0; turn < 18; turn += 1) {
      cy.get('body').then(($body) => {
        if ($body.text().includes('Rival sends out')) {
          return
        }

        if ($body.find('[data-cy^="replace-"]').length > 0) {
          cy.get('[data-cy^="replace-"]').first().click()
        } else if ($body.find('[data-cy="card-rake"]:not(:disabled)').length > 0) {
          cy.get('[data-cy="card-rake"]').not(':disabled').first().click()
        } else if ($body.find('[data-cy="card-emberSnap"]:not(:disabled)').length > 0) {
          cy.get('[data-cy="card-emberSnap"]').not(':disabled').first().click()
        } else if ($body.find('[data-cy="card-pounce"]:not(:disabled)').length > 0) {
          cy.get('[data-cy="card-pounce"]').not(':disabled').first().click()
        } else {
          cy.contains('End turn').click()
        }
      })
    }

    cy.contains('Rival sends out')
  })
})
