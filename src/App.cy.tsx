import App from './App'
import { TcgThemeProvider } from './theme/TcgThemeProvider'

function mountApp() {
  cy.viewport(1280, 720)
  cy.mount(
    <TcgThemeProvider>
      <App />
    </TcgThemeProvider>,
  )
}

function dragCardToActiveSlot(selector: string) {
  cy.get(selector).first().then(($card) => {
    const dataTransfer = new DataTransfer()
    const handIndex = $card.parent().children('button').index($card)
    dataTransfer.setData('text/plain', String(handIndex))
    cy.wrap($card).trigger('dragstart', { dataTransfer, force: true })
    cy.get('[data-cy="player-active-slot"]').trigger('dragover', {
      dataTransfer,
      force: true,
    })
    cy.get('[data-cy="player-active-slot"]').trigger('drop', {
      dataTransfer,
      force: true,
    })
  })
}

function chooseOpeningMonster(monsterId = 'cindermane') {
  cy.get(`[data-cy="choose-monster-${monsterId}"]`).click()
}

function startWithStance(stanceId: string, monsterId = 'cindermane') {
  chooseOpeningMonster(monsterId)
  cy.get(`[data-cy="choose-opening-${stanceId}"]`).click()
}

describe('Monster Command TCG lab', () => {
  it('starts by asking which monster enters the battlefield', () => {
    mountApp()

    cy.get('[data-cy="opening-monster-panel"]').should('be.visible')
    cy.contains('Cindermane')
    cy.contains('Ember Whelp')
    cy.contains('Nightmoth')
    chooseOpeningMonster()
    cy.get('[data-cy="opening-stance-panel"]').should('be.visible')
    cy.get('[data-cy="choose-opening-hunting"]').should('be.visible')
  })

  it('starts a chosen monster on the battlefield', () => {
    mountApp()

    startWithStance('veiled', 'nightmoth')
    cy.get('[data-cy="player-active-monster"]').contains('Nightmoth')
    cy.get('[data-cy="player-active-monster"]').contains('Veiled')
  })

  it('shows public bench monsters as cards', () => {
    mountApp()

    chooseOpeningMonster()
    cy.get('[data-cy="rival-bench-stack"]').click()
    cy.get('[data-cy="focused-card"]').contains('Shellmaw')
    cy.get('[data-cy="focused-card"]').contains('Cindermane')
    cy.get('[data-cy="close-focused-card"]').click({ force: true })
  })

  it('opens card details for monsters and commands', () => {
    mountApp()

    startWithStance('hunting')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Hunting')
    cy.get('[data-cy="focused-card"]').contains('Frenzy')
    cy.get('[data-cy="focused-card"]').contains('Ashcloak')
    cy.get('[data-cy="close-focused-card"]').click({ force: true })

    cy.get('[data-cy="card-rake"]').first().click({ force: true })
    cy.get('[data-cy="focused-card"]').contains('Rake')
    cy.get('[data-cy="focused-card"]').contains('Deal 3 damage')
  })

  it('chooses a starting stance and resolves stance-modified commands', () => {
    mountApp()

    startWithStance('frenzy')
    cy.get('[data-cy="player-active-monster"]').contains('Frenzy')
    dragCardToActiveSlot('[data-cy="card-rake"]')

    cy.get('[data-cy="rival-active-monster"]').contains('9/14 HP')
    cy.get('[data-cy="player-active-monster"]').contains('17/18 HP')
  })

  it('allows one free stance switch at the start of the turn', () => {
    mountApp()

    startWithStance('hunting')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="stance-ashcloak"]').click()
    cy.get('[data-cy="player-active-monster"]').contains('Ashcloak')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="stance-frenzy"]').should('be.disabled')
  })

  it('spends Focus across multiple cards', () => {
    mountApp()

    startWithStance('hunting')
    dragCardToActiveSlot('[data-cy="card-rake"]')
    dragCardToActiveSlot('[data-cy="card-rake"]')
    dragCardToActiveSlot('[data-cy="card-emberSnap"]')

    cy.get('[data-cy="focus-count"]').contains('0')
    cy.get('[data-cy="card-brace"]').should('have.attr', 'aria-disabled', 'true')
  })

  it('attaches adaptations to the active monster', () => {
    mountApp()

    startWithStance('hunting')
    dragCardToActiveSlot('[data-cy="card-hardenedScar"]')
    cy.get('[data-cy="player-active-monster"]').contains('Hardened Scar')
  })

  it('replaces a defeated rival monster from the bench', () => {
    mountApp()

    startWithStance('frenzy')
    for (let turn = 0; turn < 18; turn += 1) {
      cy.get('body').then(($body) => {
        if ($body.text().includes('Shellmaw')) {
          return
        }

        if ($body.find('[data-cy^="replace-"]').length > 0) {
          cy.get('[data-cy^="replace-"]').first().click()
        } else if ($body.find('[data-cy="card-rake"][data-playable]').length > 0) {
          dragCardToActiveSlot('[data-cy="card-rake"][data-playable]')
        } else if ($body.find('[data-cy="card-emberSnap"][data-playable]').length > 0) {
          dragCardToActiveSlot('[data-cy="card-emberSnap"][data-playable]')
        } else if ($body.find('[data-cy="card-pounce"][data-playable]').length > 0) {
          dragCardToActiveSlot('[data-cy="card-pounce"][data-playable]')
        } else {
          cy.contains('End turn').click()
        }
      })
    }

    cy.get('[data-cy="rival-active-monster"]').contains('Shellmaw')
  })
})
