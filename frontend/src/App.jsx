import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Conference from "./pages/Conference";
import MembersList from "./pages/MembersList";
import MemberDetails from "./pages/MemberDetails";
import GalleryPage from "./pages/GalleryPage";
import Newsletter from "./pages/Newsletter";
import Facilities from "./pages/Facilities";
import TechnicalActivities from "./pages/TechnicalActivities";
import LinksDownloads from "./pages/LinksDownloads";
import Contact from "./pages/Contact";
import MembershipForm from "./pages/MembershipForm";
import NotFound from "./pages/NotFound";
import AdminRoute from "./admin/AdminRoute";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import DashboardHome from "./admin/DashboardHome";
import AdminMembers from "./admin/AdminMembers";
import AdminGallery from "./admin/AdminGallery";
import AdminNewsletters from "./admin/AdminNewsletters";
import AdminActivities from "./admin/AdminActivities";
import AdminFacilities from "./admin/AdminFacilities";
import AdminDownloads from "./admin/AdminDownloads";
import AdminMessages from "./admin/AdminMessages";
import AdminMembershipRequests from "./admin/AdminMembershipRequests";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
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
        path="/members/:id"
        element={
          <PublicLayout>
            <MemberDetails />
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
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />
      <Route
        path="/membership-form"
        element={
          <PublicLayout>
            <MembershipForm />
          </PublicLayout>
        }
      />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="newsletters" element={<AdminNewsletters />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="downloads" element={<AdminDownloads />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="memberships" element={<AdminMembershipRequests />} />
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
