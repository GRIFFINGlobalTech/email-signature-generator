export const SIGNATURE_COMPANY = {
  name: 'GRIFFIN Global Technologies',
  website: 'https://griffinglobaltech.com',
  websiteLabel: 'griffinglobaltech.com',
}

// Every export has a transparent background. The mode only decides the ink colours,
// so the signature stays readable on a light or a dark inbox.
export const SIGNATURE_MODES = {
  light: {
    id: 'light',
    label: 'Light mode',
    description: 'Dark text for white or light email backgrounds.',
    previewBackground: '#ffffff',
    logo: '#8cc63f',
    text: '#1f1f1f',
    labelInk: '#1f1f1f',
    divider: '#2b2b2b',
  },
  dark: {
    id: 'dark',
    label: 'Dark mode',
    description: 'White text for dark-mode inboxes.',
    previewBackground: '#1f1f1f',
    logo: '#9bd14b',
    text: '#ffffff',
    labelInk: '#ffffff',
    divider: '#e6e6e6',
  },
}

export const SIGNATURE_SCALES = [
  {
    id: '1x',
    value: 1,
    label: 'Standard',
    description: 'Smallest file. Can look soft on high-resolution screens.',
  },
  {
    id: '2x',
    value: 2,
    label: 'Retina',
    description: 'Recommended. Sharp on laptops and phones.',
  },
  {
    id: '3x',
    value: 3,
    label: 'Extra sharp',
    description: 'Largest file, for 4K displays.',
  },
]

export const DEFAULT_SCALE_ID = '2x'

// All measurements are CSS pixels at 1x; exports multiply them by the chosen scale.
export const SIGNATURE_LAYOUT = {
  padding: 12,
  logoWidth: 200,
  logoSubRatio: 0.58,
  logoRowGap: 7,
  logoBarHeight: 5,
  logoBarGap: 8,
  dividerGap: 20,
  dividerWidth: 2,
  fonts: {
    logo: "Montserrat, 'Arial Black', Arial, sans-serif",
    text: 'Arial, Helvetica, sans-serif',
  },
  lines: {
    name: { size: 20, lineHeight: 28 },
    title: { size: 15, lineHeight: 24 },
    detail: { size: 13, lineHeight: 21 },
  },
}
