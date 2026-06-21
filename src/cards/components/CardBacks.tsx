import styles from './CardBacks.module.scss'

export function CardBack({ className }: { className?: string }) {
  return <span className={`${styles.cardBack} ${className ?? ''}`} />
}

export function DeckStack({
  ariaLabel,
  className,
  dataCy,
  onClick,
}: {
  ariaLabel: string
  className?: string
  dataCy?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <i />
      <b />
    </>
  )

  if (onClick) {
    return (
      <button
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
      className={`${styles.deckStack} ${className ?? ''}`}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      {content}
    </span>
  )
}
