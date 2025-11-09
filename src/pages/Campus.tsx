import React from "react";
import {
  Building2,
  MapPin,
  Wifi,
  Utensils,
  BookOpen,
  Dumbbell,
  Bus,
  GraduationCap,
  FlaskConical,
  Computer,
  Home,
  TreePine,
  Trophy,
  Heart,
} from "lucide-react";

interface Facility {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface Block {
  id: string;
  name: string;
  description: string;
  features: string[];
}

const facilities: Facility[] = [
  {
    id: "1",
    name: "Modern Laboratories",
    description:
      "State-of-the-art labs equipped with latest tools and equipment for all engineering disciplines",
    icon: FlaskConical,
  },
  {
    id: "2",
    name: "Central Library",
    description:
      "Extensive collection of 50,000+ books, journals, and digital resources with 24/7 access",
    icon: BookOpen,
  },
  {
    id: "3",
    name: "Computer Center",
    description:
      "200+ high-performance computers with latest software and high-speed internet connectivity",
    icon: Computer,
  },
  {
    id: "4",
    name: "Sports Complex",
    description:
      "Indoor and outdoor sports facilities including cricket, football, basketball, and badminton",
    icon: Dumbbell,
  },
  {
    id: "5",
    name: "Cafeteria",
    description:
      "Spacious dining hall serving nutritious meals with variety of cuisines in hygienic environment",
    icon: Utensils,
  },
  {
    id: "6",
    name: "Hostels",
    description:
      "Separate hostel facilities for boys and girls with comfortable rooms and modern amenities",
    icon: Home,
  },
  {
    id: "7",
    name: "Wi-Fi Campus",
    description:
      "100% Wi-Fi enabled campus with high-speed internet access in all academic and residential areas",
    icon: Wifi,
  },
  {
    id: "8",
    name: "Transportation",
    description:
      "College bus services connecting major areas of the city with safe and convenient travel",
    icon: Bus,
  },
  {
    id: "9",
    name: "Auditorium",
    description:
      "Modern auditorium with 500+ seating capacity for seminars, cultural events, and conferences",
    icon: Trophy,
  },
  {
    id: "10",
    name: "Medical Facility",
    description:
      "On-campus medical center with qualified doctor and first-aid facilities for emergencies",
    icon: Heart,
  },
];

const blocks: Block[] = [
  {
    id: "1",
    name: "A Block - Administrative Block",
    description:
      "Houses the Principal's office, administrative offices, admissions office, and examination cell",
    features: [
      "Principal's Office",
      "Admissions Office",
      "Examination Cell",
      "Accounts Department",
      "HR Department",
    ],
  },
  {
    id: "2",
    name: "B Block - Computer Science & IT",
    description:
      "Dedicated block for Computer Science and IT department with modern computer labs and classrooms",
    features: [
      "6 Computer Labs",
      "Smart Classrooms",
      "Faculty Rooms",
      "Project Lab",
      "Server Room",
    ],
  },
  {
    id: "3",
    name: "C Block - Electrical & Electronics",
    description:
      "Houses Electrical and Electronics department with specialized labs and equipment",
    features: [
      "Power Systems Lab",
      "Control Systems Lab",
      "Electronics Lab",
      "Measurement Lab",
      "Project Lab",
    ],
  },
  {
    id: "4",
    name: "D Block - Mechanical Engineering",
    description:
      "Complete mechanical engineering department with workshops and manufacturing labs",
    features: [
      "CAD/CAM Lab",
      "Manufacturing Workshop",
      "Thermodynamics Lab",
      "Mechanics Lab",
      "Project Workshop",
    ],
  },
  {
    id: "5",
    name: "E Block - Civil Engineering",
    description:
      "Civil engineering department with surveying equipment and structural analysis facilities",
    features: [
      "Structural Lab",
      "Surveying Lab",
      "Soil Mechanics Lab",
      "Concrete Lab",
      "Drawing Hall",
    ],
  },
  {
    id: "6",
    name: "Central Library Block",
    description:
      "Three-story library building with reading halls, digital library, and research sections",
    features: [
      "Reading Halls",
      "Digital Library",
      "Reference Section",
      "Periodicals Section",
      "Research Section",
    ],
  },
];

const Campus: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Campus</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              A world-class infrastructure spread across 50 acres providing an
              ideal environment for learning and innovation
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-100">
              <MapPin className="w-5 h-5" />
              <span>Safapora, Ganderbal District, Jammu & Kashmir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600 text-sm">Acres Campus</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
            <div className="text-gray-600 text-sm">Academic Blocks</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600 text-sm">Laboratories</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-gray-600 text-sm">Wi-Fi Coverage</div>
          </div>
        </div>
      </div>

      {/* Campus Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Campus Blocks
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our campus is organized into specialized blocks, each designed to
            support different academic and administrative functions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <div className="flex items-center gap-3 text-white">
                  <Building2 className="w-8 h-8" />
                  <h3 className="text-xl font-bold">{block.name}</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">{block.description}</p>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {block.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Campus Facilities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              State-of-the-art facilities designed to enhance learning
              experience and overall development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => {
              const Icon = facility.icon;
              return (
                <div
                  key={facility.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
                >
                  <div className="bg-blue-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {facility.name}
                  </h3>
                  <p className="text-gray-700">{facility.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Green Campus Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <TreePine className="w-24 h-24" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">Green Campus Initiative</h3>
              <p className="text-green-50 mb-6 text-lg">
                GCET is committed to environmental sustainability. Our campus
                features extensive greenery, rainwater harvesting systems, solar
                panels, and waste management facilities. We maintain over 2000
                trees and plants across the campus, providing a serene and
                eco-friendly learning environment.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">2000+</div>
                  <div className="text-green-50 text-sm">Trees & Plants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100kW</div>
                  <div className="text-green-50 text-sm">Solar Power</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">60%</div>
                  <div className="text-green-50 text-sm">Green Cover</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-green-50 text-sm">Waste Managed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <MapPin className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Visit Our Campus</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Government College of Engineering and Technology, Safapora
            <br />
            Ganderbal District, Jammu & Kashmir - 191201
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <MapPin className="w-5 h-5" />
              View on Map
            </a>
            <a
              href="#apply"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campus;








