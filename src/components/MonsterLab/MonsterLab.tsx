import { Badge, Button, Progress, SegmentedControl } from '@mantine/core'
import { useState } from 'react'
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
import { useTcgTheme } from '../../theme/themeContext'
import styles from './MonsterLab.module.scss'

export function MonsterLab() {
  const [state, setState] = useState<BattleState>(createInitialBattle)
  const { themeId, setThemeId, themeOptions } = useTcgTheme()
  const playerActive = getActiveMonster(state.player)
  const rivalActive = getActiveMonster(state.rival)
  const playerDefinition = getActiveMonsterDefinition(state.player)

  function resetBattle() {
    setState(createInitialBattle())
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

      <section className={styles.scoreboard}>
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

      <section className={styles.battlefield}>
        <RosterPanel ownerLabel="Rival" tamer={state.rival} />

        <div className={styles.activeDuel}>
          <MonsterCard monster={rivalActive} side="rival" />
          <div className={styles.versus}>
            <strong>VS</strong>
            <span>Focus, stance, command</span>
          </div>
          <MonsterCard monster={playerActive} side="player" />
        </div>

        <RosterPanel ownerLabel="You" tamer={state.player} />
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

          <div className={styles.hand} data-cy="hand">
            {state.player.hand.map((cardId, index) => {
              const card = getCardDefinition(cardId)
              const playable = state.player.focus >= card.cost
              return (
                <button
                  key={`${cardId}-${index}`}
                  type="button"
                  className={styles.handCard}
                  disabled={!playable}
                  onClick={() => setState(playCard(state, 'player', index))}
                  data-cy={`card-${card.id}`}
                >
                  <div className={styles.cardTop}>
                    <Badge color="brand">{card.cost}</Badge>
                    <span>{card.type}</span>
                  </div>
                  <strong>{card.name}</strong>
                  <em>{card.tags.length > 0 ? card.tags.join(', ') : 'Support'}</em>
                  <p>{card.text}</p>
                </button>
              )
            })}
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

function RosterPanel({
  ownerLabel,
  tamer,
}: {
  ownerLabel: string
  tamer: TamerState
}) {
  return (
    <aside className={styles.roster}>
      <span>{ownerLabel} roster</span>
      {tamer.roster.map((monster, index) => (
        <RosterTile
          key={monster.instanceId}
          monster={monster}
          active={index === tamer.activeIndex}
        />
      ))}
    </aside>
  )
}

function RosterTile({
  active,
  monster,
}: {
  active: boolean
  monster: MonsterInstance
}) {
  const definition = getMonsterDefinition(monster)

  return (
    <article
      className={styles.rosterTile}
      data-active={active || undefined}
      data-defeated={monster.currentHealth <= 0 || undefined}
    >
      <strong>{definition.name}</strong>
      <small>
        {monster.currentHealth}/{definition.maxHealth} HP
      </small>
    </article>
  )
}

function MonsterCard({
  monster,
  side,
}: {
  monster: MonsterInstance
  side: 'player' | 'rival'
}) {
  const definition = getMonsterDefinition(monster)
  const stance = getCurrentStance(monster)
  const healthValue = (monster.currentHealth / definition.maxHealth) * 100

  return (
    <article
      className={styles.monsterCard}
      data-side={side}
      data-cy={`${side}-active-monster`}
    >
      <div className={styles.monsterHeader}>
        <span>{definition.traits.join(' / ')}</span>
        <Badge color="brand">SPD {definition.speed}</Badge>
      </div>
      <h2>{definition.name}</h2>
      <Progress
        color={monster.currentHealth <= 5 ? 'red' : 'green'}
        value={healthValue}
      />
      <div className={styles.monsterStats}>
        <strong>
          {monster.currentHealth}/{definition.maxHealth} HP
        </strong>
        <span>{stance ? stance.name : 'No stance'}</span>
      </div>
      <p>{stance?.text ?? 'Choose a stance when this monster enters.'}</p>
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
    </article>
  )
}
