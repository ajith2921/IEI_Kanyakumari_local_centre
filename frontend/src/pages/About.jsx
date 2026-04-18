import SectionHeader from "../components/SectionHeader";

const highlights = [
  {
    title: "Professional Development",
    detail: "We organize seminars, lectures, and upskilling sessions for engineers across disciplines.",
  },
  {
    title: "Student Engagement",
    detail: "Through chapter activities and mentoring programs, students gain practical and industry-ready perspectives.",
  },
  {
    title: "Knowledge Sharing",
    detail: "Newsletter publications and panel discussions enable continuous technical learning.",
  },
];

export default function About() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Who We Are"
        title="About IEI Kanyakumari Local Centre"
        description="A vibrant institutional platform dedicated to engineering excellence, networking, and professional contribution."
      />

      <div className="mb-10 max-w-3xl rounded-2xl border border-gray-100 bg-gray-50/60 p-7 text-sm leading-relaxed text-gray-500 md:p-9">
        <p className="mb-4">
          IEI Kanyakumari Local Centre serves as a hub for engineers, educators, and students,
          focusing on technical competence and community impact. Inspired by leading
          professional institutions, we create opportunities for growth through collaboration,
          events, and thought leadership.
        </p>
        <p>
          Our programs bridge academia and industry, enabling members to stay relevant in
          evolving technologies while upholding ethical and professional standards.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
          >
            <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
