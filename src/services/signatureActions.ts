import type { SignatureMode } from '../config/signature'
import type { SignatureFormData } from '../schemas/signatureForm'
import { buildSignatureHtml, buildSignatureText } from './signatureHtml'
import { createLogoDataUrl, createSignaturePng, downloadBlob, signatureFileName } from './signatureRenderer'

export const canCopySignature = () =>
  typeof ClipboardItem !== 'undefined' && Boolean(navigator.clipboard?.write)

// Downloads one PNG per mode. Always fully transparent.
// Returns the file names so the UI can report them.
export async function downloadSignatures(
  details: SignatureFormData,
  modes: readonly SignatureMode[],
  scale: number,
) {
  const files = []
  for (const mode of modes) {
    const { blob } = await createSignaturePng(details, { mode, scale })
    const fileName = signatureFileName(details, { mode, scale })
    downloadBlob(blob, fileName)
    files.push(fileName)
  }
  return files
}

// Copies the whole signature as rich text: the logo as an embedded image, every detail as
// real, linked text, plus a plain-text fallback. Pasting into Outlook or Gmail keeps all of it,
// at the right size, and the client handles dark mode for the text.
export async function copySignature(details: SignatureFormData) {
  if (!canCopySignature()) {
    throw new Error('Copy is not supported in this browser. Use Download instead.')
  }

  // Pass promises, not awaited blobs. Safari drops the click's permission
  // if anything is awaited before the clipboard write.
  const html = createLogoDataUrl({ mode: 'light', scale: 2 }).then(
    ({ dataUrl, size }) =>
      new Blob([buildSignatureHtml(details, { src: dataUrl, ...size })], { type: 'text/html' }),
  )
  const text = new Blob([buildSignatureText(details)], { type: 'text/plain' })

  await navigator.clipboard.write([new ClipboardItem({ 'text/html': html, 'text/plain': text })])
}
