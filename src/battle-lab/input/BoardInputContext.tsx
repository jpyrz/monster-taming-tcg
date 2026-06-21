import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  containsBoardPoint,
  screenToBoard,
  type BoardPoint,
  type StageMetrics,
} from './boardCoordinates'
import {
  BoardInputContext,
  type BoardDebugSample,
  type BoardDragData,
  type BoardDragState,
  type BoardHitZone,
  type BoardInputContextValue,
} from './boardInputCore'

type BoardInputProviderProps = {
  children: ReactNode
  metrics: StageMetrics
}

type GestureState = {
  dragData?: BoardDragData
  dragging: boolean
  pointerId: number
  startBoardPoint: BoardPoint
  startScreenPoint: BoardPoint
  zoneId?: string
}

const dragThreshold = 12

export function BoardInputProvider({
  children,
  metrics,
}: BoardInputProviderProps) {
  const zones = useRef(new Map<string, BoardHitZone>())
  const gesture = useRef<GestureState | null>(null)
  const [activeDrag, setActiveDrag] = useState<BoardDragState>(null)
  const [debugSample, setDebugSample] = useState<BoardDebugSample | null>(null)

  const toBoardPoint = useCallback(
    (clientX: number, clientY: number) => screenToBoard(metrics, clientX, clientY),
    [metrics],
  )

  const registerZone = useCallback((zone: BoardHitZone) => {
    if (zone.enabled === false) {
      zones.current.delete(zone.id)
      return () => undefined
    }

    zones.current.set(zone.id, zone)

    return () => {
      zones.current.delete(zone.id)
    }
  }, [])

  const value = useMemo<BoardInputContextValue>(
    () => ({
      activeDrag,
      debugSample,
      metrics,
      registerZone,
      screenToBoard: toBoardPoint,
      setDebugSample,
    }),
    [activeDrag, debugSample, metrics, registerZone, toBoardPoint],
  )

  function resolveZone(
    point: BoardPoint,
    predicate: (zone: BoardHitZone) => boolean = () => true,
  ) {
    return Array.from(zones.current.values())
      .filter(
        (zone) =>
          zone.enabled !== false &&
          predicate(zone) &&
          containsBoardPoint(zone.bounds, point),
      )
      .sort((a, b) => b.priority - a.priority)[0]
  }

  function handlePointerDownCapture(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') return

    const boardPoint = toBoardPoint(event.clientX, event.clientY)
    const zone = resolveZone(boardPoint)

    gesture.current = {
      dragData: zone?.dragData,
      dragging: false,
      pointerId: event.pointerId,
      startBoardPoint: boardPoint,
      startScreenPoint: { x: event.clientX, y: event.clientY },
      zoneId: zone?.id,
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Some synthetic events do not create a capturable native pointer.
    }

    if (zone?.onTap || zone?.dragData || zone?.onDrop) {
      event.preventDefault()
    }
  }

  function handlePointerMoveCapture(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    const boardPoint = toBoardPoint(event.clientX, event.clientY)
    const distance = Math.hypot(
      event.clientX - current.startScreenPoint.x,
      event.clientY - current.startScreenPoint.y,
    )

    if (!current.dragging && current.dragData && distance > dragThreshold) {
      current.dragging = true
    }

    if (current.dragging && current.dragData) {
      setActiveDrag({
        boardPoint,
        data: current.dragData,
      })
      setDebugSample({
        action: 'drag',
        boardPoint,
        screenPoint: { x: event.clientX, y: event.clientY },
        zoneId: current.zoneId,
      })
      event.preventDefault()
    }
  }

  function handlePointerUpCapture(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    gesture.current = null
    setActiveDrag(null)

    const boardPoint = toBoardPoint(event.clientX, event.clientY)
    const zone = resolveZone(boardPoint)

    if (current.dragging && current.dragData) {
      const dropZone = resolveZone(boardPoint, (candidate) => Boolean(candidate.onDrop))
      dropZone?.onDrop?.(current.dragData)
      setDebugSample({
        action: 'drop',
        boardPoint,
        screenPoint: { x: event.clientX, y: event.clientY },
        zoneId: dropZone?.id,
      })
      event.preventDefault()
      return
    }

    zone?.onTap?.()
    setDebugSample({
      action: zone?.onTap ? 'tap' : 'unknown',
      boardPoint,
      screenPoint: { x: event.clientX, y: event.clientY },
      zoneId: zone?.id,
    })
    if (zone?.onTap) {
      event.preventDefault()
    }
  }

  function handlePointerCancelCapture(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    gesture.current = null
    setActiveDrag(null)
  }

  return (
    <BoardInputContext.Provider value={value}>
      <div
        onPointerCancelCapture={handlePointerCancelCapture}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMoveCapture={handlePointerMoveCapture}
        onPointerUpCapture={handlePointerUpCapture}
      >
        {children}
      </div>
    </BoardInputContext.Provider>
  )
}
