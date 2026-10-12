import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SCALE_ID,
  SIGNATURE_COMPANY,
  SIGNATURE_MODES,
  SIGNATURE_SCALES,
  type SignatureMode,
  type SignatureScaleId,
} from '../config/signature'
import type { SignatureFormData } from '../schemas/signatureForm'
import {
  createSignaturePng,
  downloadBlob,
  loadSignatureFonts,
  renderSignature,
  signatureFileName,
} from '../services/signatureRenderer'
import {
  canCopySignature,
  copySignature,
} from '../services/signatureActions'
import './SignatureStudio.css'


const MODE_IDS = Object.values(SIGNATURE_MODES).map(({ id }) => id)

type SignatureStudioProps = {
  details: SignatureFormData
  onBack: () => void
}

type SignatureSize = {
  width: number
  height: number
}

type StudioStatus = {
  busy: boolean
  message: string
  error: boolean
}

function initialMode(): SignatureMode {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function SignatureStudio({ details, onBack }: SignatureStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<SignatureMode>(initialMode)
  const [scaleId, setScaleId] = useState<SignatureScaleId>(DEFAULT_SCALE_ID)
  const [showTransparency, setShowTransparency] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [size, setSize] = useState<SignatureSize | null>(null)
  const [status, setStatus] = useState<StudioStatus>({ busy: false, message: '', error: false })

  const scale = SIGNATURE_SCALES.find((option) => option.id === scaleId) ?? SIGNATURE_SCALES[1]
  const activeMode = SIGNATURE_MODES[mode]
  const fullName = `${details.firstName} ${details.surname}`

  useEffect(() => {
    let cancelled = false
    loadSignatureFonts().then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!fontsReady || !canvasRef.current) return
    const previewScale = Math.max(2, Math.ceil(window.devicePixelRatio || 1))
    setSize(renderSignature(canvasRef.current, details, { mode, scale: previewScale }))
  }, [details, mode, fontsReady])

  const download = async () => {
    setStatus({ busy: true, message: 'Generating PNG…', error: false })
    try {
      const { blob } = await createSignaturePng(details, { mode, scale: scale.value })
      const fileName = signatureFileName(details, { mode, scale: scale.value })
      downloadBlob(blob, fileName)
      setStatus({ busy: false, message: `Downloaded ${fileName}`, error: false })
    } catch {
      setStatus({
        busy: false,
        message: 'The image could not be generated. Try again or use another browser.',
        error: true,
      })
    }
  }

  const stageClass = showTransparency ? 'signature-stage is-checker' : 'signature-stage'

const copy = async () => {
  setStatus({ busy: true, message: 'Copying…', error: false })
  try {
    await copySignature(details)
    setStatus({
      busy: false,
      message:
        'Copied. Paste it into the signature box in Outlook or Gmail: logo, details and links are all included.',
      error: false,
    })
  } catch {
    setStatus({
      busy: false,
      message: 'Copy failed. Allow clipboard access, or use Download instead.',
      error: true,
    })
  }
}

  return (
    <section className="form-card studio" aria-labelledby="studio-title">
      <header className="form-card__header">
        <p className="eyebrow">Signature preview</p>
        <h2 id="studio-title">{fullName}&apos;s Griffin signature</h2>
        <p className="lede">
          Choose light or dark mode, check the preview, then download a transparent PNG to add
          to your email client.
        </p>
      </header>

      <div className="studio__controls">
        <div className="segmented" role="radiogroup" aria-label="Signature mode">
          {MODE_IDS.map((modeId) => (
            <button
              key={modeId}
              type="button"
              role="radio"
              aria-checked={mode === modeId}
              className={`segmented__option${mode === modeId ? ' is-active' : ''}`}
              onClick={() => setMode(modeId)}
            >
              {SIGNATURE_MODES[modeId].label}
            </button>
          ))}
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={showTransparency}
            onChange={(event) => setShowTransparency(event.target.checked)}
          />
          <span className="switch__track" aria-hidden="true" />
          Show transparency
        </label>
      </div>

      <figure className="studio__preview">
        <div
          className={stageClass}
          style={showTransparency ? undefined : { background: activeMode.previewBackground }}
        >
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            role="img"
            aria-label={`${activeMode.label} email signature for ${fullName}`}
            style={size ? { width: `${size.width}px` } : undefined}
          />
          {!fontsReady ? <p className="signature-stage__loading">Preparing preview…</p> : null}
        </div>
        <figcaption>
          {showTransparency
            ? 'The checkerboard shows the transparent areas of the PNG.'
            : `Previewed on a ${mode === 'dark' ? 'dark' : 'white'} email background. ${activeMode.description}`}
        </figcaption>
      </figure>

      <fieldset className="form-section">
        <legend>Image size</legend>
        <div className="size-options">
          {SIGNATURE_SCALES.map((option) => (
            <label
              key={option.id}
              className={`size-option${option.id === scaleId ? ' is-active' : ''}`}
            >
              <input
                type="radio"
                name="signature-scale"
                value={option.id}
                checked={option.id === scaleId}
                onChange={() => setScaleId(option.id)}
              />
              <span className="size-option__title">
                {option.label} <span>{option.id}</span>
              </span>
              <span className="size-option__dims">
                {size
                  ? `${size.width * option.value} × ${size.height * option.value} px`
                  : '—'}
              </span>
              <span className="size-option__hint">{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="company-note" role="note">
        <p>
          <strong>Adding it to Outlook or Gmail:</strong>
        </p>
        <ul>
          <li>
            Use <strong>Copy signature</strong> and paste into the signature editor. Your email,
            phone and {SIGNATURE_COMPANY.websiteLabel} stay as clickable text, and your inbox
            adjusts the colours in dark mode automatically.
          </li>
          {size ? (
            <li>
              Inserting a downloaded PNG instead? Set its width to {size.width} px so it shows
              at the right size, and pick the mode that matches your inbox. Dark mode text is
              white, so it looks blank on a white background.
            </li>
          ) : null}
        </ul>
      </div>

      <p
        className={`studio__status${status.error ? ' is-error' : ''}`}
        role={status.error ? 'alert' : 'status'}
      >
        {status.message}
      </p>

      <div className="form-actions studio__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={copy}
          disabled={status.busy || !fontsReady || !canCopySignature()}
          title={canCopySignature() ? undefined : 'Copy is not supported in this browser. Use Download instead.'}
        >
          Copy signature
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={download}
          disabled={status.busy || !fontsReady}
        >
          Download PNG
        </button>
        <button type="button" className="btn btn--ghost btn--back" onClick={onBack}>
          Back to details
        </button>
      </div>
    </section>
  )
}
