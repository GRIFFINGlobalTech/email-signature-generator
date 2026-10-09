import { SIGNATURE_MODES } from '../config/signature'
import { createSignaturePng, downloadBlob, signatureFileName } from './signatureRenderer'

export const canCopyImage = () =>
  typeof ClipboardItem !== 'undefined' && Boolean(navigator.clipboard?.write)

// Downloads one PNG per mode. Always fully transparent.
// Returns the file names so the UI can report them.
export async function downloadSignatures(details, modes, scale) {
  const files = []
  for (const mode of modes) {
    const { blob } = await createSignaturePng(details, { mode, scale })
    const fileName = signatureFileName(details, { mode, scale })
    downloadBlob(blob, fileName)
    files.push(fileName)
  }
  return files
}

// Copies one PNG to the clipboard.
// Dark mode gets a baked-in dark backing so the light text stays visible when pasted.
export async function copySignature(details, mode, scale) {
  if (!canCopyImage()) {
    throw new Error('Copy is not supported in this browser. Use Download instead.')
  }

  const background = mode === 'dark' ? SIGNATURE_MODES.dark.previewBackground : undefined

  // Pass a promise, not an awaited blob. Safari drops the click's permission
  // if anything is awaited before the clipboard write.
  const png = createSignaturePng(details, { mode, scale, background }).then((r) => r.blob)
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}