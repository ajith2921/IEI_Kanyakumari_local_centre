import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MembershipNavbar from "./components/membership/MembershipNavbar";
import MembershipFooter from "./components/membership/MembershipFooter";
import Home from "./pages/Home";
import Conference from "./pages/Conference";
import MembersList from "./pages/MembersList";
import GalleryPage from "./pages/GalleryPage";
import Newsletter from "./pages/Newsletter";
import Facilities from "./pages/Facilities";
import TechnicalActivities from "./pages/TechnicalActivities";
import LinksDownloads from "./pages/LinksDownloads";
import Contact from "./pages/Contact";
import MembershipForm from "./pages/MembershipForm";
import BecomeMemberPage from "./pages/membership/BecomeMemberPage";
import CertificationPage from "./pages/membership/CertificationPage";
import PublicationsPage from "./pages/membership/PublicationsPage";
import EventsCpdPage from "./pages/membership/EventsCpdPage";
import MemberServicesPage from "./pages/membership/MemberServicesPage";
import MembershipBenefitsPage from "./pages/membership/MembershipBenefitsPage";
import MembershipGradesPage from "./pages/membership/MembershipGradesPage";
import MembershipInfoPage from "./pages/membership/MembershipInfoPage";
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
import AdminPremiumSubscriptions from "./admin/AdminPremiumSubscriptions";

function LegacyMembershipRedirect() {
  const location = useLocation();

  return <Navigate to={{ pathname: "/membership", hash: location.hash }} replace />;
}

function MembershipHomeRoute() {
  const location = useLocation();
  const normalizedHash = String(location.hash || "").toLowerCase();

  const hashRouteMap = {
    "#be-member": "/membership/become-member",
    "#apply-membership": "/membership/become-member",
    "#membership-info": "/membership/benefits",
    "#chartered-engineer": "/membership/certification#chartered-engineer",
    "#professional-engineer": "/membership/certification#professional-engineer",
    "#section-ab": "/membership/certification#section-ab",
    "#academics-certification": "/membership/certification",
    "#publications": "/membership/publications",
    "#network-activities": "/membership/events-cpd",
    "#student-chapters": "/membership/events-cpd#student-chapters",
    "#announcements": "/membership/events-cpd#announcements",
    "#auth-panel": "/membership/member-services#auth-panel",
    "#fees-subscriptions": "/membership/member-services#fees-subscriptions",
    "#faq": "/membership/member-services#faq",
  };

  if (normalizedHash && hashRouteMap[normalizedHash]) {
    return <Navigate to={hashRouteMap[normalizedHash]} replace />;
  }

  return <MembershipForm />;
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

function MembershipLayout({ children }) {
  return (
    <div className="membership-page min-h-screen bg-white text-gray-900">
      <MembershipNavbar />
      <main id="main-content">{children}</main>
      <MembershipFooter />
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
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />
      <Route
        path="/membership"
        element={
          <MembershipLayout>
            <MembershipHomeRoute />
          </MembershipLayout>
        }
      />
      <Route path="/membership-form" element={<LegacyMembershipRedirect />} />
      <Route path="/membership-form/*" element={<LegacyMembershipRedirect />} />
      <Route
        path="/membership/become-member"
        element={
          <MembershipLayout>
            <BecomeMemberPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/certification"
        element={
          <MembershipLayout>
            <CertificationPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/publications"
        element={
          <MembershipLayout>
            <PublicationsPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/events-cpd"
        element={
          <MembershipLayout>
            <EventsCpdPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/member-services"
        element={
          <MembershipLayout>
            <MemberServicesPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/benefits"
        element={
          <MembershipLayout>
            <MembershipBenefitsPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/grades"
        element={
          <MembershipLayout>
            <MembershipGradesPage />
          </MembershipLayout>
        }
      />
      <Route
        path="/membership/info"
        element={
          <MembershipLayout>
            <MembershipInfoPage />
          </MembershipLayout>
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
        <Route path="premium" element={<AdminPremiumSubscriptions />} />
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
