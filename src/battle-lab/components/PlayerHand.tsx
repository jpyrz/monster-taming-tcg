import { useRef, type CSSProperties, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { DeckStack } from '../../cards/components/CardBacks'
import { CommandCardFace } from '../../cards/components/CommandCards'
import { getCardDefinition, type BattleState } from '../../game/battle'
import { useBoardHitZone, useBoardInput } from '../input/useBoardInput'
import styles from './BattleLabLayout.module.scss'

type PlayerHandProps = {
  draggedHandIndex: number | null
  focusedHandIndex?: number
  onBenchClick: () => void
  onCardClick: (handIndex: number) => void
  onDragEnd: () => void
  onDragStart: (event: DragEvent, handIndex: number) => void
  state: BattleState
}

export function PlayerHand({
  draggedHandIndex,
  focusedHandIndex,
  onBenchClick,
  onCardClick,
  onDragEnd,
  onDragStart,
  state,
}: PlayerHandProps) {
  const benchRef = useRef<HTMLButtonElement | HTMLSpanElement | null>(null)
  const { activeDrag } = useBoardInput()

  useBoardHitZone({
    id: 'player-bench',
    onTap: onBenchClick,
    priority: 30,
    ref: benchRef,
  })

  return (
    <div className={styles.handZone}>
      <DeckStack
        ref={benchRef}
        ariaLabel="Your bench"
        className={styles.playerBench}
        dataCy="player-bench-stack"
        onClick={onBenchClick}
      />
      <div className={styles.hand} data-cy="hand">
        {state.player.hand.map((cardId, index) => {
          const playable = state.player.focus >= getCardDefinition(cardId).cost
          const cardOffset = index - (state.player.hand.length - 1) / 2

          return (
            <HandCardButton
              key={`${cardId}-${index}`}
              cardId={cardId}
              cardOffset={cardOffset}
              dragged={draggedHandIndex === index}
              focused={focusedHandIndex === index}
              handIndex={index}
              onClick={() => onCardClick(index)}
              onDragEnd={onDragEnd}
              onDragStart={(event) => onDragStart(event, index)}
              playable={playable}
            />
          )
        })}
      </div>
      {activeDrag
        ? createPortal(
            <div
              className={styles.dragPreview}
              data-cy="mobile-drag-preview"
              style={
                {
                  '--drag-preview-x': `${activeDrag.boardPoint.x}px`,
                  '--drag-preview-y': `${activeDrag.boardPoint.y}px`,
                } as CSSProperties
              }
            >
              <CommandCardFace card={getCardDefinition(activeDrag.data.cardId)} />
            </div>,
            document.querySelector('[data-cy="game-stage"]') ?? document.body,
          )
        : null}
    </div>
  )
}

function HandCardButton({
  cardId,
  cardOffset,
  dragged,
  focused,
  handIndex,
  onClick,
  onDragEnd,
  onDragStart,
  playable,
}: {
  cardId: string
  cardOffset: number
  dragged: boolean
  focused: boolean
  handIndex: number
  onClick: () => void
  onDragEnd: () => void
  onDragStart: (event: DragEvent) => void
  playable: boolean
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const card = getCardDefinition(cardId)

  useBoardHitZone({
    dragData: playable ? { cardId, handIndex, type: 'hand-card' } : undefined,
    id: `hand-card-${handIndex}`,
    onTap: onClick,
    priority: 45 + handIndex,
    ref: buttonRef,
  })

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-disabled={!playable}
      className={styles.handCardButton}
      data-cy={`card-${card.id}`}
      data-dragging={dragged || undefined}
      data-focused={focused || undefined}
      data-playable={playable || undefined}
      draggable={playable}
      onClick={onClick}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      style={
        {
          '--card-index': handIndex,
          '--card-offset': cardOffset,
        } as CSSProperties
      }
    >
      <CommandCardFace card={card} />
    </button>
  )
}
