import { Badge, Button, Progress, SegmentedControl } from '@mantine/core'
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
    setState(playCard(state, 'player', handIndex))
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
      <header className={styles.header}>
        <div>
          <span>Prototype lab</span>
          <h1>Monster Command TCG</h1>
          <p>
            A roster battle where commands are generic orders and monsters turn
            those orders into stance-driven tactics.
          </p>
        </div>
        <div className={styles.headerActions}>
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
        </div>
      </header>

      <section className={styles.playerBanner}>
        <TamerBanner label="Rival" tamer={state.rival} />
        <div className={styles.turnBadge}>
          <span>Turn {state.turn}</span>
          <strong>
            {state.phase === 'victory'
              ? 'Victory'
              : state.phase === 'defeat'
                ? 'Defeat'
                : state.phase === 'choose-opening-stance'
                  ? 'Choose stance'
                  : state.phase === 'player-replace'
                    ? 'Choose replacement'
                    : 'Your turn'}
          </strong>
        </div>
        <TamerBanner label="You" tamer={state.player} />
      </section>

      <section className={styles.boardArea}>
        <div className={styles.opponentZone}>
          <div className={styles.opponentHand} aria-label="Rival hand">
            {state.rival.hand.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={styles.cardBack}
                style={{ '--card-index': index } as CSSProperties}
              />
            ))}
          </div>
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

        <div className={styles.versus}>
          <strong>Command Line</strong>
          <span>
            Drag a command from hand onto {playerDefinition.name}; click any card
            to inspect it.
          </span>
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
          <div className={styles.stancePanel}>
            <div>
              <span>Stance</span>
              <h2>{getCurrentStance(playerActive)?.name ?? 'Unset'}</h2>
              <p>{getCurrentStance(playerActive)?.text}</p>
            </div>
            <div className={styles.stanceButtons}>
              {playerDefinition.stances.map((stance) => (
                <Button
                  key={stance.id}
                  color="brand"
                  variant={playerActive.stanceId === stance.id ? 'filled' : 'light'}
                  disabled={!state.player.freeStanceChange}
                  onClick={() => setState(switchActiveStance(state, 'player', stance.id))}
                  data-cy={`stance-${stance.id}`}
                >
                  {stance.name}
                </Button>
              ))}
            </div>
          </div>

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

      <section className={styles.log} aria-label="Battle log">
        {state.log.slice(0, 8).map((entry, index) => (
          <p key={`${entry}-${index}`}>{entry}</p>
        ))}
      </section>

      {focusedCardContent && (
        <button
          className={styles.focusOverlay}
          data-cy="focused-card"
          onClick={() => setFocusedCard(null)}
        >
          <span className={styles.focusCard}>
            {focusedCardContent.kind === 'monster' ? (
              <MonsterDetailFace monster={focusedCardContent.monster} />
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
            Tap outside to return. Drag command cards from your hand onto your
            active monster slot.
          </em>
        </button>
      )}
    </main>
  )
}

function TamerBanner({ label, tamer }: { label: string; tamer: TamerState }) {
  const active = getActiveMonster(tamer)
  const definition = getMonsterDefinition(active)
  const defeated = tamer.roster.filter((monster) => monster.currentHealth <= 0).length

  return (
    <article className={styles.tamerBanner}>
      <span>{label}</span>
      <strong>{definition.name}</strong>
      <small>
        {3 - defeated}/3 standing · {tamer.focus} Focus
      </small>
    </article>
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

function MonsterDetailFace({ monster }: { monster: MonsterInstance }) {
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
      <div className={styles.cardTop}>
        <Badge color="brand">{monsters.length}</Badge>
        <span>{label}</span>
      </div>
      <strong>{label}</strong>
      <em>Visible bench</em>
      <p>Benched monsters are public information, but they stay off the active battle line.</p>
      <div className={styles.benchSpread}>
        {monsters.map(({ monster }) => (
          <span key={monster.instanceId}>
            <MonsterDetailFace monster={monster} />
          </span>
        ))}
      </div>
    </>
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
