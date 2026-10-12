import { SIGNATURE_COMPANY, SIGNATURE_LAYOUT, SIGNATURE_MODES } from '../config/signature'
import type { SignatureFormData } from '../schemas/signatureForm'
import { formatPhoneNumber } from '../utils/phone'

type LogoImage = {
  src: string
  width: number
  height: number
}

// Email clients only keep inline styles and table layout, so the markup is deliberately old-school.
// Text is always dark ink: Outlook and Gmail recolour real text themselves in dark mode,
// which an image can't do.
const INK = SIGNATURE_MODES.light

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

function contactLines(details: SignatureFormData) {
  return {
    fullName: `${details.firstName} ${details.surname}`.trim(),
    phoneDisplay: formatPhoneNumber(details.phone, details.phoneCountry),
  }
}

export function buildSignatureHtml(details: SignatureFormData, logo: LogoImage) {
  const { lines, padding, dividerGap, dividerWidth } = SIGNATURE_LAYOUT
  const { fullName, phoneDisplay } = contactLines(details)
  const font = `font-family:${SIGNATURE_LAYOUT.fonts.text.replace(/"/g, "'")};`
  const text = (size: number, lineHeight: number, weight = 400) =>
    `${font}font-size:${size}px;line-height:${lineHeight}px;font-weight:${weight};color:${INK.text};margin:0;`
  const link = `color:${INK.text};text-decoration:none;`
  const detail = text(lines.detail.size, lines.detail.lineHeight)

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${font}">
  <tr>
    <td style="padding:${padding}px ${dividerGap}px ${padding}px ${padding}px;vertical-align:middle;">
      <a href="${SIGNATURE_COMPANY.website}" style="text-decoration:none;">
        <img src="${logo.src}" width="${logo.width}" height="${logo.height}" alt="GRIFFIN Global Technologies" style="display:block;border:0;width:${logo.width}px;height:${logo.height}px;">
      </a>
    </td>
    <td style="padding:${padding}px ${padding}px ${padding}px ${dividerGap}px;border-left:${dividerWidth}px solid ${INK.divider};vertical-align:middle;">
      <p style="${text(lines.name.size, lines.name.lineHeight)}">${escapeHtml(fullName)}</p>
      <p style="${text(lines.title.size, lines.title.lineHeight, 700)}">${escapeHtml(details.jobTitle)}</p>
      <p style="${detail}"><b>Email:</b> <a href="mailto:${escapeHtml(details.email)}" style="${link}">${escapeHtml(details.email)}</a></p>
      <p style="${detail}"><b>Phone:</b> <a href="tel:${escapeHtml(details.phone)}" style="${link}">${escapeHtml(phoneDisplay)}</a></p>
      <p style="${detail}"><a href="${SIGNATURE_COMPANY.website}" style="color:${INK.text};text-decoration:underline;font-weight:700;">${escapeHtml(SIGNATURE_COMPANY.name)}</a></p>
    </td>
  </tr>
</table>`
}

export function buildSignatureText(details: SignatureFormData) {
  const { fullName, phoneDisplay } = contactLines(details)
  return [
    fullName,
    details.jobTitle,
    `Email: ${details.email}`,
    `Phone: ${phoneDisplay}`,
    `${SIGNATURE_COMPANY.name} (${SIGNATURE_COMPANY.website})`,
  ].join('\n')
}
