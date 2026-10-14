import { React, hooks, defaultMessages as jimuCoreMessages } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const translate = hooks.useTranslation(jimuCoreMessages, defaultMessages)

  const fieldContainerStyle: React.CSSProperties = {
    width: 'calc(100% - 16px)',
    maxWidth: '260px'
  }

  const onMapWidgetSelected = React.useCallback((useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds
    })
  }, [props])

  const onWidgetBaseUrlChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set('widgetBaseUrl', evt.currentTarget.value)
    })
  }, [props])

  const onRenderMaxSizeChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const renderMaxSize = Number(evt.currentTarget.value) as 2048 | 4096 | 8192
    props.onSettingChange({
      id: props.id,
      config: props.config.set('renderMaxSize', renderMaxSize)
    })
  }, [props])

  return (
    <div className="widget-setting-geo-pdf p-2" style={{ width: '100%' }}>
      <div style={{ fontWeight: 600, margin: '12px 0 8px 0' }}>{translate('mapSectionTitle')}</div>
      <SettingSection>
        <SettingRow>
          <div style={fieldContainerStyle}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>
              {translate('mapSelectorLabel')}
            </div>
            <MapWidgetSelector
              useMapWidgetIds={props.useMapWidgetIds}
              onSelect={onMapWidgetSelected}
            />
            <div style={{ marginTop: 'var(--sys-spacing-1)' }}>
              {translate('mapSelectorHint')}
            </div>
          </div>
        </SettingRow>
      </SettingSection>
      <SettingSection>
        <SettingRow>
          <div style={fieldContainerStyle}>
            <label htmlFor="geopdf-widget-base-url" style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>
              {translate('widgetBaseUrlLabel')}
            </label>
            <input
              id="geopdf-widget-base-url"
              type="url"
              value={props.config.widgetBaseUrl ?? ''}
              onChange={onWidgetBaseUrlChange}
              placeholder="https://example.com/widget/geopdf/"
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: 'var(--sys-spacing-1)' }}>
              {translate('widgetBaseUrlHint')}
            </div>
          </div>
        </SettingRow>
      </SettingSection>
      <SettingSection>
        <SettingRow>
          <div style={fieldContainerStyle}>
            <label htmlFor="geopdf-render-resolution" style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>
              {translate('renderResolutionLabel')}
            </label>
            <select
              id="geopdf-render-resolution"
              value={props.config.renderMaxSize ?? 4096}
              onChange={onRenderMaxSizeChange}
              style={{ width: '100%' }}
            >
              <option value={2048}>2048 px</option>
              <option value={4096}>4096 px</option>
              <option value={8192}>8192 px</option>
            </select>
            <div style={{ marginTop: 'var(--sys-spacing-1)' }}>
              {translate('renderResolutionHint')}
            </div>
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting