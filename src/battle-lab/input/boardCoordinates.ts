export type BoardPoint = {
  x: number
  y: number
}

export type BoardRect = BoardPoint & {
  height: number
  width: number
}

export type StageMetrics = {
  frameHeight: number
  frameLeft: number
  frameTop: number
  frameWidth: number
  logicalHeight: number
  logicalWidth: number
  scale: number
}

export const baseStageWidth = 1280
export const baseStageHeight = 720

export function getInitialStageMetrics(): StageMetrics {
  return {
    frameHeight: baseStageHeight,
    frameLeft: 0,
    frameTop: 0,
    frameWidth: baseStageWidth,
    logicalHeight: baseStageHeight,
    logicalWidth: baseStageWidth,
    scale: 1,
  }
}

export function getStageMetrics(): StageMetrics {
  if (typeof window === 'undefined') {
    return getInitialStageMetrics()
  }

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const scale = viewportHeight / baseStageHeight
  const logicalWidth = Math.max(baseStageWidth, viewportWidth / scale)
  const frameLeft = ((window.innerWidth || viewportWidth) - viewportWidth) / 2
  const frameTop = ((window.innerHeight || viewportHeight) - viewportHeight) / 2

  return {
    frameHeight: viewportHeight,
    frameLeft,
    frameTop,
    frameWidth: viewportWidth,
    logicalHeight: baseStageHeight,
    logicalWidth,
    scale,
  }
}

export function screenToBoard(
  metrics: StageMetrics,
  clientX: number,
  clientY: number,
): BoardPoint {
  return {
    x: (clientX - metrics.frameLeft) / metrics.scale,
    y: (clientY - metrics.frameTop) / metrics.scale,
  }
}

export function boardToScreen(
  metrics: StageMetrics,
  point: BoardPoint,
): BoardPoint {
  return {
    x: metrics.frameLeft + point.x * metrics.scale,
    y: metrics.frameTop + point.y * metrics.scale,
  }
}

export function screenRectToBoardRect(
  metrics: StageMetrics,
  rect: DOMRect,
): BoardRect {
  const topLeft = screenToBoard(metrics, rect.left, rect.top)

  return {
    height: rect.height / metrics.scale,
    width: rect.width / metrics.scale,
    x: topLeft.x,
    y: topLeft.y,
  }
}

export function containsBoardPoint(rect: BoardRect, point: BoardPoint) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}
