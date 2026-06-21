import { useRef } from 'react'
import { CommandCardFace } from '../../cards/components/CommandCards'
import {
  MonsterChoiceCard,
  MonsterDetailCard,
} from '../../cards/components/MonsterCards'
import {
  getCurrentStance,
  getMonsterDefinition,
  type MonsterInstance,
} from '../../game/battle'
import type { CardDefinition } from '../../game/cards'
import { useBoardHitZone } from '../input/useBoardInput'
import styles from './CardDetailOverlay.module.scss'

export type FocusedCardContent =
  | {
      canChangeStance?: boolean
      card: CardDefinition
      kind: 'command'
    }
  | {
      canChangeStance?: boolean
      freeStanceChange?: boolean
      kind: 'monster'
      monster: MonsterInstance
      onChangeStance?: (stanceId: string) => void
    }
  | {
      kind: 'bench'
      label: string
      monsters: Array<{ monster: MonsterInstance; rosterIndex: number }>
    }

type CardDetailOverlayProps = {
  content: FocusedCardContent
  onClose: () => void
}

export function CardDetailOverlay({ content, onClose }: CardDetailOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useBoardHitZone({
    id: 'card-detail-close',
    onTap: onClose,
    priority: 10,
    ref: overlayRef,
  })

  useBoardHitZone({
    id: 'card-detail-content',
    priority: 80,
    ref: contentRef,
  })

  return (
    <div ref={overlayRef} className={styles.overlay} data-cy="focused-card">
      <button
        type="button"
        aria-label="Close card details"
        className={styles.backdrop}
        data-cy="close-focused-card"
        onClick={onClose}
      />
      <div
        ref={contentRef}
        className={`${styles.content} ${
          content.kind === 'bench' ? styles.benchContent : ''
        }`}
      >
        {content.kind === 'monster' ? (
          <MonsterDetailCard
            canChangeStance={content.canChangeStance}
            currentStance={getCurrentStance(content.monster)}
            definition={getMonsterDefinition(content.monster)}
            freeStanceChange={content.freeStanceChange}
            monster={content.monster}
            onChangeStance={content.onChangeStance}
          />
        ) : content.kind === 'command' ? (
          <CommandCardFace card={content.card} detail />
        ) : (
          <BenchCards label={content.label} monsters={content.monsters} />
        )}
        <em className={styles.hint}>Tap outside to return.</em>
      </div>
    </div>
  )
}

function BenchCards({
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
          <MonsterChoiceCard
            key={monster.instanceId}
            definition={getMonsterDefinition(monster)}
            label="Bench"
            monster={monster}
          />
        ))}
      </div>
    </>
  )
}
