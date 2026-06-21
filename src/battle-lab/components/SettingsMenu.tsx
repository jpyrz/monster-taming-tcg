import { useRef } from 'react'
import { Button, SegmentedControl } from '@mantine/core'
import type { ThemeId, TcgTheme } from '../../theme/themes'
import { useBoardHitZone } from '../input/useBoardInput'
import styles from './BattleLabLayout.module.scss'

type SettingsMenuProps = {
  log: string[]
  onDebugChange: (enabled: boolean) => void
  onReset: () => void
  onThemeChange: (themeId: ThemeId) => void
  onToggle: () => void
  touchDebug: boolean
  open: boolean
  themeId: ThemeId
  themeOptions: Record<ThemeId, TcgTheme>
}

export function SettingsMenu({
  log,
  onDebugChange,
  onReset,
  onThemeChange,
  onToggle,
  open,
  touchDebug,
  themeId,
  themeOptions,
}: SettingsMenuProps) {
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const debugRef = useRef<HTMLButtonElement | null>(null)

  useBoardHitZone({
    id: 'settings-toggle',
    onTap: onToggle,
    priority: 70,
    ref: toggleRef,
  })

  useBoardHitZone({
    enabled: open,
    id: 'touch-debug-toggle',
    onTap: () => onDebugChange(!touchDebug),
    priority: 70,
    ref: debugRef,
  })

  return (
    <div className={styles.settingsHud}>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Settings"
        className={styles.settingsButton}
        data-cy="settings-toggle"
        onClick={onToggle}
      >
        ⚙
      </button>
      {open ? (
        <section className={styles.settingsMenu} data-cy="settings-menu">
          <span>Settings</span>
          <SegmentedControl
            value={themeId}
            onChange={(value) => onThemeChange(value as ThemeId)}
            data={Object.values(themeOptions).map((theme) => ({
              label: theme.label,
              value: theme.id,
            }))}
          />
          <Button color="brand" variant="light" onClick={onReset}>
            Reset
          </Button>
          <button
            ref={debugRef}
            type="button"
            className={styles.debugToggle}
            data-active={touchDebug || undefined}
            data-cy="touch-debug-toggle"
            onClick={() => onDebugChange(!touchDebug)}
          >
            Touch Debug
          </button>
          <div className={styles.settingsLog} aria-label="Battle log">
            <span>Battle log</span>
            {log.slice(0, 8).map((entry, index) => (
              <p key={`${entry}-${index}`}>{entry}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
