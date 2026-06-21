import type { CSSProperties, ReactNode } from 'react'
import type { MonsterInstance } from '../../game/battle'
import type { MonsterDefinition, StanceDefinition } from '../../game/cards'
import {
  ArtSlot,
  CardTemplate,
  RulesSlot,
} from './CardTemplate'
import styles from './CardFaces.module.scss'

type MonsterCardProps = {
  definition: MonsterDefinition
  monster: MonsterInstance
}

export function MonsterFieldCard({ definition, monster }: MonsterCardProps) {
  const healthValue = `${Math.max(0, (monster.currentHealth / definition.maxHealth) * 100)}%`

  return (
    <CardTemplate
      badge={definition.speed}
      className={styles.fieldCard}
      footerLeft={`${monster.currentHealth}/${definition.maxHealth}`}
      footerRight="HP"
      title={definition.name}
      variant="field"
      visual={definition.visual}
    >
      <ArtSlot label={definition.traits[0] ?? 'Monster'} />
      <span
        className={styles.health}
        style={{ '--health-value': healthValue } as CSSProperties}
      >
        <i />
      </span>
    </CardTemplate>
  )
}

type MonsterDetailCardProps = MonsterCardProps & {
  canChangeStance?: boolean
  currentStance: StanceDefinition | null
  freeStanceChange?: boolean
  onChangeStance?: (stanceId: string) => void
}

export function MonsterDetailCard({
  canChangeStance,
  currentStance,
  definition,
  freeStanceChange,
  monster,
  onChangeStance,
}: MonsterDetailCardProps) {
  return (
    <CardTemplate
      badge={`SPD ${definition.speed}`}
      className={styles.monsterDetailCard}
      footerLeft={`${monster.currentHealth}/${definition.maxHealth} HP`}
      footerRight={
        monster.adaptations.length > 0
          ? monster.adaptations.join(', ')
          : 'No adaptations'
      }
      title={definition.name}
      variant="detail"
      visual={definition.visual}
    >
      <ArtSlot label={definition.traits.join(' / ')} />
      <RulesSlot>
        <div className={styles.rulesStack}>
          <span className={styles.eyebrow}>
            {currentStance ? `${currentStance.name} stance` : 'No stance chosen'}
          </span>
          <p className={styles.smallText}>{definition.adaptationTrigger}</p>
          <StanceList
            canChangeStance={canChangeStance}
            currentStanceId={monster.stanceId}
            freeStanceChange={freeStanceChange}
            onChangeStance={onChangeStance}
            stances={definition.stances}
          />
        </div>
      </RulesSlot>
    </CardTemplate>
  )
}

type MonsterChoiceCardProps = MonsterCardProps & {
  label?: string
}

export function MonsterChoiceCard({
  definition,
  label = 'Monster card',
  monster,
}: MonsterChoiceCardProps) {
  return (
    <CardTemplate
      badge={`SPD ${definition.speed}`}
      className={styles.choiceCard}
      footerLeft={`${monster.currentHealth}/${definition.maxHealth} HP`}
      footerRight={label}
      title={definition.name}
      variant="choice"
      visual={definition.visual}
    >
      <ArtSlot label={definition.traits.join(' / ')} />
      <RulesSlot>
        <div className={styles.rulesStack}>
          <p className={styles.smallText}>{definition.adaptationTrigger}</p>
          <StanceList
            currentStanceId={monster.stanceId}
            stances={definition.stances}
          />
        </div>
      </RulesSlot>
    </CardTemplate>
  )
}

function StanceList({
  canChangeStance,
  currentStanceId,
  freeStanceChange,
  onChangeStance,
  stances,
}: {
  canChangeStance?: boolean
  currentStanceId: string | null
  freeStanceChange?: boolean
  onChangeStance?: (stanceId: string) => void
  stances: StanceDefinition[]
}) {
  return (
    <div className={styles.stanceList}>
      {stances.map((stance) =>
        canChangeStance ? (
          <button
            key={stance.id}
            type="button"
            disabled={!freeStanceChange || stance.id === currentStanceId}
            onClick={() => onChangeStance?.(stance.id)}
            data-current={stance.id === currentStanceId || undefined}
            data-cy={`stance-${stance.id}`}
          >
            <strong>{stance.name}</strong>
            <small>{stance.text}</small>
          </button>
        ) : (
          <span
            key={stance.id}
            data-current={stance.id === currentStanceId || undefined}
          >
            <strong>{stance.name}</strong>
            <small>{stance.text}</small>
          </span>
        ),
      )}
    </div>
  )
}

export function CardButton({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick: () => void
}) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  )
}
