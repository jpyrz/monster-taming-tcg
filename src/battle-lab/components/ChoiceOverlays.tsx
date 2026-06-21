import { useRef, type ReactNode } from 'react'
import { MonsterChoiceCard } from '../../cards/components/MonsterCards'
import {
  getActiveMonsterDefinition,
  getAvailableReplacementOptions,
  getMonsterDefinition,
  type BattleState,
} from '../../game/battle'
import { useBoardHitZone } from '../input/useBoardInput'
import styles from './BattleLabLayout.module.scss'

type ChoiceOverlaysProps = {
  onOpeningMonster: (rosterIndex: number) => void
  onOpeningStance: (stanceId: string) => void
  onReplacement: (rosterIndex: number, stanceId: string) => void
  state: BattleState
}

export function ChoiceOverlays({
  onOpeningMonster,
  onOpeningStance,
  onReplacement,
  state,
}: ChoiceOverlaysProps) {
  if (state.phase === 'choose-opening-monster') {
    return (
      <section className={styles.choicePanel} data-cy="opening-monster-panel">
        <span>Opening monster</span>
        <h2>Choose who starts on the field.</h2>
        <div className={styles.choiceGrid}>
          {state.player.roster.map((monster, rosterIndex) => {
            const definition = getMonsterDefinition(monster)

            return (
              <ChoiceButton
                key={monster.instanceId}
                data-cy={`choose-monster-${definition.id}`}
                onClick={() => onOpeningMonster(rosterIndex)}
              >
                <MonsterChoiceCard
                  definition={definition}
                  label="Starter"
                  monster={monster}
                />
              </ChoiceButton>
            )
          })}
        </div>
      </section>
    )
  }

  if (state.phase === 'choose-opening-stance') {
    const active = getActiveMonsterDefinition(state.player)

    return (
      <section className={styles.choicePanel} data-cy="opening-stance-panel">
        <span>Opening stance</span>
        <h2>Choose how {active.name} enters the field.</h2>
        <div className={styles.choiceGrid}>
          {active.stances.map((stance) => (
            <ChoiceButton
              key={stance.id}
              data-cy={`choose-opening-${stance.id}`}
              onClick={() => onOpeningStance(stance.id)}
            >
              <span className={styles.stanceChoice}>
                <strong>{stance.name}</strong>
                <small>{stance.text}</small>
              </span>
            </ChoiceButton>
          ))}
        </div>
      </section>
    )
  }

  if (state.phase === 'player-replace') {
    return (
      <section className={styles.choicePanel} data-cy="replacement-panel">
        <span>Replacement</span>
        <h2>Choose the next monster and its starting stance.</h2>
        {getAvailableReplacementOptions(state).map((option) => (
          <div key={option.monster.instanceId} className={styles.replacement}>
            <strong>{option.definition.name}</strong>
            <div className={styles.choiceGrid}>
              {option.definition.stances.map((stance) => (
                <ChoiceButton
                  key={stance.id}
                  data-cy={`replace-${option.definition.id}-${stance.id}`}
                  onClick={() => onReplacement(option.index, stance.id)}
                >
                  <span className={styles.stanceChoice}>
                    <strong>{stance.name}</strong>
                    <small>{stance.text}</small>
                  </span>
                </ChoiceButton>
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  return null
}

function ChoiceButton({
  children,
  'data-cy': dataCy,
  onClick,
}: {
  children: ReactNode
  'data-cy': string
  onClick: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useBoardHitZone({
    id: dataCy,
    onTap: onClick,
    priority: 60,
    ref: buttonRef,
  })

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.choiceCardButton}
      data-cy={dataCy}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
