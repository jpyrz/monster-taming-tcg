import App from './App'
import {
  boardToScreen,
  screenRectToBoardRect,
  screenToBoard,
  type StageMetrics,
} from './battle-lab/input/boardCoordinates'
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

function pointerPlayCardToActiveSlot(selector: string) {
  cy.get(selector).first().then(($card) => {
    cy.get('[data-cy="player-active-slot"]').then(($slot) => {
      const cardRect = $card[0].getBoundingClientRect()
      const slotRect = $slot[0].getBoundingClientRect()
      const startX = cardRect.left + cardRect.width / 2
      const startY = cardRect.top + 12
      const endX = slotRect.left + slotRect.width / 2
      const endY = slotRect.top + slotRect.height / 2

      cy.wrap($card)
        .trigger('pointerdown', {
          button: 0,
          clientX: startX,
          clientY: startY,
          force: true,
          pointerId: 7,
          pointerType: 'touch',
        })
        .trigger('pointermove', {
          clientX: endX,
          clientY: endY,
          force: true,
          pointerId: 7,
          pointerType: 'touch',
        })

      cy.get('[data-cy="mobile-drag-preview"]').then(($preview) => {
        const previewRect = $preview[0].getBoundingClientRect()

        expect(previewRect.width).to.be.greaterThan(0)
        expect(previewRect.height).to.be.greaterThan(0)
      })

      cy.wrap($card)
        .trigger('pointerup', {
          clientX: endX,
          clientY: endY,
          force: true,
          pointerId: 7,
          pointerType: 'touch',
        })
    })
  })
}

function pointerTap(selector: string) {
  pointerTapAt(selector, 0.5, 0.5)
}

function pointerTapAt(selector: string, xRatio: number, yRatio: number) {
  cy.get(selector).then(($element) => {
    const rect = $element[0].getBoundingClientRect()
    const clientX = rect.left + rect.width * xRatio
    const clientY = rect.top + rect.height * yRatio

    cy.wrap($element)
      .trigger('pointerdown', {
        button: 0,
        clientX,
        clientY,
        force: true,
        pointerId: 9,
        pointerType: 'touch',
      })
      .trigger('pointerup', {
        clientX,
        clientY,
        force: true,
        pointerId: 9,
        pointerType: 'touch',
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
  it('maps screen and board coordinates through the stage metrics', () => {
    const metrics: StageMetrics = {
      frameHeight: 390,
      frameLeft: 0,
      frameTop: 0,
      frameWidth: 844,
      logicalHeight: 720,
      logicalWidth: 1558.1538461538462,
      scale: 390 / 720,
    }

    expect(screenToBoard(metrics, 422, 195)).to.deep.equal({
      x: 779.0769230769231,
      y: 360,
    })
    expect(boardToScreen(metrics, { x: 779.0769230769231, y: 360 })).to.deep.equal({
      x: 422,
      y: 195,
    })

    const boardRect = screenRectToBoardRect(
      metrics,
      new DOMRect(100, 50, 200, 120),
    )

    expect(boardRect.x).to.be.closeTo(184.62, 0.01)
    expect(boardRect.y).to.be.closeTo(92.31, 0.01)
    expect(boardRect.width).to.be.closeTo(369.23, 0.01)
    expect(boardRect.height).to.be.closeTo(221.54, 0.01)
  })

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

  it('scales the full game stage into mobile landscape', () => {
    cy.viewport(844, 390)
    cy.mount(
      <TcgThemeProvider>
        <App />
      </TcgThemeProvider>,
    )

    cy.get('[data-cy="game-stage-frame"]').then(($stageFrame) => {
      const rect = $stageFrame[0].getBoundingClientRect()

      expect(rect.width).to.be.closeTo(844, 1)
      expect(rect.height).to.be.closeTo(390, 1)
      expect(rect.left).to.be.closeTo(0, 1)
      expect(rect.top).to.be.closeTo(0, 1)
    })
    cy.get('[data-cy="game-stage"]').then(($stage) => {
      const rect = $stage[0].getBoundingClientRect()

      expect(rect.width).to.be.closeTo(844, 1)
      expect(rect.height).to.be.closeTo(390, 1)
      expect($stage[0].clientWidth).to.be.greaterThan(1280)
    })

    cy.get('[data-cy="opening-monster-panel"]').should('be.visible')
    cy.get('[data-cy="choose-monster-cindermane"]').should('be.visible')
    cy.get('[data-cy="choose-monster-emberwhelp"]').should('be.visible')
    cy.get('[data-cy="choose-monster-nightmoth"]').should('be.visible')
  })

  it('starts a chosen monster on the battlefield', () => {
    mountApp()

    startWithStance('veiled', 'nightmoth')
    cy.get('[data-cy="player-active-monster"]').contains('Nightmoth')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Veiled')
  })

  it('chooses opening monster and stance from touch taps', () => {
    cy.viewport(844, 390)
    cy.mount(
      <TcgThemeProvider>
        <App />
      </TcgThemeProvider>,
    )

    pointerTap('[data-cy="choose-monster-cindermane"]')
    pointerTap('[data-cy="choose-opening-frenzy"]')

    cy.get('[data-cy="player-active-monster"]').contains('Cindermane')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Frenzy')
  })

  it('renders cards with the shared template frame', () => {
    mountApp()

    cy.get('[data-cy="choose-monster-cindermane"]').within(() => {
      cy.get('img[src="/card-templates/blank-standard.png"]').should('exist')
    })
    startWithStance('hunting')
    cy.get('[data-cy="player-active-monster"]').within(() => {
      cy.get('img[src="/card-templates/blank-standard.png"]').should('exist')
    })
    cy.get('[data-cy="card-rake"]').first().within(() => {
      cy.get('img[src="/card-templates/blank-standard.png"]').should('exist')
    })
  })

  it('shows public bench monsters as cards', () => {
    mountApp()

    chooseOpeningMonster()
    cy.get('[data-cy="rival-bench-stack"]').click()
    cy.get('[data-cy="focused-card"]').contains('Shellmaw')
    cy.get('[data-cy="focused-card"]').contains('Cindermane')
    cy.get('[data-cy="close-focused-card"]').click({ force: true })
  })

  it('opens and closes bench details from touch taps', () => {
    cy.viewport(844, 390)
    cy.mount(
      <TcgThemeProvider>
        <App />
      </TcgThemeProvider>,
    )

    chooseOpeningMonster()
    pointerTap('[data-cy="rival-bench-stack"]')
    cy.get('[data-cy="focused-card"]').contains('Shellmaw')
    pointerTapAt('[data-cy="focused-card"]', 0.08, 0.12)
    cy.get('[data-cy="focused-card"]').should('not.exist')
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
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Frenzy')
    cy.get('[data-cy="close-focused-card"]').click({ force: true })
    dragCardToActiveSlot('[data-cy="card-rake"]')

    cy.get('[data-cy="rival-active-monster"]').contains('9/14')
    cy.get('[data-cy="player-active-monster"]').contains('17/18')
  })

  it('allows one free stance switch at the start of the turn', () => {
    mountApp()

    startWithStance('hunting')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="stance-ashcloak"]').click()
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Ashcloak')
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

  it('plays a hand card with a mobile pointer drag', () => {
    cy.viewport(844, 390)
    cy.mount(
      <TcgThemeProvider>
        <App />
      </TcgThemeProvider>,
    )

    startWithStance('hunting')
    pointerPlayCardToActiveSlot('[data-cy="card-rake"]')

    cy.get('[data-cy="rival-active-monster"]').contains('11/14')
    cy.get('[data-cy="focus-count"]').contains('2')
  })

  it('reports touch debug zone matches', () => {
    cy.viewport(844, 390)
    cy.mount(
      <TcgThemeProvider>
        <App />
      </TcgThemeProvider>,
    )

    startWithStance('hunting')
    cy.get('[data-cy="settings-toggle"]').click()
    cy.get('[data-cy="touch-debug-toggle"]').click()
    pointerTap('[data-cy="end-turn-button"]')

    cy.get('[data-cy="touch-debug-panel"]').contains('Zone: end-turn')
    cy.get('[data-cy="touch-debug-panel"]').contains('Action: tap')
    cy.get('[data-cy="touch-debug-crosshair"]').should('be.visible')
  })

  it('attaches adaptations to the active monster', () => {
    mountApp()

    startWithStance('hunting')
    dragCardToActiveSlot('[data-cy="card-hardenedScar"]')
    cy.get('[data-cy="player-active-monster"]').click()
    cy.get('[data-cy="focused-card"]').contains('Hardened Scar')
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
