export function GriffinLogo({ compact = false }) {
  return (
    <div className={`brand-lockup${compact ? ' is-compact' : ''}`} aria-label="Griffin Global Technologies">
      <span className="brand-lockup__word">GRIFFIN</span>
      <span className="brand-lockup__rule">
        <span className="brand-lockup__sub">GLOBAL TECHNOLOGIES</span>
      </span>
    </div>
  )
}
