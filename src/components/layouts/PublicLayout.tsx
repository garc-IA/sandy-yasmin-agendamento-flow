
import { Outlet } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { CustomBanner } from "./CustomBanner";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomBanner />
      <header className="bg-white border-b py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary font-playfair">
            Studio Sandy Yasmin
          </Link>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link to="/cliente" className="flex items-center">
                Área do Cliente
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/login" className="flex items-center">
                Área Administrativa
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
