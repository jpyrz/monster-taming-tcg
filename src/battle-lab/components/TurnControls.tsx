import type { BattleState } from '../../game/battle'
import styles from './BattleLabLayout.module.scss'

type TurnControlsProps = {
  onEndTurn: () => void
  state: BattleState
}

export function TurnControls({ onEndTurn, state }: TurnControlsProps) {
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
      <button type="button" className={styles.endTurn} onClick={onEndTurn}>
        End turn
      </button>
    </div>
  )
}
