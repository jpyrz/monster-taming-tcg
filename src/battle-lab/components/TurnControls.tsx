import { useRef } from 'react'
import type { BattleState } from '../../game/battle'
import { useBoardHitZone } from '../input/useBoardInput'
import styles from './BattleLabLayout.module.scss'

type TurnControlsProps = {
  onEndTurn: () => void
  state: BattleState
}

export function TurnControls({ onEndTurn, state }: TurnControlsProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useBoardHitZone({
    enabled: state.phase === 'player-turn',
    id: 'end-turn',
    onTap: onEndTurn,
    priority: 65,
    ref: buttonRef,
  })

  if (state.phase !== 'player-turn') {
    return null
  }

  return (
    <div className={styles.controls}>
      <div>
        <strong data-cy="focus-count">{state.player.focus}</strong>
        <span>Focus</span>
      </div>
      <div>
        <strong>{state.player.deck.length}</strong>
        <span>Deck</span>
      </div>
      <div>
        <strong>{state.player.discard.length}</strong>
        <span>Discard</span>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={styles.endTurn}
        data-cy="end-turn-button"
        onClick={onEndTurn}
      >
        End turn
      </button>
    </div>
  )
}
