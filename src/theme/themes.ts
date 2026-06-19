import type { MantineColorsTuple } from '@mantine/core'

export const themeIds = ['nocturne', 'verdant'] as const

export type ThemeId = (typeof themeIds)[number]

export type TcgTheme = {
  id: ThemeId
  label: string
  description: string
  brand: MantineColorsTuple
  tokens: Record<`--tcg-${string}`, string>
}

export const themes: Record<ThemeId, TcgTheme> = {
  nocturne: {
    id: 'nocturne',
    label: 'Nocturne',
    description: 'Ink, neon glass, and arena lights.',
    brand: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#4dabf7',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
    ],
    tokens: {
      '--tcg-bg-root': '#06080f',
      '--tcg-bg-frame': '#0b1020',
      '--tcg-bg-panel': '#111827',
      '--tcg-bg-panel-strong': '#172033',
      '--tcg-bg-field': '#0e1628',
      '--tcg-surface': '#121a2b',
      '--tcg-surface-strong': '#1b263d',
      '--tcg-text': '#eef4ff',
      '--tcg-text-muted': '#91a0b8',
      '--tcg-accent': '#4dabf7',
      '--tcg-accent-strong': '#74c0fc',
      '--tcg-on-accent': '#07111f',
      '--tcg-border': 'rgba(255, 255, 255, 0.12)',
      '--tcg-border-strong': 'rgba(116, 192, 252, 0.45)',
      '--tcg-shadow': 'rgba(0, 0, 0, 0.55)',
      '--tcg-danger': '#ff6b6b',
      '--tcg-warning': '#ffd43b',
      '--tcg-health': '#69db7c',
      '--tcg-focus': '#74c0fc',
    },
  },
  verdant: {
    id: 'verdant',
    label: 'Verdant',
    description: 'Dense canopy, bright venom, and old stone.',
    brand: [
      '#f7fee7',
      '#ecfccb',
      '#d9f99d',
      '#bef264',
      '#a3e635',
      '#84cc16',
      '#65a30d',
      '#4d7c0f',
      '#3f6212',
      '#365314',
    ],
    tokens: {
      '--tcg-bg-root': '#070907',
      '--tcg-bg-frame': '#0d110d',
      '--tcg-bg-panel': '#101410',
      '--tcg-bg-panel-strong': '#172017',
      '--tcg-bg-field': '#121912',
      '--tcg-surface': '#121612',
      '--tcg-surface-strong': '#1a201a',
      '--tcg-text': '#f1f3f1',
      '--tcg-text-muted': '#8f998f',
      '--tcg-accent': '#a3e635',
      '--tcg-accent-strong': '#bef264',
      '--tcg-on-accent': '#11150f',
      '--tcg-border': 'rgba(255, 255, 255, 0.12)',
      '--tcg-border-strong': 'rgba(163, 230, 53, 0.45)',
      '--tcg-shadow': 'rgba(0, 0, 0, 0.5)',
      '--tcg-danger': '#fa5252',
      '--tcg-warning': '#fcc419',
      '--tcg-health': '#8fc53f',
      '--tcg-focus': '#4dabf7',
    },
  },
}

export const defaultThemeId: ThemeId = 'nocturne'

export function isThemeId(value: string | null): value is ThemeId {
  return themeIds.includes(value as ThemeId)
}
