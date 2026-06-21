import {
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { DeckStack } from '../../cards/components/CardBacks'
import { CommandCardFace } from '../../cards/components/CommandCards'
import { getCardDefinition, type BattleState } from '../../game/battle'
import styles from './BattleLabLayout.module.scss'

type PlayerHandProps = {
  draggedHandIndex: number | null
  focusedHandIndex?: number
  onBenchClick: () => void
  onCardClick: (handIndex: number) => void
  onDragEnd: () => void
  onDragStart: (event: DragEvent, handIndex: number) => void
  onPointerPlay: (handIndex: number) => void
  state: BattleState
}

export function PlayerHand({
  draggedHandIndex,
  focusedHandIndex,
  onBenchClick,
  onCardClick,
  onDragEnd,
  onDragStart,
  onPointerPlay,
  state,
}: PlayerHandProps) {
  const pointerState = useRef<{
    dragging: boolean
    index: number
    playable: boolean
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const suppressClick = useRef(false)
  const [pointerDragIndex, setPointerDragIndex] = useState<number | null>(null)
  const [dragPreview, setDragPreview] = useState<{
    cardId: string
    x: number
    y: number
  } | null>(null)

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    handIndex: number,
    playable: boolean,
  ) {
    if (event.pointerType === 'mouse' || !playable) {
      return
    }

    pointerState.current = {
      dragging: false,
      index: handIndex,
      playable,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic pointer events in tests may not create an active capture target.
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = pointerState.current
    if (!current || current.pointerId !== event.pointerId) {
      return
    }

    const distance = Math.hypot(
      event.clientX - current.startX,
      event.clientY - current.startY,
    )

    if (distance > 10) {
      current.dragging = true
      suppressClick.current = true
      setPointerDragIndex(current.index)
      setDragPreview({
        cardId: state.player.hand[current.index],
        x: event.clientX,
        y: event.clientY,
      })
      event.preventDefault()
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const current = pointerState.current
    if (!current || current.pointerId !== event.pointerId) {
      return
    }

    pointerState.current = null
    setPointerDragIndex(null)
    setDragPreview(null)

    if (!current.dragging) {
      return
    }

    event.preventDefault()

    const activeSlot = document.querySelector('[data-cy="player-active-slot"]')
    const bounds = activeSlot?.getBoundingClientRect()
    const droppedOnActive =
      bounds &&
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom

    if (droppedOnActive) {
      onPointerPlay(current.index)
    }

    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
  }

  function handleClick(handIndex: number) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }

    onCardClick(handIndex)
  }

  return (
    <div className={styles.handZone}>
      <DeckStack
        ariaLabel="Your bench"
        className={styles.playerBench}
        dataCy="player-bench-stack"
        onClick={onBenchClick}
      />
      <div className={styles.hand} data-cy="hand">
        {state.player.hand.map((cardId, index) => {
          const card = getCardDefinition(cardId)
          const playable = state.player.focus >= card.cost
          const cardOffset = index - (state.player.hand.length - 1) / 2

          return (
            <button
              key={`${cardId}-${index}`}
              type="button"
              aria-disabled={!playable}
              className={styles.handCardButton}
              data-cy={`card-${card.id}`}
              data-dragging={
                draggedHandIndex === index || pointerDragIndex === index || undefined
              }
              data-focused={focusedHandIndex === index || undefined}
              data-playable={playable || undefined}
              draggable={playable}
              onClick={() => handleClick(index)}
              onDragEnd={onDragEnd}
              onDragStart={(event) => onDragStart(event, index)}
              onPointerDown={(event) =>
                handlePointerDown(event, index, playable)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={
                {
                  '--card-index': index,
                  '--card-offset': cardOffset,
                } as CSSProperties
              }
            >
              <CommandCardFace card={card} />
            </button>
          )
        })}
      </div>
      {dragPreview
        ? createPortal(
            <div
              className={styles.dragPreview}
              data-cy="mobile-drag-preview"
              style={
                {
                  '--drag-preview-x': `${dragPreview.x}px`,
                  '--drag-preview-y': `${dragPreview.y}px`,
                } as CSSProperties
              }
            >
              <CommandCardFace card={getCardDefinition(dragPreview.cardId)} />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
