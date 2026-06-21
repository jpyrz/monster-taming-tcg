import type { DragEvent, ReactNode } from 'react'
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
import styles from './BattleLabLayout.module.scss'

type PlaymatProps = {
  onActiveDrop: (event: DragEvent) => void
  onBenchClick: (owner: Owner) => void
  onMonsterClick: (owner: Owner, rosterIndex: number) => void
  state: BattleState
}

export function Playmat({
  onActiveDrop,
  onBenchClick,
  onMonsterClick,
  state,
}: PlaymatProps) {
  return (
    <section className={styles.playmat}>
      <div className={styles.opponentHand} aria-label="Rival hand">
        {state.rival.hand.slice(0, 5).map((_, index) => (
          <CardBack key={index} />
        ))}
      </div>

      <div className={styles.opponentBench}>
        <DeckStack
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
          />
        </ActiveSlot>
      </BoardRow>

      <BoardRow owner="player">
        <ActiveSlot
          isDropTarget={state.phase === 'player-turn'}
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
  onDragOver,
  onDrop,
  owner,
}: {
  children: ReactNode
  isDropTarget?: boolean
  onDragOver?: (event: DragEvent) => void
  onDrop?: (event: DragEvent) => void
  owner: Owner
}) {
  return (
    <div
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
}: {
  monster: MonsterInstance
  onClick: () => void
}) {
  const definition = getMonsterDefinition(monster)

  return (
    <button
      type="button"
      className={styles.cardButton}
      data-cy={`${monster.instanceId.startsWith('player') ? 'player' : 'rival'}-active-monster`}
      onClick={onClick}
    >
      <MonsterFieldCard definition={definition} monster={monster} />
    </button>
  )
}
