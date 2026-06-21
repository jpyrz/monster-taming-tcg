import type { ReactNode } from 'react'
import {
  STANDARD_CARD_TEMPLATE,
  type CardVisual,
} from '../visuals/cardVisuals'
import styles from './CardTemplate.module.scss'

export type CardTemplateVariant = 'choice' | 'detail' | 'field' | 'hand'

type CardTemplateProps = {
  ariaLabel?: string
  badge?: ReactNode
  children?: ReactNode
  className?: string
  footerLeft?: ReactNode
  footerRight?: ReactNode
  onClick?: () => void
  title: ReactNode
  variant: CardTemplateVariant
  visual: CardVisual
}

export function CardTemplate({
  ariaLabel,
  badge,
  children,
  className,
  footerLeft,
  footerRight,
  onClick,
  title,
  variant,
  visual,
}: CardTemplateProps) {
  const Element = onClick ? 'button' : 'article'

  return (
    <Element
      type={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
      className={`${styles.card} ${onClick ? styles.button : ''} ${className ?? ''}`}
      data-card-template={variant}
      data-frame-template={visual.frameTemplate}
      data-tone={visual.tone}
      onClick={onClick}
    >
      <div className={styles.surface} aria-hidden="true" />
      <img
        alt=""
        aria-hidden="true"
        className={styles.frame}
        draggable={false}
        src={STANDARD_CARD_TEMPLATE}
      />
      {badge ? <span className={styles.badge}>{badge}</span> : null}
      <strong className={styles.title}>{title}</strong>
      {children}
      {footerLeft ? <span className={styles.footerLeft}>{footerLeft}</span> : null}
      {footerRight ? <span className={styles.footerRight}>{footerRight}</span> : null}
      <span className={styles.templateReady}>card template</span>
    </Element>
  )
}

type ArtSlotProps = {
  label: string
}

export function ArtSlot({ label }: ArtSlotProps) {
  return (
    <div className={styles.art}>
      <span className={styles.artPlaceholder} aria-hidden="true" />
      <span className={styles.artLabel}>{label}</span>
    </div>
  )
}

export function RulesSlot({ children }: { children: ReactNode }) {
  return <div className={styles.rules}>{children}</div>
}
