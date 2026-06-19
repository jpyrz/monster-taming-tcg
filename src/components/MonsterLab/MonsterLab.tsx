import {
  ActionIcon,
  Badge,
  Button,
  Progress,
  SegmentedControl,
} from '@mantine/core'
import {
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from 'react'
import {
  chooseOpeningStance,
  chooseReplacement,
  createInitialBattle,
  endPlayerTurn,
  getActiveMonster,
  getActiveMonsterDefinition,
  getAvailableReplacementOptions,
  getCardDefinition,
  getCurrentStance,
  getMonsterDefinition,
  playCard,
  switchActiveStance,
  type BattleState,
  type MonsterInstance,
  type TamerState,
} from '../../game/battle'
import type { CardDefinition, Owner } from '../../game/cards'
import { useTcgTheme } from '../../theme/themeContext'
import styles from './MonsterLab.module.scss'

type FocusedCard =
  | { kind: 'hand'; index: number }
  | { kind: 'monster'; owner: Owner; rosterIndex: number }
  | { kind: 'bench'; owner: Owner }

export function MonsterLab() {
  const [state, setState] = useState<BattleState>(createInitialBattle)
  const [focusedCard, setFocusedCard] = useState<FocusedCard | null>(null)
  const [draggedHandIndex, setDraggedHandIndex] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { themeId, setThemeId, themeOptions } = useTcgTheme()
  const playerActive = getActiveMonster(state.player)
  const playerDefinition = getActiveMonsterDefinition(state.player)
  const focusedCardContent = getFocusedCardContent(state, focusedCard)

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

  return (
    <main className={styles.appShell}>
      <div className={styles.settingsHud}>
        <ActionIcon
          aria-label="Settings"
          className={styles.settingsButton}
          color="brand"
          data-cy="settings-toggle"
          onClick={() => setSettingsOpen((isOpen) => !isOpen)}
          size="lg"
          variant="filled"
        >
          ⚙
        </ActionIcon>
        {settingsOpen && (
          <section className={styles.settingsMenu} data-cy="settings-menu">
            <span>Settings</span>
            <SegmentedControl
              value={themeId}
              onChange={(value) => setThemeId(value as typeof themeId)}
              data={Object.values(themeOptions).map((theme) => ({
                label: theme.label,
                value: theme.id,
              }))}
            />
            <Button color="brand" variant="light" onClick={resetBattle}>
              Reset
            </Button>
            <div className={styles.settingsLog} aria-label="Battle log">
              <span>Battle log</span>
              {state.log.slice(0, 8).map((entry, index) => (
                <p key={`${entry}-${index}`}>{entry}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className={styles.boardArea}>
        <div className={styles.opponentHand} aria-label="Rival hand">
          {state.rival.hand.slice(0, 5).map((_, index) => (
            <span
              key={index}
              className={styles.cardBack}
              style={{ '--card-index': index } as CSSProperties}
            />
          ))}
        </div>

        <div className={styles.opponentBenchZone}>
          <BenchStack
            label="Rival bench"
            owner="rival"
            tamer={state.rival}
            onClick={() => setFocusedCard({ kind: 'bench', owner: 'rival' })}
          />
        </div>

        <div className={styles.boardRow} data-owner="rival">
          <BoardSlot owner="rival">
            <MonsterCard
              active
              monster={getActiveMonster(state.rival)}
              onClick={() =>
                setFocusedCard({
                  kind: 'monster',
                  owner: 'rival',
                  rosterIndex: state.rival.activeIndex,
                })
              }
              side="rival"
            />
          </BoardSlot>
        </div>

        <div className={styles.boardRow} data-owner="player">
          <BoardSlot
            isDropTarget={state.phase === 'player-turn'}
            onDragOver={(event) => {
              if (state.phase === 'player-turn') {
                event.preventDefault()
              }
            }}
            onDrop={handleActiveDrop}
            owner="player"
          >
            <MonsterCard
              active
              monster={playerActive}
              onClick={() =>
                setFocusedCard({
                  kind: 'monster',
                  owner: 'player',
                  rosterIndex: state.player.activeIndex,
                })
              }
              side="player"
            />
          </BoardSlot>
        </div>
      </section>

      {state.phase === 'choose-opening-stance' && (
        <section className={styles.choicePanel} data-cy="opening-stance-panel">
          <span>Opening stance</span>
          <h2>Choose how {playerDefinition.name} enters the field.</h2>
          <div className={styles.choiceGrid}>
            {playerDefinition.stances.map((stance) => (
              <button
                key={stance.id}
                type="button"
                onClick={() => setState(chooseOpeningStance(state, stance.id))}
                data-cy={`choose-opening-${stance.id}`}
              >
                <strong>{stance.name}</strong>
                <small>{stance.text}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      {state.phase === 'player-replace' && (
        <section className={styles.choicePanel} data-cy="replacement-panel">
          <span>Replacement</span>
          <h2>Choose the next monster and its starting stance.</h2>
          {getAvailableReplacementOptions(state).map((option) => (
            <div key={option.monster.instanceId} className={styles.replacement}>
              <strong>{option.definition.name}</strong>
              <div className={styles.choiceGrid}>
                {option.definition.stances.map((stance) => (
                  <button
                    key={stance.id}
                    type="button"
                    onClick={() =>
                      setState(chooseReplacement(state, option.index, stance.id))
                    }
                    data-cy={`replace-${option.definition.id}-${stance.id}`}
                  >
                    <strong>{stance.name}</strong>
                    <small>{stance.text}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {state.phase === 'player-turn' && (
        <section className={styles.commandPanel}>
          <div className={styles.handZone}>
            <BenchStack
              label="Your bench"
              owner="player"
              tamer={state.player}
              onClick={() => setFocusedCard({ kind: 'bench', owner: 'player' })}
            />
            <div className={styles.hand} data-cy="hand">
              {state.player.hand.map((cardId, index) => {
                const card = getCardDefinition(cardId)
                const playable = state.player.focus >= card.cost
                const cardOffset = index - (state.player.hand.length - 1) / 2
                return (
                  <button
                    key={`${cardId}-${index}`}
                    type="button"
                    className={styles.handCard}
                    aria-disabled={!playable}
                    data-dragging={draggedHandIndex === index || undefined}
                    data-focused={
                      focusedCard?.kind === 'hand' && focusedCard.index === index
                        ? true
                        : undefined
                    }
                    data-playable={playable || undefined}
                    draggable={playable}
                    onClick={() => setFocusedCard({ kind: 'hand', index })}
                    onDragEnd={() => setDraggedHandIndex(null)}
                    onDragStart={(event) => {
                      if (!playable) return
                      setFocusedCard(null)
                      setDraggedHandIndex(index)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', String(index))
                    }}
                    style={{
                      '--card-index': index,
                      '--card-count': state.player.hand.length,
                      '--card-lift': Math.abs(cardOffset),
                      '--card-offset': cardOffset,
                    } as CSSProperties}
                    data-cy={`card-${card.id}`}
                  >
                    <CommandCardFace card={card} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.controls}>
            <div>
              <strong data-cy="focus-count">{state.player.focus}</strong>
              <span>Focus</span>
            </div>
            <div>
              <strong>{state.player.deck.length}</strong>
              <span>Deck</span>
            </div>
            <div>
              <strong>{state.player.discard.length}</strong>
              <span>Discard</span>
            </div>
            <Button color="brand" onClick={() => setState(endPlayerTurn(state))}>
              End turn
            </Button>
          </div>
        </section>
      )}

      {focusedCardContent && (
        <div className={styles.focusOverlay} data-cy="focused-card">
          <button
            type="button"
            aria-label="Close card details"
            className={styles.focusBackdrop}
            data-cy="close-focused-card"
            onClick={() => setFocusedCard(null)}
          />
          <span
            className={
              focusedCardContent.kind === 'bench'
                ? styles.benchFocus
                : styles.focusCard
            }
          >
            {focusedCardContent.kind === 'monster' ? (
              <MonsterDetailFace
                canChangeStance={
                  focusedCard?.kind === 'monster' &&
                  focusedCard.owner === 'player' &&
                  focusedCard.rosterIndex === state.player.activeIndex &&
                  state.phase === 'player-turn'
                }
                freeStanceChange={state.player.freeStanceChange}
                monster={focusedCardContent.monster}
                onChangeStance={(stanceId) => {
                  setFocusedCard(null)
                  setState((currentState) =>
                    switchActiveStance(currentState, 'player', stanceId),
                  )
                }}
              />
            ) : focusedCardContent.kind === 'bench' ? (
              <BenchDetailFace
                label={focusedCardContent.label}
                monsters={focusedCardContent.monsters}
              />
            ) : (
              <CommandCardFace card={focusedCardContent.card} expanded />
            )}
          </span>
          <em>
            Tap outside to return.
          </em>
        </div>
      )}
    </main>
  )
}

function MonsterCard({
  active,
  monster,
  onClick,
  side,
}: {
  active: boolean
  monster: MonsterInstance
  onClick: () => void
  side: 'player' | 'rival'
}) {
  const definition = getMonsterDefinition(monster)
  const stance = getCurrentStance(monster)
  const healthValue = (monster.currentHealth / definition.maxHealth) * 100

  return (
    <button
      type="button"
      className={styles.boardCard}
      data-active={active || undefined}
      data-defeated={monster.currentHealth <= 0 || undefined}
      data-side={side}
      data-cy={active ? `${side}-active-monster` : `${side}-bench-monster`}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <Badge color="brand">SPD {definition.speed}</Badge>
        <span>{definition.traits.join(' / ')}</span>
      </div>
      <strong>{definition.name}</strong>
      <em>{stance ? stance.name : 'Choose stance'}</em>
      <p>{stance?.text ?? 'Click to inspect all stances.'}</p>
      <Progress
        color={monster.currentHealth <= 5 ? 'red' : 'green'}
        value={healthValue}
      />
      <small>
        {monster.currentHealth}/{definition.maxHealth} HP
      </small>
      <div className={styles.adaptations}>
        {monster.adaptations.length === 0 ? (
          <small>No adaptations</small>
        ) : (
          monster.adaptations.map((adaptation) => (
            <Badge key={adaptation} color="brand" variant="light">
              {adaptation}
            </Badge>
          ))
        )}
      </div>
    </button>
  )
}

function BenchStack({
  label,
  onClick,
  owner,
  tamer,
}: {
  label: string
  onClick: () => void
  owner: Owner
  tamer: TamerState
}) {
  const benchMonsters = getBenchMonsters(tamer)
  const standingBenchCount = benchMonsters.filter(
    ({ monster }) => monster.currentHealth > 0,
  ).length

  return (
    <button
      type="button"
      className={styles.benchStack}
      data-cy={`${owner}-bench-stack`}
      data-owner={owner}
      onClick={onClick}
    >
      <span>{label}</span>
      <strong>{standingBenchCount}</strong>
      <small>bench</small>
      <i />
      <i />
      <i />
    </button>
  )
}

function BoardSlot({
  children,
  isDropTarget,
  onDragOver,
  onDrop,
  owner,
}: {
  children: ReactNode
  isDropTarget?: boolean
  onDragOver?: (event: DragEvent) => void
  onDrop?: (event: DragEvent) => void
  owner: Owner
}) {
  return (
    <div
      className={styles.boardSlot}
      data-cy={owner === 'player' && isDropTarget ? 'player-active-slot' : undefined}
      data-drop-target={isDropTarget || undefined}
      data-owner={owner}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  )
}

function CommandCardFace({
  card,
  expanded,
}: {
  card: CardDefinition
  expanded?: boolean
}) {
  return (
    <>
      <div className={styles.cardTop}>
        <Badge color="brand">{card.cost}</Badge>
        <span>{card.type}</span>
      </div>
      <strong>{card.name}</strong>
      <em>{card.tags.length > 0 ? card.tags.join(', ') : 'Support'}</em>
      <p>{card.text}</p>
      <div className={styles.cardStats}>
        <span>{card.damage ? `${card.damage} DMG` : card.guard ? `${card.guard} GRD` : 'Tactic'}</span>
        <span>{expanded ? 'Command card' : 'Drag to active'}</span>
      </div>
    </>
  )
}

function MonsterDetailFace({
  canChangeStance,
  freeStanceChange,
  monster,
  onChangeStance,
}: {
  canChangeStance?: boolean
  freeStanceChange?: boolean
  monster: MonsterInstance
  onChangeStance?: (stanceId: string) => void
}) {
  const definition = getMonsterDefinition(monster)
  const stance = getCurrentStance(monster)

  return (
    <>
      <div className={styles.cardTop}>
        <Badge color="brand">SPD {definition.speed}</Badge>
        <span>{definition.traits.join(' / ')}</span>
      </div>
      <strong>{definition.name}</strong>
      <em>{stance ? `${stance.name} stance` : 'No stance chosen'}</em>
      <p>{definition.adaptationTrigger}</p>
      <div className={styles.stanceList}>
        {definition.stances.map((candidate) => (
          canChangeStance ? (
            <button
              key={candidate.id}
              type="button"
              disabled={!freeStanceChange || candidate.id === monster.stanceId}
              onClick={() => onChangeStance?.(candidate.id)}
              data-current={candidate.id === monster.stanceId || undefined}
              data-cy={`stance-${candidate.id}`}
            >
              <strong>{candidate.name}</strong>
              <small>{candidate.text}</small>
            </button>
          ) : (
            <span
              key={candidate.id}
              data-current={candidate.id === monster.stanceId || undefined}
            >
              <strong>{candidate.name}</strong>
              <small>{candidate.text}</small>
            </span>
          )
        ))}
      </div>
      <div className={styles.cardStats}>
        <span>
          {monster.currentHealth}/{definition.maxHealth} HP
        </span>
        <span>
          {monster.adaptations.length > 0
            ? monster.adaptations.join(', ')
            : 'No adaptations'}
        </span>
      </div>
    </>
  )
}

function BenchDetailFace({
  label,
  monsters,
}: {
  label: string
  monsters: Array<{ monster: MonsterInstance; rosterIndex: number }>
}) {
  return (
    <>
      <div className={styles.benchHeader}>
        <span>{label}</span>
        <strong>Bench cards</strong>
        <p>Public monster cards, held off the active battle line.</p>
      </div>
      <div className={styles.benchSpread}>
        {monsters.map(({ monster }) => (
          <BenchMonsterCard key={monster.instanceId} monster={monster} />
        ))}
      </div>
    </>
  )
}

function BenchMonsterCard({ monster }: { monster: MonsterInstance }) {
  const definition = getMonsterDefinition(monster)
  const stance = getCurrentStance(monster)

  return (
    <article
      className={styles.benchCard}
      data-defeated={monster.currentHealth <= 0 || undefined}
    >
      <div className={styles.cardTop}>
        <Badge color="brand">SPD {definition.speed}</Badge>
        <span>{definition.traits.join(' / ')}</span>
      </div>
      <strong>{definition.name}</strong>
      <em>{stance ? `${stance.name} stance` : 'No stance chosen'}</em>
      <p>{definition.adaptationTrigger}</p>
      <div className={styles.stanceList}>
        {definition.stances.map((candidate) => (
          <span
            key={candidate.id}
            data-current={candidate.id === monster.stanceId || undefined}
          >
            <strong>{candidate.name}</strong>
            <small>{candidate.text}</small>
          </span>
        ))}
      </div>
      <div className={styles.cardStats}>
        <span>
          {monster.currentHealth}/{definition.maxHealth} HP
        </span>
        <span>
          {monster.adaptations.length > 0
            ? monster.adaptations.join(', ')
            : 'No adaptations'}
        </span>
      </div>
    </article>
  )
}

function getFocusedCardContent(
  state: BattleState,
  focusedCard: FocusedCard | null,
) {
  if (!focusedCard) {
    return null
  }

  if (focusedCard.kind === 'hand') {
    const cardId = state.player.hand[focusedCard.index]
    return cardId
      ? { kind: 'command' as const, card: getCardDefinition(cardId) }
      : null
  }

  if (focusedCard.kind === 'bench') {
    return {
      kind: 'bench' as const,
      label: focusedCard.owner === 'player' ? 'Your bench' : 'Rival bench',
      monsters: getBenchMonsters(state[focusedCard.owner]),
    }
  }

  const monster = state[focusedCard.owner].roster[focusedCard.rosterIndex]
  return monster ? { kind: 'monster' as const, monster } : null
}

function getBenchMonsters(tamer: TamerState) {
  return tamer.roster
    .map((monster, rosterIndex) => ({ monster, rosterIndex }))
    .filter(({ rosterIndex }) => rosterIndex !== tamer.activeIndex)
}
