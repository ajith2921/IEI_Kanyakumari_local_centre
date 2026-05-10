import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Conference from "./pages/Conference";
import MembersList from "./pages/MembersList";
import GalleryPage from "./pages/GalleryPage";
import Newsletter from "./pages/Newsletter";
import Facilities from "./pages/Facilities";
import TechnicalActivities from "./pages/TechnicalActivities";
import ConferencePage from "./pages/ConferencePage";
import LinksDownloads from "./pages/LinksDownloads";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminRoute from "./admin/AdminRoute";

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
      <Route
        path="/conference"
        element={
          <PublicLayout>
            <Conference />
          </PublicLayout>
        }
      />
      {/* Redirect old /about links to /conference */}
      <Route path="/about" element={<Navigate to="/conference" replace />} />
      <Route
        path="/members"
        element={
          <PublicLayout>
            <MembersList />
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <GalleryPage />
          </PublicLayout>
        }
      />
      <Route
        path="/newsletter"
        element={
          <PublicLayout>
            <Newsletter />
          </PublicLayout>
        }
      />
      <Route
        path="/facilities"
        element={
          <PublicLayout>
            <Facilities />
          </PublicLayout>
        }
      />
      <Route
        path="/technical-activities"
        element={
          <PublicLayout>
            <TechnicalActivities />
          </PublicLayout>
        }
      />
      <Route
        path="/links-downloads"
        element={
          <PublicLayout>
            <LinksDownloads />
          </PublicLayout>
        }
      />
      <Route
        path="/conference"
        element={
          <PublicLayout>
            <ConferencePage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
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
