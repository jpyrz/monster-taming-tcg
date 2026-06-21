import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import styles from './GameViewport.module.scss'

const baseStageWidth = 1280
const baseStageHeight = 720

type GameViewportProps = {
  children: ReactNode
}

export function GameViewport({ children }: GameViewportProps) {
  const stageMetrics = useStageMetrics()
  const stageFrameStyle = {
    '--stage-frame-height': `${stageMetrics.frameHeight}px`,
    '--stage-frame-width': `${stageMetrics.frameWidth}px`,
  } as CSSProperties
  const stageStyle = {
    '--stage-height': `${baseStageHeight}px`,
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
          {children}
        </div>
      </div>
    </div>
  )
}

function useStageMetrics() {
  const [metrics, setMetrics] = useState(() => getStageMetrics())

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

function getStageMetrics() {
  if (typeof window === 'undefined') {
    return {
      frameHeight: baseStageHeight,
      frameWidth: baseStageWidth,
      logicalWidth: baseStageWidth,
      scale: 1,
    }
  }

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const scale = viewportHeight / baseStageHeight
  const logicalWidth = Math.max(baseStageWidth, viewportWidth / scale)

  return {
    frameHeight: viewportHeight,
    frameWidth: viewportWidth,
    logicalWidth,
    scale,
  }
}
