import { Link } from "react-router-dom";

export default function JoinIEIBand() {
  return (
    <section className="iei-join-band py-16 text-center text-white">
      <div className="page-shell">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Become a Member of IEI Kanyakumari Local Centre
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Join India&apos;s oldest and most prestigious engineering institution. Gain access to professional
          certification, technical events, CPD programs, research grants, and a network of
          accomplished engineers across the country.
        </p>
        <div className="mt-8">
          <Link
            to="/membership"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#f4c430] px-8 py-3 text-base font-semibold text-[#1c2647] transition-all hover:bg-[#e5b42c] hover:shadow-lg"
          >
            Apply for Membership
          </Link>
        </div>
      </div>
    </section>
  );
}