import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="page-shell grid gap-10 py-16 md:grid-cols-4">

        {/* Brand */}
        <div>
          <p className="text-sm font-semibold tracking-tight text-gray-900">
            The Institution of Engineers (India)
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Kanyakumari Local Centre
          </p>
          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            Building Engineers for a Better Tomorrow.<br />
            Engineering Excellence · Innovation · Ethics
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="eyebrow-chip mb-5">Quick Links</p>
          <div className="grid gap-3 text-sm text-gray-400">
            <Link to="/" className="transition-colors duration-200 hover:text-gray-900">Home</Link>
            <Link to="/conference" className="transition-colors duration-200 hover:text-gray-900">Conference</Link>
            <Link to="/technical-activities" className="transition-colors duration-200 hover:text-gray-900">Events</Link>
            <Link to="/members" className="transition-colors duration-200 hover:text-gray-900">Committee</Link>
            <Link to="/gallery" className="transition-colors duration-200 hover:text-gray-900">Gallery</Link>
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="eyebrow-chip mb-5">Services</p>
          <div className="grid gap-3 text-sm text-gray-400">
            <Link to="/membership-form" className="transition-colors duration-200 hover:text-gray-900">Membership</Link>
            <Link to="/newsletter" className="transition-colors duration-200 hover:text-gray-900">Newsletter</Link>
            <Link to="/links-downloads" className="transition-colors duration-200 hover:text-gray-900">Downloads</Link>
            <Link to="/facilities" className="transition-colors duration-200 hover:text-gray-900">Facilities</Link>
            <Link to="/contact" className="transition-colors duration-200 hover:text-gray-900">Contact</Link>
          </div>
        </div>

        {/* Office */}
        <div>
          <p className="eyebrow-chip mb-5">Office</p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Nagercoil, Kanyakumari District,</p>
            <p>Tamil Nadu, India</p>
            <a
              href="mailto:ieikanyakumarilc@gmail.com"
              className="block transition-colors duration-200 hover:text-gray-900"
            >
              ieikanyakumarilc@gmail.com
            </a>
            <a href="tel:+919443993659" className="block transition-colors duration-200 hover:text-gray-900">
              +91-9443993659
            </a>
            <p className="pt-1 text-xs text-gray-300">Mon–Sat: 10:00 AM – 5:30 PM</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 py-5 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} The Institution of Engineers (India) – Kanyakumari Local Centre.
        All rights reserved.
      </div>
    </footer>
  );
}
