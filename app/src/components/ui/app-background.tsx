export function AppBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="app-background absolute inset-0" />
      <div className="app-background-grid absolute inset-0 opacity-70" />
      <div className="app-background-noise absolute inset-0 opacity-40" />
    </div>
  );
}
