import type { CardVisual } from '../cards/visuals/cardVisuals'

export type Owner = 'player' | 'rival'

export type CommandTag =
  | 'Strike'
  | 'Guard'
  | 'Move'
  | 'Fire'
  | 'Claw'
  | 'Bite'
  | 'Roar'
  | 'Focus'

export type CardType = 'command' | 'adaptation' | 'trick' | 'item'

export type StanceEffect =
  | {
      amount: number
      firstOnly?: boolean
      kind: 'speedBonus'
      tag: CommandTag
    }
  | {
      amount: number
      kind: 'damageBonus'
      tag: CommandTag
    }
  | {
      amount: number
      kind: 'recoil'
      tag: CommandTag
    }
  | {
      amount: number
      kind: 'damageReduction'
    }
  | {
      amount: number
      kind: 'focusGain'
      tag: CommandTag
    }
  | {
      amount: number
      kind: 'guardBonus'
      tag: CommandTag
    }

export type StanceDefinition = {
  id: string
  name: string
  text: string
  effects: StanceEffect[]
}

export type MonsterDefinition = {
  adaptationTrigger: string
  id: string
  maxHealth: number
  name: string
  speed: number
  stances: StanceDefinition[]
  traits: string[]
  visual: CardVisual
}

export type CardDefinition = {
  adaptationText?: string
  cost: number
  damage?: number
  draw?: number
  guard?: number
  heal?: number
  id: string
  name: string
  tags: CommandTag[]
  text: string
  type: CardType
  visual: CardVisual
}
