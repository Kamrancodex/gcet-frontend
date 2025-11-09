import React from "react";
import {
  GraduationCap,
  Clock,
  Users,
  BookOpen,
  Award,
  ChevronRight,
} from "lucide-react";

interface Program {
  id: string;
  name: string;
  abbreviation: string;
  duration: string;
  eligibility: string;
  seats: number;
  description: string;
  highlights: string[];
}

const programs: Program[] = [
  {
    id: "1",
    name: "Bachelor of Technology in Computer Science and Engineering",
    abbreviation: "B.Tech CSE",
    duration: "4 Years",
    eligibility: "10+2 with Physics, Chemistry, Mathematics",
    seats: 60,
    description:
      "The Computer Science and Engineering program provides a strong foundation in computer science theory, software development, algorithms, and emerging technologies. Students gain hands-on experience in programming, web development, artificial intelligence, and data science.",
    highlights: [
      "Modern Computer Labs",
      "Industry Collaborations",
      "Internship Opportunities",
      "Coding Competitions",
      "Research Projects",
    ],
  },
  {
    id: "2",
    name: "Bachelor of Technology in Electrical Engineering",
    abbreviation: "B.Tech EE",
    duration: "4 Years",
    eligibility: "10+2 with Physics, Chemistry, Mathematics",
    seats: 60,
    description:
      "The Electrical Engineering program covers power systems, electronics, control systems, and renewable energy. Students learn to design, develop, and maintain electrical systems and equipment used in homes, industries, and power generation.",
    highlights: [
      "Power Systems Lab",
      "Control Systems Lab",
      "Renewable Energy Projects",
      "Industrial Training",
      "Smart Grid Technologies",
    ],
  },
  {
    id: "3",
    name: "Bachelor of Technology in Mechanical Engineering",
    abbreviation: "B.Tech ME",
    duration: "4 Years",
    eligibility: "10+2 with Physics, Chemistry, Mathematics",
    seats: 60,
    description:
      "The Mechanical Engineering program focuses on design, manufacturing, thermal systems, and materials. Students learn CAD/CAM, robotics, thermodynamics, and manufacturing processes to become versatile engineers.",
    highlights: [
      "Workshop & Manufacturing Lab",
      "CAD/CAM Software Training",
      "Robotics & Automation",
      "Industrial Visits",
      "Project Based Learning",
    ],
  },
  {
    id: "4",
    name: "Bachelor of Technology in Civil Engineering",
    abbreviation: "B.Tech CE",
    duration: "4 Years",
    eligibility: "10+2 with Physics, Chemistry, Mathematics",
    seats: 60,
    description:
      "The Civil Engineering program trains students in structural engineering, construction management, transportation, and environmental engineering. Students work on real-world projects in building design, infrastructure planning, and sustainable construction.",
    highlights: [
      "Structural Analysis Lab",
      "Surveying Equipment",
      "Building Information Modeling (BIM)",
      "Site Visits & Field Work",
      "Sustainable Construction Practices",
    ],
  },
];

const Programs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Programs
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Government College of Engineering and Technology, Safapora offers
              world-class undergraduate programs in engineering disciplines
            </p>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              <div className="p-6 md:p-8">
                {/* Program Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {program.name}
                      </h2>
                      <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {program.abbreviation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Program Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {program.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Seats Available</p>
                      <p className="font-semibold text-gray-900">
                        {program.seats}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Eligibility</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        10+2 with PCM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  {program.description}
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Program Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {program.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Programs;

