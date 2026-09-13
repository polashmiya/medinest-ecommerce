/**
 * Templates re-mount on every navigation (layouts don't), so this gives each
 * page a short fade-and-rise entrance, like screen transitions in an app.
 * Disabled automatically by the reduced-motion rules in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
