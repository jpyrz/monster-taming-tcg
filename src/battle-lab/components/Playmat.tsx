import { useCallback, useRef, type DragEvent, type ReactNode } from 'react'
import { CardBack, DeckStack } from '../../cards/components/CardBacks'
import {
  MonsterFieldCard,
} from '../../cards/components/MonsterCards'
import {
  getActiveMonster,
  getMonsterDefinition,
  type BattleState,
  type MonsterInstance,
} from '../../game/battle'
import type { Owner } from '../../game/cards'
import {
  useBoardHitZone,
} from '../input/useBoardInput'
import type { BoardDragData } from '../input/boardInputCore'
import styles from './BattleLabLayout.module.scss'

type PlaymatProps = {
  onActiveDrop: (event: DragEvent) => void
  onBoardCardDrop: (handIndex: number) => void
  onBenchClick: (owner: Owner) => void
  onMonsterClick: (owner: Owner, rosterIndex: number) => void
  state: BattleState
}

export function Playmat({
  onActiveDrop,
  onBoardCardDrop,
  onBenchClick,
  onMonsterClick,
  state,
}: PlaymatProps) {
  const rivalBenchRef = useRef<HTMLButtonElement | HTMLSpanElement | null>(null)
  useBoardHitZone({
    id: 'rival-bench',
    onTap: () => onBenchClick('rival'),
    priority: 30,
    ref: rivalBenchRef,
  })

  return (
    <section className={styles.playmat}>
      <div className={styles.opponentHand} aria-label="Rival hand">
        {state.rival.hand.slice(0, 5).map((_, index) => (
          <CardBack key={index} />
        ))}
      </div>

      <div className={styles.opponentBench}>
        <DeckStack
          ref={rivalBenchRef}
          ariaLabel="Rival bench"
          dataCy="rival-bench-stack"
          onClick={() => onBenchClick('rival')}
        />
      </div>

      <BoardRow owner="rival">
        <ActiveSlot owner="rival">
          <MonsterButton
            monster={getActiveMonster(state.rival)}
            onClick={() => onMonsterClick('rival', state.rival.activeIndex)}
            zoneId="rival-active-monster"
          />
        </ActiveSlot>
      </BoardRow>

      <BoardRow owner="player">
        <ActiveSlot
          isDropTarget={state.phase === 'player-turn'}
          onBoardCardDrop={onBoardCardDrop}
          onDragOver={(event) => {
            if (state.phase === 'player-turn') {
              event.preventDefault()
            }
          }}
          onDrop={onActiveDrop}
          owner="player"
        >
          <MonsterButton
            monster={getActiveMonster(state.player)}
            onClick={() => onMonsterClick('player', state.player.activeIndex)}
            zoneId="player-active-monster"
          />
        </ActiveSlot>
      </BoardRow>
    </section>
  )
}

function BoardRow({ children, owner }: { children: ReactNode; owner: Owner }) {
  return (
    <div className={styles.boardRow} data-owner={owner}>
      {children}
    </div>
  )
}

function ActiveSlot({
  children,
  isDropTarget,
  onBoardCardDrop,
  onDragOver,
  onDrop,
  owner,
}: {
  children: ReactNode
  isDropTarget?: boolean
  onBoardCardDrop?: (handIndex: number) => void
  onDragOver?: (event: DragEvent) => void
  onDrop?: (event: DragEvent) => void
  owner: Owner
}) {
  const slotRef = useRef<HTMLDivElement | null>(null)
  const handleBoardDrop = useCallback(
    (dragData: BoardDragData) => {
      if (dragData.type === 'hand-card') {
        onBoardCardDrop?.(dragData.handIndex)
      }
    },
    [onBoardCardDrop],
  )

  useBoardHitZone({
    enabled: owner === 'player' && isDropTarget,
    id: 'player-active-slot',
    onDrop: handleBoardDrop,
    priority: 20,
    ref: slotRef,
  })

  return (
    <div
      ref={slotRef}
      className={styles.activeSlot}
      data-cy={owner === 'player' && isDropTarget ? 'player-active-slot' : undefined}
      data-drop-target={isDropTarget || undefined}
      data-owner={owner}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  )
}

function MonsterButton({
  monster,
  onClick,
  zoneId,
}: {
  monster: MonsterInstance
  onClick: () => void
  zoneId: string
}) {
  const definition = getMonsterDefinition(monster)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useBoardHitZone({
    id: zoneId,
    onTap: onClick,
    priority: 40,
    ref: buttonRef,
  })

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.cardButton}
      data-cy={`${monster.instanceId.startsWith('player') ? 'player' : 'rival'}-active-monster`}
      onClick={onClick}
    >
      <MonsterFieldCard definition={definition} monster={monster} />
    </button>
  )
}
