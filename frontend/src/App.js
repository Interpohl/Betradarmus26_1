import React, { useEffect, Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

// Context
import { AuthProvider } from "./context/AuthContext";

// Analytics - PostHog
import { PostHogProvider } from "./utils/PostHogProvider";

// Components - Always loaded
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Critical page - load immediately
import { Landing } from "./pages/Landing";

// Loading Spinner for Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin" />
      <span className="text-[#A1A1AA] text-sm">Laden...</span>
    </div>
  </div>
);

// Secondary pages - Lazy loaded (rarely visited)
const Impressum = lazy(() => import("./pages/Impressum").then(m => ({ default: m.Impressum })));
const AGB = lazy(() => import("./pages/AGB").then(m => ({ default: m.AGB })));
const Datenschutz = lazy(() => import("./pages/Datenschutz").then(m => ({ default: m.Datenschutz })));
const Kontakt = lazy(() => import("./pages/Kontakt").then(m => ({ default: m.Kontakt })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail").then(m => ({ default: m.VerifyEmail })));
const FAQ = lazy(() => import("./pages/FAQ").then(m => ({ default: m.FAQ })));
const BillingPage = lazy(() => import("./pages/BillingPage").then(m => ({ default: m.BillingPage })));

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
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <PostHogProvider>
            <div className="App min-h-screen bg-[#0a0a0a]">
              <ScrollToTop />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="/verify" element={<Suspense fallback={<PageLoader />}><VerifyEmail /></Suspense>} />
                  <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQ /></Suspense>} />
                  <Route path="/impressum" element={<Suspense fallback={<PageLoader />}><Impressum /></Suspense>} />
                  <Route path="/agb" element={<Suspense fallback={<PageLoader />}><AGB /></Suspense>} />
                  <Route path="/datenschutz" element={<Suspense fallback={<PageLoader />}><Datenschutz /></Suspense>} />
                  <Route path="/kontakt" element={<Suspense fallback={<PageLoader />}><Kontakt /></Suspense>} />
                  <Route path="/payment/success" element={<Suspense fallback={<PageLoader />}><PaymentSuccess /></Suspense>} />
                  <Route path="/account" element={<Suspense fallback={<PageLoader />}><BillingPage /></Suspense>} />
                  <Route path="/billing" element={<Suspense fallback={<PageLoader />}><BillingPage /></Suspense>} />
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
            </div>
          </PostHogProvider>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
