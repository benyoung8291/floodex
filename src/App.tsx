import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { lazy, Suspense } from "react";

// Marketing Pages (eager: SEO + landing performance)
import LandingPage from "./pages/marketing/LandingPage";
const FeaturesPage = lazy(() => import("./pages/marketing/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/marketing/PricingPage"));
const AboutPage = lazy(() => import("./pages/marketing/AboutPage"));
const ContactPage = lazy(() => import("./pages/marketing/ContactPage"));
const ComparePage = lazy(() => import("./pages/marketing/ComparePage"));
const WaterDamageRestorationSoftwarePage = lazy(() => import("./pages/marketing/WaterDamageRestorationSoftwarePage"));
const MoistureTrackingSoftwarePage = lazy(() => import("./pages/marketing/MoistureTrackingSoftwarePage"));
const EncircleAlternativePage = lazy(() => import("./pages/marketing/EncircleAlternativePage"));
const RestorationReportingSoftwarePage = lazy(() => import("./pages/marketing/RestorationReportingSoftwarePage"));

// App pages (lazy)
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobCreate = lazy(() => import("./pages/JobCreate"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Readings = lazy(() => import("./pages/Readings"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Photos = lazy(() => import("./pages/Photos"));
const Reports = lazy(() => import("./pages/Reports"));
const Team = lazy(() => import("./pages/Team"));
const Billing = lazy(() => import("./pages/Billing"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTenants = lazy(() => import("./pages/admin/AdminTenants"));
const AdminTenantDetail = lazy(() => import("./pages/admin/AdminTenantDetail"));
const AdminTiers = lazy(() => import("./pages/admin/AdminTiers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const ShareJob = lazy(() => import("./pages/ShareJob"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-dvh flex items-center justify-center text-sm text-muted-foreground">
    Loading…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Marketing routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/water-damage-restoration-software" element={<WaterDamageRestorationSoftwarePage />} />
              <Route path="/moisture-tracking-software" element={<MoistureTrackingSoftwarePage />} />
              <Route path="/encircle-alternative" element={<EncircleAlternativePage />} />
              <Route path="/restoration-reporting-software" element={<RestorationReportingSoftwarePage />} />

              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/share/:token" element={<ShareJob />} />

              {/* Protected routes with layout */}
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><AppLayout><Jobs /></AppLayout></ProtectedRoute>} />
              <Route path="/jobs/new" element={<ProtectedRoute><JobCreate /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><AppLayout><JobDetail /></AppLayout></ProtectedRoute>} />
              <Route path="/readings" element={<ProtectedRoute><AppLayout><Readings /></AppLayout></ProtectedRoute>} />
              <Route path="/equipment" element={<ProtectedRoute><AppLayout><Equipment /></AppLayout></ProtectedRoute>} />
              <Route path="/photos" element={<ProtectedRoute><AppLayout><Photos /></AppLayout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />

              {/* Tenant admin routes */}
              <Route path="/team" element={<ProtectedRoute requiredRoles={['tenant_admin', 'super_admin']}><AppLayout><Team /></AppLayout></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute requiredRoles={['tenant_admin', 'super_admin']}><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

              {/* Super admin routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/tenants" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminTenants /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/tenants/:tenantId" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminTenantDetail /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/tiers" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminTiers /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
