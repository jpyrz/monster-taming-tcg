import { useState, type DragEvent } from 'react'
import { useTcgTheme } from '../theme/themeContext'
import {
  chooseOpeningMonster,
  chooseOpeningStance,
  chooseReplacement,
  createInitialBattle,
  endPlayerTurn,
  getCardDefinition,
  playCard,
  switchActiveStance,
  type BattleState,
  type MonsterInstance,
  type TamerState,
} from '../game/battle'
import type { Owner } from '../game/cards'
import {
  CardDetailOverlay,
  type FocusedCardContent,
} from './components/CardDetailOverlay'
import { ChoiceOverlays } from './components/ChoiceOverlays'
import { GameViewport } from './components/GameViewport'
import { Playmat } from './components/Playmat'
import { PlayerHand } from './components/PlayerHand'
import { SettingsMenu } from './components/SettingsMenu'
import { TurnControls } from './components/TurnControls'
import styles from './components/BattleLabLayout.module.scss'

type FocusedCard =
  | { kind: 'bench'; owner: Owner }
  | { index: number; kind: 'hand' }
  | { kind: 'monster'; owner: Owner; rosterIndex: number }

export function MonsterLabPage() {
  const [state, setState] = useState<BattleState>(createInitialBattle)
  const [focusedCard, setFocusedCard] = useState<FocusedCard | null>(null)
  const [draggedHandIndex, setDraggedHandIndex] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { themeId, setThemeId, themeOptions } = useTcgTheme()
  const focusedCardContent = getFocusedCardContent({
    focusedCard,
    onChangeStance: (stanceId) => {
      setFocusedCard(null)
      setState((currentState) =>
        switchActiveStance(currentState, 'player', stanceId),
      )
    },
    state,
  })

  function resetBattle() {
    setFocusedCard(null)
    setDraggedHandIndex(null)
    setState(createInitialBattle())
  }

  function playDraggedCard(handIndex: number) {
    setFocusedCard(null)
    setDraggedHandIndex(null)
    setState((currentState) => playCard(currentState, 'player', handIndex))
  }

  function handleActiveDrop(event: DragEvent) {
    event.preventDefault()
    if (state.phase !== 'player-turn') return
    const handIndex = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isNaN(handIndex)) return
    playDraggedCard(handIndex)
  }

  function handleHandDragStart(event: DragEvent, handIndex: number) {
    const card = getCardDefinition(state.player.hand[handIndex])
    if (!card || state.player.focus < card.cost) return
    setFocusedCard(null)
    setDraggedHandIndex(handIndex)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(handIndex))
  }

  return (
    <main className={styles.appShell}>
      <GameViewport
        overlays={
          <>
            <SettingsMenu
              log={state.log}
              onReset={resetBattle}
              onThemeChange={setThemeId}
              onToggle={() => setSettingsOpen((isOpen) => !isOpen)}
              open={settingsOpen}
              themeId={themeId}
              themeOptions={themeOptions}
            />

            <ChoiceOverlays
              onOpeningMonster={(rosterIndex) =>
                setState((currentState) =>
                  chooseOpeningMonster(currentState, rosterIndex),
                )
              }
              onOpeningStance={(stanceId) =>
                setState((currentState) =>
                  chooseOpeningStance(currentState, stanceId),
                )
              }
              onReplacement={(rosterIndex, stanceId) =>
                setState((currentState) =>
                  chooseReplacement(currentState, rosterIndex, stanceId),
                )
              }
              state={state}
            />

            {state.phase === 'player-turn' ? (
              <PlayerHand
                draggedHandIndex={draggedHandIndex}
                focusedHandIndex={
                  focusedCard?.kind === 'hand' ? focusedCard.index : undefined
                }
                onBenchClick={() =>
                  setFocusedCard({ kind: 'bench', owner: 'player' })
                }
                onCardClick={(index) => setFocusedCard({ kind: 'hand', index })}
                onDragEnd={() => setDraggedHandIndex(null)}
                onDragStart={handleHandDragStart}
                onPointerPlay={playDraggedCard}
                state={state}
              />
            ) : null}

            <TurnControls
              onEndTurn={() =>
                setState((currentState) => endPlayerTurn(currentState))
              }
              state={state}
            />
          </>
        }
      >
        <Playmat
          onActiveDrop={handleActiveDrop}
          onBenchClick={(owner) => setFocusedCard({ kind: 'bench', owner })}
          onMonsterClick={(owner, rosterIndex) =>
            setFocusedCard({ kind: 'monster', owner, rosterIndex })
          }
          state={state}
        />
      </GameViewport>

      {focusedCardContent ? (
        <CardDetailOverlay
          content={focusedCardContent}
          onClose={() => setFocusedCard(null)}
        />
      ) : null}
    </main>
  )
}

function getFocusedCardContent({
  focusedCard,
  onChangeStance,
  state,
}: {
  focusedCard: FocusedCard | null
  onChangeStance: (stanceId: string) => void
  state: BattleState
}): FocusedCardContent | null {
  if (!focusedCard) {
    return null
  }

  if (focusedCard.kind === 'hand') {
    const cardId = state.player.hand[focusedCard.index]
    return cardId
      ? { kind: 'command', card: getCardDefinition(cardId) }
      : null
  }

  if (focusedCard.kind === 'bench') {
    return {
      kind: 'bench',
      label: focusedCard.owner === 'player' ? 'Your bench' : 'Rival bench',
      monsters: getBenchMonsters(state[focusedCard.owner]),
    }
  }

  const monster = state[focusedCard.owner].roster[focusedCard.rosterIndex]
  if (!monster) {
    return null
  }

  return {
    canChangeStance:
      focusedCard.owner === 'player' &&
      focusedCard.rosterIndex === state.player.activeIndex &&
      state.phase === 'player-turn',
    freeStanceChange: state.player.freeStanceChange,
    kind: 'monster',
    monster,
    onChangeStance,
  }
}

function getBenchMonsters(tamer: TamerState) {
  return tamer.roster
    .map((monster: MonsterInstance, rosterIndex) => ({ monster, rosterIndex }))
    .filter(({ rosterIndex }) => rosterIndex !== tamer.activeIndex)
}
