export const STANDARD_CARD_TEMPLATE = '/card-templates/blank-standard.png'

export type CardTone = 'beast' | 'fire' | 'neutral' | 'spirit'

export type CardFrameTemplate = 'standard'

export type CardArt =
  | {
      kind: 'placeholder'
      seed: string
    }

export type CardVisual = {
  art: CardArt
  frameTemplate: CardFrameTemplate
  tone: CardTone
}

export function createPlaceholderVisual(
  seed: string,
  tone: CardTone = 'neutral',
): CardVisual {
  return {
    art: {
      kind: 'placeholder',
      seed,
    },
    frameTemplate: 'standard',
    tone,
  }
}
