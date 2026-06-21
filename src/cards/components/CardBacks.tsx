import { forwardRef, type Ref } from 'react'
import styles from './CardBacks.module.scss'

export function CardBack({ className }: { className?: string }) {
  return <span className={`${styles.cardBack} ${className ?? ''}`} />
}

export const DeckStack = forwardRef<HTMLButtonElement | HTMLSpanElement, {
  ariaLabel: string
  className?: string
  dataCy?: string
  onClick?: () => void
}>(
function DeckStack({
  ariaLabel,
  className,
  dataCy,
  onClick,
}, ref) {
  const content = (
    <>
      <i />
      <b />
    </>
  )

  if (onClick) {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        aria-label={ariaLabel}
        className={`${styles.deckStack} ${className ?? ''}`}
        data-cy={dataCy}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return (
    <span
      ref={ref as Ref<HTMLSpanElement>}
      className={`${styles.deckStack} ${className ?? ''}`}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      {content}
    </span>
  )
}
)
