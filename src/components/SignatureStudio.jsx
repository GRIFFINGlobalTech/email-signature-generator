import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SCALE_ID,
  SIGNATURE_COMPANY,
  SIGNATURE_MODES,
  SIGNATURE_SCALES,
} from '../config/signature'
import {
  createSignaturePng,
  downloadBlob,
  loadSignatureFonts,
  renderSignature,
  signatureFileName,
} from '../services/signatureRenderer'
import './SignatureStudio.css'

const MODE_IDS = Object.keys(SIGNATURE_MODES)

function initialMode() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function SignatureStudio({ details, onBack }) {
  const canvasRef = useRef(null)
  const [mode, setMode] = useState(initialMode)
  const [scaleId, setScaleId] = useState(DEFAULT_SCALE_ID)
  const [showTransparency, setShowTransparency] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [size, setSize] = useState(null)
  const [status, setStatus] = useState({ busy: false, message: '', error: false })

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

  const download = async (modes) => {
    setStatus({ busy: true, message: 'Generating PNG…', error: false })
    try {
      const files = []
      for (const modeId of modes) {
        const { blob } = await createSignaturePng(details, { mode: modeId, scale: scale.value })
        const fileName = signatureFileName(details, { mode: modeId, scale: scale.value })
        downloadBlob(blob, fileName)
        files.push(fileName)
      }
      setStatus({ busy: false, message: `Downloaded ${files.join(' and ')}`, error: false })
    } catch {
      setStatus({
        busy: false,
        message: 'The image could not be generated. Try again or use another browser.',
        error: true,
      })
    }
  }

  const stageClass = showTransparency ? 'signature-stage is-checker' : 'signature-stage'

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
          <strong>Before you paste it into Outlook or Gmail:</strong>
        </p>
        <ul>
          {size ? (
            <li>
              Set the image width to {size.width} px ({size.width} × {size.height}) so it shows
              at the right size. Larger exports only make it sharper.
            </li>
          ) : null}
          <li>
            Images can&apos;t carry links. Select the image and add a link to{' '}
            {SIGNATURE_COMPANY.websiteLabel} so the company name stays clickable.
          </li>
          <li>Pick the mode that matches your inbox, or download both if you switch themes.</li>
        </ul>
      </div>

      <p
        className={`studio__status${status.error ? ' is-error' : ''}`}
        role={status.error ? 'alert' : 'status'}
      >
        {status.message}
      </p>

      <div className="form-actions studio__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back to details
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => download(MODE_IDS)}
          disabled={status.busy || !fontsReady}
        >
          Download both
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => download([mode])}
          disabled={status.busy || !fontsReady}
        >
          Download {activeMode.label.toLowerCase()} PNG
        </button>
      </div>
    </section>
  )
}
