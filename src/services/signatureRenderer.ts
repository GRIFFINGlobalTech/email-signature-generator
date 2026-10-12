import { SIGNATURE_COMPANY, SIGNATURE_LAYOUT, SIGNATURE_MODES } from '../config/signature'
import type { SignatureMode } from '../config/signature'
import type { SignatureFormData } from '../schemas/signatureForm'
import { formatPhoneNumber } from '../utils/phone'

const LOGO_WORD = 'GRIFFIN'
const LOGO_SUB = 'GLOBAL TECHNOLOGIES'
const MEASURE_SIZE = 100

type SignaturePalette = (typeof SIGNATURE_MODES)[SignatureMode]

type SignatureRenderOptions = {
  mode?: SignatureMode
  scale?: number
}

type TextSegment = {
  text: string
  weight: 400 | 700
  role?: 'label'
  underline?: boolean
}

const font = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`

// Canvas only draws web fonts that have finished loading, so wait for them before rendering.
export async function loadSignatureFonts() {
  if (!document.fonts) return
  try {
    await document.fonts.ready
    await Promise.all([
      document.fonts.load(font(800, 40, 'Montserrat'), LOGO_WORD),
      document.fonts.load(font(700, 12, 'Montserrat'), LOGO_SUB),
    ])
  } catch {
    // Fall back to the system fonts in SIGNATURE_LAYOUT.fonts.logo.
  }
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  family: string,
  targetWidth: number,
) {
  ctx.font = font(weight, MEASURE_SIZE, family)
  return (MEASURE_SIZE * targetWidth) / ctx.measureText(text).width
}

function layoutLogo(ctx: CanvasRenderingContext2D) {
  const { logoWidth, logoSubRatio, logoRowGap, logoBarHeight, logoBarGap, fonts } = SIGNATURE_LAYOUT

  const wordSize = fitFontSize(ctx, LOGO_WORD, 800, fonts.logo, logoWidth)
  ctx.font = font(800, wordSize, fonts.logo)
  const word = ctx.measureText(LOGO_WORD)

  const subSize = fitFontSize(ctx, LOGO_SUB, 700, fonts.logo, logoWidth * logoSubRatio)
  ctx.font = font(700, subSize, fonts.logo)
  const sub = ctx.measureText(LOGO_SUB)

  const wordAscent = word.actualBoundingBoxAscent
  const subAscent = sub.actualBoundingBoxAscent
  const rowTop = wordAscent + logoRowGap
  const subX = logoWidth - sub.width

  return {
    width: logoWidth,
    height: rowTop + subAscent,
    word: { size: wordSize, baseline: wordAscent },
    sub: { size: subSize, x: subX, baseline: rowTop + subAscent },
    bar: {
      width: Math.max(0, subX - logoBarGap),
      y: rowTop + subAscent / 2 - logoBarHeight / 2,
      height: logoBarHeight,
    },
  }
}

function buildTextLines(
  details: SignatureFormData,
): { size: number; lineHeight: number; segments: TextSegment[] }[] {
  const { lines } = SIGNATURE_LAYOUT
  const fullName = `${details.firstName} ${details.surname}`.trim()

  return [
    { ...lines.name, segments: [{ text: fullName, weight: 400 }] },
    { ...lines.title, segments: [{ text: details.jobTitle, weight: 700 }] },
    {
      ...lines.detail,
      segments: [
        { text: 'Email: ', weight: 700, role: 'label' },
        { text: details.email, weight: 400 },
      ],
    },
    {
      ...lines.detail,
      segments: [
        { text: 'Phone: ', weight: 700, role: 'label' },
        { text: formatPhoneNumber(details.phone, details.phoneCountry), weight: 400 },
      ],
    },
    {
      ...lines.detail,
      segments: [{ text: SIGNATURE_COMPANY.name, weight: 700, underline: true }],
    },
  ]
}

function layoutText(ctx: CanvasRenderingContext2D, details: SignatureFormData) {
  const family = SIGNATURE_LAYOUT.fonts.text
  let top = 0
  let width = 0

  const lines = buildTextLines(details).map((line) => {
    let x = 0
    const segments = line.segments.map((segment) => {
      ctx.font = font(segment.weight, line.size, family)
      const measured = { ...segment, x, width: ctx.measureText(segment.text).width }
      x += measured.width
      return measured
    })
    // Centre the cap height inside the line box.
    const baseline = top + (line.lineHeight + line.size * 0.72) / 2
    top += line.lineHeight
    width = Math.max(width, x)
    return { ...line, segments, baseline }
  })

  return { width, height: top, lines }
}

export function measureSignature(ctx: CanvasRenderingContext2D, details: SignatureFormData) {
  const { padding, dividerGap, dividerWidth } = SIGNATURE_LAYOUT
  const logo = layoutLogo(ctx)
  const text = layoutText(ctx, details)
  const contentHeight = Math.max(logo.height, text.height)

  const dividerX = padding + logo.width + dividerGap
  const textX = dividerX + dividerWidth + dividerGap

  return {
    width: Math.ceil(textX + text.width + padding),
    height: Math.ceil(contentHeight + padding * 2),
    logo: { ...logo, x: padding, y: padding + (contentHeight - logo.height) / 2 },
    divider: { x: dividerX, y: padding, width: dividerWidth, height: contentHeight },
    text: { ...text, x: textX, y: padding + (contentHeight - text.height) / 2 },
  }
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: ReturnType<typeof layoutLogo> & { x: number; y: number },
  colors: SignaturePalette,
) {
  const family = SIGNATURE_LAYOUT.fonts.logo
  ctx.fillStyle = colors.logo

  ctx.font = font(800, logo.word.size, family)
  ctx.fillText(LOGO_WORD, logo.x, logo.y + logo.word.baseline)

  ctx.fillRect(logo.x, logo.y + logo.bar.y, logo.bar.width, logo.bar.height)

  ctx.font = font(700, logo.sub.size, family)
  ctx.fillText(LOGO_SUB, logo.x + logo.sub.x, logo.y + logo.sub.baseline)
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: ReturnType<typeof measureSignature>['text'],
  colors: SignaturePalette,
) {
  const family = SIGNATURE_LAYOUT.fonts.text

  for (const line of text.lines) {
    const baseline = text.y + line.baseline
    for (const segment of line.segments) {
      const x = text.x + segment.x
      ctx.font = font(segment.weight, line.size, family)
      ctx.fillStyle = segment.role === 'label' ? colors.labelInk : colors.text
      ctx.fillText(segment.text, x, baseline)
      if (segment.underline) {
        ctx.fillRect(x, baseline + 2, segment.width, 1)
      }
    }
  }
}

/**
 * Draws the signature onto `canvas` with a transparent background.
 * Returns the 1x size so callers can display or insert the image at its intended size.
 */
export function renderSignature(
  canvas: HTMLCanvasElement,
  details: SignatureFormData,
  { mode = 'light', scale = 1 }: SignatureRenderOptions = {},
) {
  const colors = SIGNATURE_MODES[mode]
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is not available')
  }
  const layout = measureSignature(ctx, details)

  // Resizing clears the canvas and resets the context state.
  canvas.width = Math.round(layout.width * scale)
  canvas.height = Math.round(layout.height * scale)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, layout.width, layout.height)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  drawLogo(ctx, layout.logo, colors)

  ctx.fillStyle = colors.divider
  const { divider } = layout
  ctx.fillRect(divider.x, divider.y, divider.width, divider.height)

  drawText(ctx, layout.text, colors)

  return { width: layout.width, height: layout.height }
}

export async function createSignaturePng(
  details: SignatureFormData,
  options: SignatureRenderOptions = {},
) {
  await loadSignatureFonts()
  const canvas = document.createElement('canvas')
  const size = renderSignature(canvas, details, options)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('PNG export failed'))), 'image/png')
  })
  return { blob, size }
}

/**
 * Renders only the logo as a transparent PNG data URL, for embedding in the HTML signature.
 * `size` is the 1x size the <img> should be displayed at.
 */
export async function createLogoDataUrl({ mode = 'light', scale = 2 }: SignatureRenderOptions = {}) {
  await loadSignatureFonts()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is not available')
  }
  const logo = layoutLogo(ctx)
  const width = Math.ceil(logo.width)
  const height = Math.ceil(logo.height)

  canvas.width = width * scale
  canvas.height = height * scale
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  drawLogo(ctx, { ...logo, x: 0, y: 0 }, SIGNATURE_MODES[mode])

  return { dataUrl: canvas.toDataURL('image/png'), size: { width, height } }
}

export function signatureFileName(
  details: SignatureFormData,
  { mode, scale }: { mode: SignatureMode; scale: number },
) {
  const slug = `${details.firstName}-${details.surname}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = scale > 1 ? `@${scale}x` : ''
  return `griffin-signature-${slug || 'team-member'}-${mode}${suffix}.png`
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
