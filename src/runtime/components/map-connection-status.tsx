import { React } from 'jimu-core'

interface MapConnectionStatusProps {
  isMapWidgetSelected: boolean
  isMapViewReady: boolean
  mapConnectedLabel: string
  mapNotConnectedLabel: string
  selectMapInSettingLabel: string
}

const statusStyle: React.CSSProperties = {
  marginBottom: 'var(--sys-spacing-2)',
  padding: 'var(--sys-spacing-2)',
  borderRadius: 'var(--sys-shape-shape2)',
  border: '1px solid var(--sys-color-divider-secondary)'
}

const MapConnectionStatus = (props: MapConnectionStatusProps) => {
  const { isMapWidgetSelected, isMapViewReady, mapConnectedLabel, mapNotConnectedLabel, selectMapInSettingLabel } = props

  const connected = isMapWidgetSelected && isMapViewReady
  const statusText = connected ? mapConnectedLabel : mapNotConnectedLabel

  return (
    <section style={statusStyle} role="status" aria-live="polite">
      <div>{statusText}</div>
      {!isMapWidgetSelected && <div>{selectMapInSettingLabel}</div>}
    </section>
  )
}

export default MapConnectionStatus