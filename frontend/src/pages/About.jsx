import SectionHeader from "../components/SectionHeader";
import Card from "../components/ui/Card";

const highlights = [
  {
    title: "Professional Development",
    detail:
      "We organize seminars, lectures, and upskilling sessions for engineers across disciplines.",
  },
  {
    title: "Student Engagement",
    detail:
      "Through chapter activities and mentoring programs, students gain practical and industry-ready perspectives.",
  },
  {
    title: "Knowledge Sharing",
    detail:
      "Newsletter publications and panel discussions enable continuous technical learning.",
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

      <Card className="mb-10 p-7 leading-relaxed text-gray-700 md:p-9">
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
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} interactive className="p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
