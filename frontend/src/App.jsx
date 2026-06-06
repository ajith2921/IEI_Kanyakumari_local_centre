import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AdminRoute from "./admin/AdminRoute";

// Public pages — lazy loaded to reduce initial bundle size
// Home is loaded eagerly for better landing page performance
const MembersList = lazy(() => import("./pages/MembersList"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const Facilities = lazy(() => import("./pages/Facilities"));
const TechnicalActivities = lazy(() => import("./pages/TechnicalActivities"));
const ConferencePage = lazy(() => import("./pages/ConferencePage"));
const LinksDownloads = lazy(() => import("./pages/LinksDownloads"));
const Contact = lazy(() => import("./pages/Contact"));

// Admin pages — lazy loaded so they are excluded from the public bundle
const AdminLogin    = lazy(() => import("./admin/AdminLogin"));
const AdminLayout   = lazy(() => import("./admin/AdminLayout"));
const DashboardHome = lazy(() => import("./admin/DashboardHome"));
const AdminMembers  = lazy(() => import("./admin/AdminMembers"));
const AdminGallery  = lazy(() => import("./admin/AdminGallery"));
const AdminNewsletters = lazy(() => import("./admin/AdminNewsletters"));
const AdminActivities  = lazy(() => import("./admin/AdminActivities"));
const AdminFacilities  = lazy(() => import("./admin/AdminFacilities"));
const AdminDownloads   = lazy(() => import("./admin/AdminDownloads"));
const AdminMessages    = lazy(() => import("./admin/AdminMessages"));
const AdminConference  = lazy(() => import("./admin/AdminConference"));
const AdminUsers       = lazy(() => import("./admin/AdminUsers"));
const AuditLogs        = lazy(() => import("./admin/AuditLogs"));
const LoginHistory     = lazy(() => import("./admin/LoginHistory"));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading admin panel…</p>
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading page…</p>
      </div>
    </div>
  );
}

const MEMBERSHIP_PORTAL_URL = "https://www.ieindia.org/web/home";

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.assign(to);
  }, [to]);

  return null;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      {/* Conference pages — /conferences is the canonical route */}
      <Route
        path="/conferences"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <ConferencePage />
            </Suspense>
          </PublicLayout>
        }
      />
      {/* Legacy paths redirect to canonical /conferences */}
      <Route path="/conference" element={<Navigate to="/conferences" replace />} />
      <Route path="/conference-overview" element={<Navigate to="/conferences" replace />} />
      {/* Redirect old /about links to the home page */}
      <Route path="/about" element={<Navigate to="/" replace />} />
      <Route
        path="/members"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <MembersList />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <GalleryPage />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/newsletter"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <Newsletter />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/facilities"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <Facilities />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/technical-activities"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <TechnicalActivities />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/links-downloads"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <LinksDownloads />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Suspense fallback={<PageFallback />}>
              <Contact />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route path="/membership" element={<ExternalRedirect to={MEMBERSHIP_PORTAL_URL} />} />
      <Route path="/membership/*" element={<ExternalRedirect to={MEMBERSHIP_PORTAL_URL} />} />

      <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="newsletters" element={<AdminNewsletters />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="conference" element={<AdminConference />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="downloads" element={<AdminDownloads />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="login-history" element={<LoginHistory />} />
      </Route>

      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
  );
}
