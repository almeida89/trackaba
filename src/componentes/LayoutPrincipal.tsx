import { BarraLateral } from "./BarraLateral";

interface LayoutPrincipalProps {
  children: React.ReactNode;
}

export function LayoutPrincipal({ children }: LayoutPrincipalProps) {
  return (
    <div className="min-h-screen bg-background">
      <BarraLateral />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <div className="px-3 sm:px-4 lg:px-6 pt-16 lg:pt-6 pb-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
