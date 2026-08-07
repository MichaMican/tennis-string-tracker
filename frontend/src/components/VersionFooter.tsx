const version = import.meta.env.VITE_APP_VERSION;

export function VersionFooter() {
  if (!version) {
    return null;
  }

  return (
    <footer className="version-footer">v{version}</footer>
  );
}
