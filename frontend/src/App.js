import React, { useEffect, Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components - Always loaded
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Loading Spinner for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin" />
      <span className="text-[#A1A1AA] text-sm">Laden...</span>
    </div>
  </div>
);

// Pages - Lazy loaded for code splitting
const Landing = lazy(() => import("./pages/Landing").then(m => ({ default: m.Landing })));
const Impressum = lazy(() => import("./pages/Impressum").then(m => ({ default: m.Impressum })));
const AGB = lazy(() => import("./pages/AGB").then(m => ({ default: m.AGB })));
const Datenschutz = lazy(() => import("./pages/Datenschutz").then(m => ({ default: m.Datenschutz })));
const Kontakt = lazy(() => import("./pages/Kontakt").then(m => ({ default: m.Kontakt })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail").then(m => ({ default: m.VerifyEmail })));
const FAQ = lazy(() => import("./pages/FAQ").then(m => ({ default: m.FAQ })));

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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/kontakt" element={<Kontakt />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
              </Routes>
            </Suspense>
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
