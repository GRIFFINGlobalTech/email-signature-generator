import { SIGNATURE_COMPANY, SIGNATURE_LAYOUT, SIGNATURE_MODES } from '../config/signature'

const LOGO_WORD = 'GRIFFIN'
const LOGO_SUB = 'GLOBAL TECHNOLOGIES'
const MEASURE_SIZE = 100

const font = (weight, size, family) => `${weight} ${size}px ${family}`

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

function fitFontSize(ctx, text, weight, family, targetWidth) {
  ctx.font = font(weight, MEASURE_SIZE, family)
  return (MEASURE_SIZE * targetWidth) / ctx.measureText(text).width
}

function layoutLogo(ctx) {
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

function buildTextLines(details) {
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
        { text: details.phone, weight: 400 },
      ],
    },
    {
      ...lines.detail,
      segments: [{ text: SIGNATURE_COMPANY.name, weight: 700, underline: true }],
    },
  ]
}

function layoutText(ctx, details) {
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

export function measureSignature(ctx, details) {
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

function drawLogo(ctx, logo, colors) {
  const family = SIGNATURE_LAYOUT.fonts.logo
  ctx.fillStyle = colors.logo

  ctx.font = font(800, logo.word.size, family)
  ctx.fillText(LOGO_WORD, logo.x, logo.y + logo.word.baseline)

  ctx.fillRect(logo.x, logo.y + logo.bar.y, logo.bar.width, logo.bar.height)

  ctx.font = font(700, logo.sub.size, family)
  ctx.fillText(LOGO_SUB, logo.x + logo.sub.x, logo.y + logo.sub.baseline)
}

function drawText(ctx, text, colors) {
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
export function renderSignature(canvas, details, { mode = 'light', scale = 1 } = {}) {
  const colors = SIGNATURE_MODES[mode] ?? SIGNATURE_MODES.light
  const ctx = canvas.getContext('2d')
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

export async function createSignaturePng(details, options) {
  await loadSignatureFonts()
  const canvas = document.createElement('canvas')
  const size = renderSignature(canvas, details, options)
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('PNG export failed'))), 'image/png')
  })
  return { blob, size }
}

export function signatureFileName(details, { mode, scale }) {
  const slug = `${details.firstName}-${details.surname}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = scale > 1 ? `@${scale}x` : ''
  return `griffin-signature-${slug || 'team-member'}-${mode}${suffix}.png`
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
