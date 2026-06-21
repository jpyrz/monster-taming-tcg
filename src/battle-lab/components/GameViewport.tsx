import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { BoardInputProvider } from '../input/BoardInputContext'
import {
  getInitialStageMetrics,
  getStageMetrics,
} from '../input/boardCoordinates'
import styles from './GameViewport.module.scss'

type GameViewportProps = {
  children: ReactNode
  overlays?: ReactNode
}

export function GameViewport({ children, overlays }: GameViewportProps) {
  const stageMetrics = useStageMetrics()
  const stageFrameStyle = {
    '--stage-frame-height': `${stageMetrics.frameHeight}px`,
    '--stage-frame-width': `${stageMetrics.frameWidth}px`,
  } as CSSProperties
  const stageStyle = {
    '--stage-height': `${stageMetrics.logicalHeight}px`,
    '--stage-scale': stageMetrics.scale,
    '--stage-width': `${stageMetrics.logicalWidth}px`,
  } as CSSProperties

  return (
    <div className={styles.viewport} data-cy="game-viewport">
      <div
        className={styles.stageFrame}
        data-cy="game-stage-frame"
        style={stageFrameStyle}
      >
        <div
          className={styles.stage}
          data-cy="game-stage"
          style={stageStyle}
        >
          <BoardInputProvider metrics={stageMetrics}>
            {children}
            {overlays ? <div className={styles.stageOverlay}>{overlays}</div> : null}
          </BoardInputProvider>
        </div>
      </div>
    </div>
  )
}

function useStageMetrics() {
  const [metrics, setMetrics] = useState(() => getInitialStageMetrics())

  useEffect(() => {
    function updateMetrics() {
      setMetrics(getStageMetrics())
    }

    updateMetrics()
    window.addEventListener('resize', updateMetrics)
    window.visualViewport?.addEventListener('resize', updateMetrics)

    return () => {
      window.removeEventListener('resize', updateMetrics)
      window.visualViewport?.removeEventListener('resize', updateMetrics)
    }
  }, [])

  return metrics
}
