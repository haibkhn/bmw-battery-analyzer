import { ReactNode } from "react";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
