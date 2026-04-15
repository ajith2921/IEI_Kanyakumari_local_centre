import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-gradient-to-b from-white to-brand-50/40">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-2 text-lg font-black text-brand-700">IEI Kanyakumari Local Centre</h3>
          <p className="text-sm text-slate-600">
            Advancing engineering knowledge and fostering professional collaboration
            through educational and technical initiatives.
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-black uppercase text-brand-700">Explore</h4>
          <div className="grid gap-2 text-sm text-slate-600">
            <Link to="/about" className="transition hover:text-brand-700">
              About Us
            </Link>
            <Link to="/technical-activities" className="transition hover:text-brand-700">
              Events
            </Link>
            <Link to="/members" className="transition hover:text-brand-700">
              Members
            </Link>
            <Link to="/gallery" className="transition hover:text-brand-700">
              Gallery
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-black uppercase text-brand-700">Services</h4>
          <div className="grid gap-2 text-sm text-slate-600">
            <Link to="/links-downloads" className="transition hover:text-brand-700">
              Links & Downloads
            </Link>
            <Link to="/newsletter" className="transition hover:text-brand-700">
              Newsletter
            </Link>
            <Link to="/membership-form" className="transition hover:text-brand-700">
              Membership Application
            </Link>
            <Link to="/contact" className="transition hover:text-brand-700">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-black uppercase text-brand-700">Office</h4>
          <p className="text-sm text-slate-600">
            IEI Kanyakumari Local Centre,
            <br />
            Tamil Nadu, India
            <br />
            Email: info@iei-kanyakumari.org
          </p>
        </div>
      </div>
      <div className="border-t border-brand-100 py-4 text-center text-xs text-slate-500">
        Copyright {new Date().getFullYear()} IEI Kanyakumari Local Centre. All rights reserved.
      </div>
    </footer>
  );
}
