import { React, hooks, defaultMessages as jimuCoreMessages, type AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Switch } from 'jimu-ui'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import MapConnectionStatus from './components/map-connection-status'
import UploadPlaceholder from './components/upload-placeholder'
import { loadGeoPdfAsMediaLayer } from './services/geopdf-loader'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const translate = hooks.useTranslation(jimuCoreMessages, defaultMessages)
  const [selectedFileName, setSelectedFileName] = React.useState<string>('')
  const [activeMapViewId, setActiveMapViewId] = React.useState<string>('')
  const [statusMessage, setStatusMessage] = React.useState<string>(translate('statusIdle'))
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [layerVisible, setLayerVisible] = React.useState<boolean>(true)
  const [layerOpacity, setLayerOpacity] = React.useState<number>(1)

  const jimuMapViewRef = React.useRef<JimuMapView | null>(null)
  const geoPdfLayerRef = React.useRef<__esri.MediaLayer | null>(null)

  const selectedMapWidgetId = props.useMapWidgetIds?.[0]
  const isMapWidgetSelected = Boolean(selectedMapWidgetId)
  const isMapViewReady = isMapWidgetSelected && Boolean(activeMapViewId)

  const removeCurrentGeoPdfLayer = React.useCallback(() => {
    const layer = geoPdfLayerRef.current
    const map = jimuMapViewRef.current?.view?.map

    if (layer && map) {
      map.remove(layer)
    }

    geoPdfLayerRef.current = null
  }, [])

  const onFileSelected = React.useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0]
    const fileName = evt.target.files?.[0]?.name ?? ''
    setSelectedFileName(fileName)

    if (!file) {
      setStatusMessage(translate('statusNoFile'))
      return
    }

    const view = jimuMapViewRef.current?.view
    if (!view) {
      setStatusMessage(translate('statusMapRequired'))
      return
    }

    try {
      setIsLoading(true)
      setStatusMessage(translate('statusLoading'))

      removeCurrentGeoPdfLayer()
      const workerUrl = new URL('dist/runtime/assets/pdf.worker.min.js', props.context.folderUrl).href
      const result = await loadGeoPdfAsMediaLayer(file, workerUrl)

      geoPdfLayerRef.current = result.layer
      result.layer.visible = layerVisible
      result.layer.opacity = layerOpacity
      view.map.add(result.layer)
      view.goTo(result.extent.expand(1.1)).catch(() => undefined)

      setStatusMessage(translate('statusLoaded'))
    } catch (error) {
      const details = error instanceof Error ? error.message : translate('statusUnknownError')
      setStatusMessage(translate('statusLoadError', { details }))
    } finally {
      setIsLoading(false)
      evt.target.value = ''
    }
  }, [layerOpacity, layerVisible, removeCurrentGeoPdfLayer, props.context.folderUrl, translate])

  const onActiveViewChange = React.useCallback((jimuMapView: JimuMapView) => {
    jimuMapViewRef.current = jimuMapView ?? null
    setActiveMapViewId(jimuMapView?.id ?? '')
  }, [])

  const onVisibilityChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const visible = evt.currentTarget.checked
    setLayerVisible(visible)

    if (geoPdfLayerRef.current) {
      geoPdfLayerRef.current.visible = visible
    }
  }, [])

  const onOpacityChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(evt.currentTarget.value)
    const opacity = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1
    setLayerOpacity(opacity)

    if (geoPdfLayerRef.current) {
      geoPdfLayerRef.current.opacity = opacity
    }
  }, [])

  React.useEffect(() => {
    return () => {
      removeCurrentGeoPdfLayer()
    }
  }, [removeCurrentGeoPdfLayer])

  return (
    <div className="jimu-widget widget-geo-pdf p-2" style={{ color: 'var(--sys-color-surface-paper-text)' }}>
      {(!isMapWidgetSelected || !isMapViewReady) && (
        <MapConnectionStatus
          isMapWidgetSelected={isMapWidgetSelected}
          isMapViewReady={isMapViewReady}
          mapConnectedLabel={translate('mapConnected')}
          mapNotConnectedLabel={translate('mapNotConnected')}
          selectMapInSettingLabel={translate('selectMapInSetting')}
        />
      )}

      <UploadPlaceholder
        allowLocalUpload={props.config.allowLocalUpload !== false}
        uploadTitle={translate('uploadTitle')}
        uploadDescription={translate('uploadDescription')}
        fileInputLabel={translate('fileInputLabel')}
        noFileSelectedLabel={translate('noFileSelected')}
        selectedFileLabel={selectedFileName ? translate('selectedFile', { fileName: selectedFileName }) : ''}
        statusMessage={statusMessage}
        isLoading={isLoading}
        onFileSelected={onFileSelected}
      />

      <section
        style={{
          marginTop: 'var(--sys-spacing-2)',
          padding: 'var(--sys-spacing-2)',
          borderRadius: 'var(--sys-shape-shape2)',
          border: '1px solid var(--sys-color-divider-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sys-spacing-2)'
        }}
      >
        <div>{translate('layerControlsTitle')}</div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-spacing-1)' }}>
          <Switch checked={layerVisible} onChange={onVisibilityChange} />
          <span>{translate('layerVisibility')}</span>
        </label>

        <div>
          <div style={{ marginBottom: 'var(--sys-spacing-1)' }}>{translate('layerOpacity')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-spacing-2)' }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={layerOpacity}
              onChange={onOpacityChange}
              aria-label={translate('layerOpacity')}
              style={{ flex: 1, minWidth: 0 }}
            />
            <output style={{ minWidth: '3.5em', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(layerOpacity * 100)}%
            </output>
          </div>
        </div>
      </section>

      {isMapWidgetSelected && (
        <JimuMapViewComponent
          useMapWidgetId={selectedMapWidgetId}
          onActiveViewChange={onActiveViewChange}
        />
      )}
    </div>
  )
}

export default Widget