import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-4">

        {/* Brand */}
        <div>
          <h3 className="mb-1 text-base font-bold text-gray-900">
            The Institution of Engineers (India)
          </h3>
          <p className="mb-1 text-sm font-semibold text-blue-800">
            Kanyakumari Local Centre (KKLC)
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Building Engineers for a Better Tomorrow.<br />
            Engineering Excellence · Innovation · Ethics · Nation Building
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Quick Links
          </h4>
          <div className="grid gap-2 text-sm text-gray-600">
            <Link to="/" className="transition hover:text-gray-900">Home</Link>
            <Link to="/conference" className="transition hover:text-gray-900">Conference</Link>
            <Link to="/technical-activities" className="transition hover:text-gray-900">Events</Link>
            <Link to="/members" className="transition hover:text-gray-900">Committee</Link>
            <Link to="/gallery" className="transition hover:text-gray-900">Gallery</Link>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Services
          </h4>
          <div className="grid gap-2 text-sm text-gray-600">
            <Link to="/membership-form" className="transition hover:text-gray-900">Membership Application</Link>
            <Link to="/newsletter" className="transition hover:text-gray-900">Newsletter</Link>
            <Link to="/links-downloads" className="transition hover:text-gray-900">Downloads</Link>
            <Link to="/facilities" className="transition hover:text-gray-900">Facilities</Link>
            <Link to="/contact" className="transition hover:text-gray-900">Contact</Link>
          </div>
        </div>

        {/* Office */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Office
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Nagercoil, Kanyakumari District,</p>
            <p>Tamil Nadu, India</p>
            <p>
              <a href="mailto:ieikanyakumarilc@gmail.com" className="transition hover:text-gray-900 underline">
                ieikanyakumarilc@gmail.com
              </a>
            </p>
            <p>
              <a href="tel:+919443993659" className="transition hover:text-gray-900">
                +91-9443993659
              </a>
            </p>
            <p className="text-xs text-gray-400 pt-1">
              Mon–Sat: 10:00 AM – 5:30 PM
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} The Institution of Engineers (India) – Kanyakumari Local Centre.
        All rights reserved.
      </div>
    </footer>
  );
}
