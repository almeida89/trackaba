import { BarraLateral } from "./BarraLateral";

interface LayoutPrincipalProps {
  children: React.ReactNode;
}

export function LayoutPrincipal({ children }: LayoutPrincipalProps) {
  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <BarraLateral />
      </div>
      <main className="lg:ml-64 min-h-screen transition-all duration-300 print:ml-0">
        <div className="px-3 sm:px-4 lg:px-6 pt-16 lg:pt-6 pb-6 max-w-[1600px] mx-auto print:px-0 print:pt-0 print:pb-0 print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
