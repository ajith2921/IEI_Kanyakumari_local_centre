import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t-4 border-[#f4c430] bg-[#1c2647] text-white">
      <div className="page-shell grid gap-10 py-16 md:grid-cols-3">
        {/* Column 1: Brand + Address */}
        <div>
          <img
            src="https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png"
            alt="Institution of Engineers (India) logo"
            className="h-16 w-16 rounded-full border-2 border-[#f4c430]/30 bg-white p-1"
          />
          <h3 className="mt-4 text-lg font-semibold">
            The Institution of Engineers (India)
          </h3>
          <p className="mt-1 text-sm text-white/70">Kanyakumari Local Centre</p>
          <div className="mt-4 space-y-2 text-sm text-white/60">
            <p>Nagercoil, Kanyakumari District,</p>
            <p>Tamil Nadu, India</p>
            <a
              href="mailto:ieikanyakumarilc@gmail.com"
              className="block transition-colors duration-200 hover:text-[#f4c430]"
            >
              ieikanyakumarilc@gmail.com
            </a>
            <a href="tel:+919443993659" className="block transition-colors duration-200 hover:text-[#f4c430]">
              +91-9443993659
            </a>
            <p className="pt-2 text-xs text-white/40">Mon–Sat: 10:00 AM – 5:30 PM</p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/50">
            Quick Links
          </h4>
          <div className="grid gap-3 text-sm">
            <Link to="/membership" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-[#f4c430]">Membership</Link>
            <Link to="/membership#chartered-engineer" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-[#f4c430]">Chartered Engineer</Link>
            <Link to="/membership#professional-engineer" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-[#f4c430]">Professional Engineer</Link>
            <Link to="/membership#section-ab" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-[#f4c430]">Section A & B</Link>
            <Link to="/technical-activities" className="transition-colors duration-200 hover:text-[#f4c430]">Events</Link>
            <Link to="/newsletter" className="transition-colors duration-200 hover:text-[#f4c430]">Newsletter</Link>
            <Link to="/contact" className="transition-colors duration-200 hover:text-[#f4c430]">Contact</Link>
          </div>
        </div>

        {/* Column 3: Social */}
        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/50">
            Follow IEI KKLC
          </h4>
          <div className="flex gap-4">
            {[
              { label: "X", href: "https://x.com" },
              { label: "Facebook", href: "https://facebook.com" },
              { label: "YouTube", href: "https://youtube.com" },
              { label: "LinkedIn", href: "https://linkedin.com" },
              { label: "Instagram", href: "https://instagram.com" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xs font-medium transition-colors duration-200 hover:border-[#f4c430] hover:text-[#f4c430]"
              >
                {social.label.charAt(0)}
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/40">
            Stay connected for updates on technical activities, membership, and institutional announcements.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#151d38] py-4">
        <div className="page-shell flex flex-col items-center justify-between gap-2 text-xs text-white/40 sm:flex-row">
          <p>© 2025 IEI Kanyakumari Local Centre. All rights reserved.</p>
          <p>Developed by IEI KKLC Chapter</p>
        </div>
      </div>
    </footer>
  );
}