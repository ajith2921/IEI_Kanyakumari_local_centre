import { useEffect, useState } from "react";
import ConferenceNotification from "../components/conference/ConferenceNotification";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

const focusAreas = [
  "Technical Seminars & Conferences",
  "Workshops & Faculty Development Programmes",
  "Industrial Visits",
  "Student Chapter Activities",
  "Career Guidance Programmes",
  "Entrepreneurship & Innovation Support",
  "Research Promotion",
  "Community Engineering Solutions",
];

const chairmanMessage =
  '"Engineering is not just a profession — it is the foundation of progress. Our centre is dedicated to empowering engineers, motivating students, strengthening institutions, and serving society through innovative ideas and technical excellence. We invite all engineers, professionals, industries, and students to actively engage with KKLC and become part of a meaningful professional network."';

export default function Home() {
  const [chairmanImage, setChairmanImage] = useState("");
  const [imageError, setImageError] = useState(false);
  const cleanChairmanMessage = chairmanMessage.replace(/\s+/g, " ").trim();

  useEffect(() => {
    const fetchChairmanImage = async () => {
      try {
        const response = await publicApi.getMembers();
        const members = response.data || [];
        console.log("✓ Members fetched:", members.length);
        
        const chairman = members.find(m => m.position?.includes("Chairman"));
        console.log("✓ Chairman found:", chairman?.name);
        console.log("✓ Chairman image_url:", chairman?.image_url);
        
        if (chairman && chairman.image_url) {
          const processedUrl = toAbsoluteUploadUrl(chairman.image_url);
          console.log("✓ Processed URL:", processedUrl);
          setChairmanImage(processedUrl);
        } else {
          console.warn("✗ Chairman or image_url not found");
          setImageError(true);
        }
      } catch (error) {
        console.error("✗ Error fetching chairman image:", error);
        setImageError(true);
      }
    };

    fetchChairmanImage();
  }, []);

  return (
    <>
      {/* ── Full-screen hero image + floating conference notification ── */}
      <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <img
          src="/home-bg.jpg"
          alt="IEI Kanyakumari Local Centre Event"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        {/* Desktop + Tablet: floating absolutely over the hero */}
        <div className="hidden sm:block">
          <ConferenceNotification />
        </div>
      </div>

      {/* Mobile: stacked below hero in normal flow */}
      <div className="block sm:hidden px-4 pt-5 pb-1 bg-white">
        <ConferenceNotification />
      </div>

      <section className="bg-white">
        <div className="page-shell home-rhythm-shell">
          <h2 className="home-premium-section-title mb-5">About IEI Kolkata</h2>
          <p className="home-premium-lead mb-4 max-w-none">
            The Institution of Engineers (India) [IEI] is a statutory body to promote and advance
            engineering and technology, established in 1920 and incorporated by Royal Charter in 1935.
            It is the largest multi-disciplinary professional body of engineers encompassing 15
            engineering disciplines with a corporate membership of over 2 lakhs, and serving the nation
            for more than 10 decades. The IEI has its headquarters located in Kolkata with national
            presence through more than hundred Centres and several Overseas Chapters, Foras and Organ.
          </p>
          <p className="home-premium-copy mb-4 max-w-none">
            The Institution was granted Royal Charter on September 9, 1935 by His Majesty the King and
            Emperor George V, which was a momentous event in the annals of engineering industry and
            education in India. The Royal Charter endowed the Institution with the responsibility to
            promote the general advancement of engineering amongst members and persons attached to the
            Institution. IEI has been recognized as a Scientific and Industrial Research Organization by
            the Ministry of Science &amp; Technology, Government of India and, besides conducting its own
            research, provides grant-in-aid to UG/PG/PhD students of engineering institutes and
            universities.
          </p>
          <p className="home-premium-copy mb-4 max-w-none">
            The Institution of Engineers (India) is the first professional body to represent India in
            several international bodies, such as the World Mining Congress (WMC), the World Federation
            of Engineering Organizations (WFEO), the Commonwealth Engineers' Council (CEC), the
            Federation International du Beton (fib), and the Federation of Engineering Institutions of
            South and Central Asia (FEISCA). It also has bilateral agreements with a number of
            professional societies across the globe. IEI holds the International Professional Engineers
            (Int PE) Register for India under the global International Professional Engineers Alliance
            (Int PEA). The Institution also awards the Professional Engineers (PE) Certification.
          </p>
          <p className="home-premium-copy mb-4 max-w-none">
            The Institution of Engineers (India) is a pioneer body to introduce, starting from 1928,
            continuing engineering education programme, successful completion of which is recognized as
            equivalent to a degree in engineering by the Government of India, the Union Public Service
            Commission, the State Governments and many public and private sector organizations in the
            country. The Institution of Engineers (India), with its headquarters in Kolkata, India, is
            administered by a National Council with the President of IEI as its Head.
          </p>
          <p className="home-premium-copy mb-4 max-w-none">
            Ever since its inception, IEI has been the forerunner in setting up national standards for
            promoting the country&apos;s industrial base which culminated in the formation of the Indian
            Standard Institution (ISI), now called the Bureau of Indian Standards (BIS). IEI, in
            collaboration with Springer, regularly publishes peer-reviewed international journals in five
            series, covering fifteen engineering disciplines.
          </p>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 shadow-sm sm:mt-10 sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-400">
              For further details
            </p>
            <a
              href="https://www.ieindia.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-between gap-4 rounded-full border border-gray-200 bg-[#05154B] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a1f66] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#05154B]/30 sm:px-6"
            >
              <span>Visit IEI Official Website</span>
              <span aria-hidden="true" className="text-base leading-none">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gray-50/60">
        <div className="page-shell home-rhythm-shell">
          <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
            <div className="max-w-2xl">
              <h2 className="home-premium-section-title mb-3">Welcome</h2>
              <p className="home-premium-display mb-5 max-w-[24ch]">
                The Institution of Engineers (India) —{" "}
                <span className="text-[color:var(--home-premium-accent)]">Kanyakumari Local Centre</span>
              </p>
              <p className="home-premium-lead mb-3 max-w-[62ch]">
                IEI KKLC is a dynamic professional body committed to advancing engineering excellence, innovation, technical leadership, and societal development. We serve engineers, academicians, and students across Kanyakumari District and surrounding regions.
              </p>
              <p className="home-premium-copy mb-6 max-w-[62ch] sm:mb-7">
                We strive to build a strong engineering ecosystem through knowledge sharing,
                professional networking, industry collaboration, and community service.
              </p>
            </div>

            <div className="home-premium-card home-premium-glass animate-fade-up stagger-2 rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm sm:p-7">
              <h3 className="home-premium-subtitle mb-4">Our Focus Areas</h3>
              <ul className="grid gap-2.5 sm:gap-3">
                {focusAreas.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="page-shell home-rhythm-shell">
          <h2 className="home-premium-section-title mb-8">Chairman&apos;s Message</h2>
          <div className="home-premium-card animate-fade-up stagger-2 rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-gray-50 p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center md:gap-0">
              {/* Message */}
              <div className="order-2 md:order-1 pr-0">
                {/* Decorative quote mark */}
                <div className="mb-4 flex items-start gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                </div>
                
                <blockquote className="home-premium-quote mb-6 mr-auto max-w-none text-justify sm:mb-7 leading-relaxed">
                  <span className="text-4xl font-light text-cyan-500 mr-2">&ldquo;</span>
                  {cleanChairmanMessage}
                  <span className="text-4xl font-light text-cyan-500 ml-1">&rdquo;</span>
                </blockquote>
                
                <div className="mt-7 text-left border-l-4 border-cyan-400 pl-5">
                  <p className="text-base font-bold text-gray-900">Dr. M. Marsaline Beno</p>
                  <p className="mt-1 text-sm text-gray-500 font-medium">Chairman, IEI Kanyakumari Local Centre</p>
                  <p className="mt-2 text-xs text-gray-400">2025–2027</p>
                </div>
              </div>

              {/* Chairman Image */}
              <div className="order-1 md:order-2 flex justify-center">
                {chairmanImage && !imageError ? (
                  <div className="relative w-56 flex-shrink-0 group">
                    {/* Decorative background accent */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Image container */}
                    <div className="relative overflow-hidden rounded-3xl border-2 border-white shadow-xl ring-1 ring-gray-200">
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={chairmanImage}
                          alt="Dr. M. Marsaline Beno - Chairman"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={() => {
                            console.error("✗ Image failed to load:", chairmanImage);
                            setImageError(true);
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Floating nameplate */}
                    <div className="absolute -bottom-3 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
                      <p className="text-xs font-bold text-gray-900 truncate">Dr. M. Marsaline Beno</p>
                      <p className="text-[10px] text-cyan-600 font-semibold">Chairman</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-56 flex-shrink-0 aspect-square overflow-hidden rounded-3xl border-2 border-white shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500">Loading image...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="page-shell home-rhythm-shell">
          <h2 className="home-premium-section-title mb-5">About IEI Kanyakumari Local Centre</h2>
          <p className="home-premium-lead mb-6 max-w-none">
            The Institution of Engineers (India), Kanyakumari Local Centre (IEI KKLC), inaugurated in
            2015, has been actively promoting engineering excellence in the southernmost district of
            India and nearby regions. The centre serves as a dynamic platform connecting students,
            academicians, and industry professionals through technical lectures, workshops, seminars,
            industrial interactions, and outreach activities.
          </p>
          <p className="home-premium-copy max-w-none">
            IEI KKLC regularly organizes programmes on emerging technologies, innovation, research
            development, and professional development. It also conducts student competitions and various
            technical events to encourage engineering talent and practical learning.
          </p>
          <p className="home-premium-copy mt-4 max-w-none">
            Currently, the centre has 5 active student chapters, 1 institutional member, and a strong
            network of around 625 corporate (full) members. IEI KKLC continues to play a vital role in
            bridging the gap between academia and industry while nurturing competent, ethical, and
            globally competitive engineers.
          </p>
        </div>
      </section>
    </>
  );
}
