import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { Landing } from "./pages/Landing";
import { Impressum } from "./pages/Impressum";
import { AGB } from "./pages/AGB";
import { Datenschutz } from "./pages/Datenschutz";
import { Kontakt } from "./pages/Kontakt";
import { PaymentSuccess } from "./pages/PaymentSuccess";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-[#0a0a0a]">
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#121212',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#EDEDED',
              },
            }}
          />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
