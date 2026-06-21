import type { CardDefinition, StanceDefinition } from '../cardTypes'

export function getCommandSpeedBonus({
  card,
  stance,
  usedStrikeThisTurn,
}: {
  card: CardDefinition
  stance: StanceDefinition | null
  usedStrikeThisTurn: boolean
}) {
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (
      effect.kind === 'speedBonus' &&
      card.tags.includes(effect.tag) &&
      (!effect.firstOnly || !usedStrikeThisTurn)
    ) {
      return total + effect.amount
    }

    return total
  }, 0)
}

export function getTaggedStanceAmount({
  card,
  kind,
  stance,
}: {
  card: CardDefinition
  kind: 'damageBonus' | 'focusGain' | 'guardBonus' | 'recoil'
  stance: StanceDefinition | null
}) {
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (effect.kind === kind && card.tags.includes(effect.tag)) {
      return total + effect.amount
    }

    return total
  }, 0)
}

export function getDamageReduction(stance: StanceDefinition | null) {
  if (!stance) {
    return 0
  }

  return stance.effects.reduce((total, effect) => {
    if (effect.kind === 'damageReduction') {
      return total + effect.amount
    }

    return total
  }, 0)
}
