import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Marketing Pages
import LandingPage from "./pages/marketing/LandingPage";
import FeaturesPage from "./pages/marketing/FeaturesPage";
import PricingPage from "./pages/marketing/PricingPage";
import AboutPage from "./pages/marketing/AboutPage";
import ContactPage from "./pages/marketing/ContactPage";
import ComparePage from "./pages/marketing/ComparePage";
import WaterDamageRestorationSoftwarePage from "./pages/marketing/WaterDamageRestorationSoftwarePage";
import MoistureTrackingSoftwarePage from "./pages/marketing/MoistureTrackingSoftwarePage";
import EncircleAlternativePage from "./pages/marketing/EncircleAlternativePage";
import RestorationReportingSoftwarePage from "./pages/marketing/RestorationReportingSoftwarePage";

// App Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobCreate from "./pages/JobCreate";
import JobDetail from "./pages/JobDetail";
import Readings from "./pages/Readings";
import Equipment from "./pages/Equipment";
import Photos from "./pages/Photos";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminTenantDetail from "./pages/admin/AdminTenantDetail";
import AdminTiers from "./pages/admin/AdminTiers";
import AdminSettings from "./pages/admin/AdminSettings";
import ShareJob from "./pages/ShareJob";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Jobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <JobCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/readings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Readings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Equipment />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/photos"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Photos />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Tenant admin routes */}
            <Route
              path="/team"
              element={
                <ProtectedRoute requiredRoles={['tenant_admin', 'super_admin']}>
                  <AppLayout>
                    <Team />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute requiredRoles={['tenant_admin', 'super_admin']}>
                  <AppLayout>
                    <Billing />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Super admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminTenants />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants/:tenantId"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminTenantDetail />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tiers"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminTiers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
