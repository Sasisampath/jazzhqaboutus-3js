export function GridBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="screen-grid-bg flex min-h-dvh w-full flex-1 flex-col">
      {children}
    </div>
  );
}
