import { Button, SegmentedControl } from '@mantine/core'
import type { ThemeId, TcgTheme } from '../../theme/themes'
import styles from './BattleLabLayout.module.scss'

type SettingsMenuProps = {
  log: string[]
  onReset: () => void
  onThemeChange: (themeId: ThemeId) => void
  onToggle: () => void
  open: boolean
  themeId: ThemeId
  themeOptions: Record<ThemeId, TcgTheme>
}

export function SettingsMenu({
  log,
  onReset,
  onThemeChange,
  onToggle,
  open,
  themeId,
  themeOptions,
}: SettingsMenuProps) {
  return (
    <div className={styles.settingsHud}>
      <button
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
