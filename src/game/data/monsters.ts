import { createPlaceholderVisual } from '../../cards/visuals/cardVisuals'
import type { MonsterDefinition } from '../cardTypes'

export const monsters: Record<string, MonsterDefinition> = {
  cindermane: {
    id: 'cindermane',
    name: 'Cindermane',
    traits: ['Fire', 'Predator'],
    maxHealth: 18,
    speed: 3,
    visual: createPlaceholderVisual('cindermane', 'fire'),
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
    visual: createPlaceholderVisual('emberwhelp', 'fire'),
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
    visual: createPlaceholderVisual('shellmaw', 'beast'),
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
    visual: createPlaceholderVisual('nightmoth', 'spirit'),
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
