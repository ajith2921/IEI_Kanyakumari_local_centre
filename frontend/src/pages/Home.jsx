
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
  const cleanChairmanMessage = chairmanMessage.replace(/\s+/g, " ").trim();

  return (
    <>
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
          <div className="mx-auto max-w-3xl">
            <h2 className="home-premium-section-title mb-5">Chairman&apos;s Message</h2>
            <div className="home-premium-card animate-fade-up stagger-2 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8">
              <blockquote className="home-premium-quote mb-4 mr-auto max-w-[66ch] text-left italic sm:mb-5">
                {cleanChairmanMessage}
              </blockquote>
              <div className="mt-5 text-left">
                <p className="text-sm font-semibold text-gray-900">Dr. M. Marsaline Beno</p>
                <p className="mt-0.5 text-xs text-gray-400">Chairman, IEI Kanyakumari Local Centre</p>
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
