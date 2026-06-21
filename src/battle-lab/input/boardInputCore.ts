import { createContext } from 'react'
import type { BoardPoint, BoardRect, StageMetrics } from './boardCoordinates'

export type BoardDragData = {
  cardId: string
  handIndex: number
  type: 'hand-card'
}

export type BoardHitZone = {
  bounds: BoardRect
  dragData?: BoardDragData
  enabled?: boolean
  id: string
  onDrop?: (dragData: BoardDragData) => void
  onTap?: () => void
  priority: number
}

export type BoardDebugSample = {
  action: 'drag' | 'drop' | 'tap' | 'unknown'
  boardPoint: BoardPoint
  screenPoint: BoardPoint
  zoneId?: string
}

export type BoardDragState = {
  boardPoint: BoardPoint
  data: BoardDragData
} | null

export type BoardInputContextValue = {
  activeDrag: BoardDragState
  debugSample: BoardDebugSample | null
  metrics: StageMetrics
  registerZone: (zone: BoardHitZone) => () => void
  screenToBoard: (clientX: number, clientY: number) => BoardPoint
  setDebugSample: (sample: BoardDebugSample | null) => void
}

export const BoardInputContext =
  createContext<BoardInputContextValue | null>(null)
