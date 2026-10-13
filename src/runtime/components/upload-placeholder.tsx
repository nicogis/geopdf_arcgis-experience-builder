import { React } from 'jimu-core'

interface UploadPlaceholderProps {
  allowLocalUpload: boolean
  uploadTitle: string
  uploadDescription: string
  fileInputLabel: string
  noFileSelectedLabel: string
  selectedFileLabel: string
  statusMessage: string
  isLoading: boolean
  onFileSelected: (evt: React.ChangeEvent<HTMLInputElement>) => void
}

const containerStyle: React.CSSProperties = {
  padding: 'var(--sys-spacing-2)',
  borderRadius: 'var(--sys-shape-shape2)',
  border: '1px solid var(--sys-color-divider-secondary)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--sys-spacing-2)'
}

const UploadPlaceholder = (props: UploadPlaceholderProps) => {
  const {
    allowLocalUpload,
    uploadTitle,
    uploadDescription,
    fileInputLabel,
    noFileSelectedLabel,
    selectedFileLabel,
    statusMessage,
    isLoading,
    onFileSelected
  } = props

  return (
    <section style={containerStyle} aria-label={uploadTitle}>
      <h4 style={{ margin: 0 }}>{uploadTitle}</h4>
      <p style={{ margin: 0 }}>{uploadDescription}</p>

      <label htmlFor="geopdf-upload-input">{fileInputLabel}</label>
      <input
        id="geopdf-upload-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileSelected}
        disabled={!allowLocalUpload || isLoading}
      />

      <div role="status" aria-live="polite">
        {selectedFileLabel || noFileSelectedLabel}
      </div>

      <div role="status" aria-live="polite">
        {statusMessage}
      </div>
    </section>
  )
}

export default UploadPlaceholder