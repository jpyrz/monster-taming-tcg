import {
  useCallback,
  useContext,
  useLayoutEffect,
  type RefObject,
} from 'react'
import { screenRectToBoardRect } from './boardCoordinates'
import {
  BoardInputContext,
  type BoardDragData,
} from './boardInputCore'

export function useBoardInput() {
  const context = useContext(BoardInputContext)
  if (!context) {
    throw new Error('useBoardInput must be used inside BoardInputProvider')
  }

  return context
}

export function useBoardHitZone<TElement extends HTMLElement>({
  dragData,
  enabled = true,
  id,
  onDrop,
  onTap,
  priority,
  ref,
}: {
  dragData?: BoardDragData
  enabled?: boolean
  id: string
  onDrop?: (dragData: BoardDragData) => void
  onTap?: () => void
  priority: number
  ref: RefObject<TElement | null>
}) {
  const { metrics, registerZone } = useBoardInput()

  const updateZone = useCallback(() => {
    const element = ref.current
    if (!element || !enabled) return undefined

    return registerZone({
      bounds: screenRectToBoardRect(metrics, element.getBoundingClientRect()),
      dragData,
      enabled,
      id,
      onDrop,
      onTap,
      priority,
    })
  }, [
    dragData,
    enabled,
    id,
    metrics,
    onDrop,
    onTap,
    priority,
    ref,
    registerZone,
  ])

  useLayoutEffect(() => {
    const cleanup = updateZone()
    return cleanup
  }, [updateZone])
}
