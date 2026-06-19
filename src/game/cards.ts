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
  id: string
  name: string
  traits: string[]
  maxHealth: number
  speed: number
  stances: StanceDefinition[]
  adaptationTrigger: string
}

export type CardDefinition = {
  id: string
  name: string
  type: CardType
  cost: number
  tags: CommandTag[]
  text: string
  damage?: number
  guard?: number
  heal?: number
  draw?: number
  adaptationText?: string
}

export const monsters: Record<string, MonsterDefinition> = {
  cindermane: {
    id: 'cindermane',
    name: 'Cindermane',
    traits: ['Fire', 'Predator'],
    maxHealth: 18,
    speed: 3,
    adaptationTrigger:
      'After Cindermane takes recoil twice, attach Scorched Nerves.',
    stances: [
      {
        id: 'hunting',
        name: 'Hunting',
        text: 'Your first Strike command each turn gains +1 Speed.',
        effects: [{ kind: 'speedBonus', tag: 'Strike', amount: 1, firstOnly: true }],
      },
      {
        id: 'frenzy',
        name: 'Frenzy',
        text: 'Your Strike commands deal +2 damage, then Cindermane takes 1 recoil.',
        effects: [
          { kind: 'damageBonus', tag: 'Strike', amount: 2 },
          { kind: 'recoil', tag: 'Strike', amount: 1 },
        ],
      },
      {
        id: 'ashcloak',
        name: 'Ashcloak',
        text: 'Reduce incoming damage by 1.',
        effects: [{ kind: 'damageReduction', amount: 1 }],
      },
    ],
  },
  emberwhelp: {
    id: 'emberwhelp',
    name: 'Ember Whelp',
    traits: ['Fire', 'Skirmisher'],
    maxHealth: 14,
    speed: 5,
    adaptationTrigger:
      'After Ember Whelp changes stance three times, attach Quickened Heart.',
    stances: [
      {
        id: 'skitter',
        name: 'Skitter',
        text: 'Move commands gain +1 Speed. After a Move command, gain 1 Focus.',
        effects: [
          { kind: 'speedBonus', tag: 'Move', amount: 1 },
          { kind: 'focusGain', tag: 'Move', amount: 1 },
        ],
      },
      {
        id: 'kindle',
        name: 'Kindle',
        text: 'Fire commands deal +1 damage.',
        effects: [{ kind: 'damageBonus', tag: 'Fire', amount: 1 }],
      },
      {
        id: 'cornered',
        name: 'Cornered',
        text: 'Guard commands prevent +1 damage.',
        effects: [{ kind: 'guardBonus', tag: 'Guard', amount: 1 }],
      },
    ],
  },
  shellmaw: {
    id: 'shellmaw',
    name: 'Shellmaw',
    traits: ['Beast', 'Bulwark'],
    maxHealth: 24,
    speed: 2,
    adaptationTrigger:
      'After Shellmaw prevents 5 total damage, attach Stone Memory.',
    stances: [
      {
        id: 'bastion',
        name: 'Bastion',
        text: 'Reduce incoming damage by 2.',
        effects: [{ kind: 'damageReduction', amount: 2 }],
      },
      {
        id: 'quake',
        name: 'Quake',
        text: 'Strike commands deal +1 damage.',
        effects: [{ kind: 'damageBonus', tag: 'Strike', amount: 1 }],
      },
      {
        id: 'anchored',
        name: 'Anchored',
        text: 'Guard commands prevent +2 damage.',
        effects: [{ kind: 'guardBonus', tag: 'Guard', amount: 2 }],
      },
    ],
  },
  nightmoth: {
    id: 'nightmoth',
    name: 'Nightmoth',
    traits: ['Spirit', 'Trickster'],
    maxHealth: 16,
    speed: 4,
    adaptationTrigger:
      'After Nightmoth plays two Roar or Focus commands, attach Echo Veil.',
    stances: [
      {
        id: 'veiled',
        name: 'Veiled',
        text: 'Reduce incoming damage by 1.',
        effects: [{ kind: 'damageReduction', amount: 1 }],
      },
      {
        id: 'shriek',
        name: 'Shriek',
        text: 'Roar commands deal +2 damage.',
        effects: [{ kind: 'damageBonus', tag: 'Roar', amount: 2 }],
      },
      {
        id: 'glide',
        name: 'Glide',
        text: 'Move commands gain +2 Speed.',
        effects: [{ kind: 'speedBonus', tag: 'Move', amount: 2 }],
      },
    ],
  },
}

export const cards: Record<string, CardDefinition> = {
  rake: {
    id: 'rake',
    name: 'Rake',
    type: 'command',
    cost: 1,
    tags: ['Strike', 'Claw'],
    damage: 3,
    text: 'Deal 3 damage.',
  },
  emberSnap: {
    id: 'emberSnap',
    name: 'Ember Snap',
    type: 'command',
    cost: 1,
    tags: ['Strike', 'Fire', 'Bite'],
    damage: 2,
    text: 'Deal 2 damage.',
  },
  pounce: {
    id: 'pounce',
    name: 'Pounce',
    type: 'command',
    cost: 2,
    tags: ['Strike', 'Move'],
    damage: 4,
    text: 'Deal 4 damage.',
  },
  brace: {
    id: 'brace',
    name: 'Brace',
    type: 'command',
    cost: 1,
    tags: ['Guard'],
    guard: 4,
    text: 'Prevent the next 4 damage to your active monster.',
  },
  circle: {
    id: 'circle',
    name: 'Circle',
    type: 'command',
    cost: 0,
    tags: ['Move', 'Focus'],
    text: 'Gain 1 Focus.',
  },
  dominanceCry: {
    id: 'dominanceCry',
    name: 'Dominance Cry',
    type: 'command',
    cost: 1,
    tags: ['Roar', 'Focus'],
    damage: 1,
    draw: 1,
    text: 'Deal 1 damage and draw 1 card.',
  },
  hardenedScar: {
    id: 'hardenedScar',
    name: 'Hardened Scar',
    type: 'adaptation',
    cost: 1,
    tags: [],
    adaptationText: 'Reduce incoming damage by 1.',
    text: 'Attach to your active monster. Reduce incoming damage by 1.',
  },
  signalWhistle: {
    id: 'signalWhistle',
    name: 'Signal Whistle',
    type: 'trick',
    cost: 1,
    tags: ['Focus'],
    draw: 2,
    text: 'Draw 2 cards.',
  },
  fieldTreat: {
    id: 'fieldTreat',
    name: 'Field Treat',
    type: 'item',
    cost: 1,
    tags: [],
    heal: 3,
    text: 'Heal your active monster for 3.',
  },
}

export const playerRoster = ['cindermane', 'emberwhelp', 'nightmoth']
export const rivalRoster = ['emberwhelp', 'shellmaw', 'cindermane']

export const playerDeck = [
  'rake',
  'rake',
  'emberSnap',
  'brace',
  'hardenedScar',
  'pounce',
  'emberSnap',
  'circle',
  'circle',
  'signalWhistle',
  'fieldTreat',
  'dominanceCry',
  'rake',
  'pounce',
  'brace',
  'emberSnap',
  'circle',
  'fieldTreat',
  'signalWhistle',
  'hardenedScar',
]

export const rivalDeck = [
  'rake',
  'brace',
  'rake',
  'pounce',
  'emberSnap',
  'circle',
  'dominanceCry',
  'fieldTreat',
  'rake',
  'brace',
  'pounce',
  'emberSnap',
  'circle',
  'signalWhistle',
  'hardenedScar',
]
