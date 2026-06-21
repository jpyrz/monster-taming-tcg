import type { CardDefinition } from '../../game/cards'
import {
  ArtSlot,
  CardTemplate,
  RulesSlot,
} from './CardTemplate'
import styles from './CardFaces.module.scss'

type CommandCardProps = {
  card: CardDefinition
  detail?: boolean
}

export function CommandCardFace({ card, detail }: CommandCardProps) {
  const stat = getCardStat(card)

  return (
    <CardTemplate
      badge={card.cost}
      className={detail ? styles.detailCard : styles.handCard}
      footerLeft={stat}
      footerRight={detail ? `${card.type} card` : card.type}
      title={card.name}
      variant={detail ? 'detail' : 'hand'}
      visual={card.visual}
    >
      <ArtSlot label={card.tags[0] ?? card.type} />
      <RulesSlot>
        <div className={styles.rulesStack}>
          <span className={styles.tagLine}>
            {card.tags.length > 0 ? card.tags.join(' / ') : 'Support'}
          </span>
          <p className={detail ? styles.rulesText : styles.smallText}>
            {card.text}
          </p>
        </div>
      </RulesSlot>
    </CardTemplate>
  )
}

function getCardStat(card: CardDefinition) {
  if (card.damage) return `${card.damage} DMG`
  if (card.guard) return `${card.guard} GRD`
  if (card.heal) return `${card.heal} HEAL`
  if (card.draw) return `DRAW ${card.draw}`

  return 'Tactic'
}
