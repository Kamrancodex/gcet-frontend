import React, { useState } from "react";
import {
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Award,
  Building2,
} from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  specialization: string[];
  email: string;
  phone?: string;
  experience: string;
  image?: string;
}

const facultyMembers: FacultyMember[] = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    designation: "Professor & HOD",
    department: "Computer Science & Engineering",
    qualification: "Ph.D. in Computer Science",
    specialization: [
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science",
    ],
    email: "rajesh.kumar@gcet.ac.in",
    phone: "+91-1234567890",
    experience: "18 Years",
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    qualification: "Ph.D. in Software Engineering",
    specialization: [
      "Software Development",
      "Cloud Computing",
      "Web Technologies",
    ],
    email: "priya.sharma@gcet.ac.in",
    phone: "+91-1234567891",
    experience: "12 Years",
  },
  {
    id: "3",
    name: "Prof. Amit Verma",
    designation: "Assistant Professor",
    department: "Computer Science & Engineering",
    qualification: "M.Tech in Computer Science",
    specialization: [
      "Algorithms",
      "Database Management",
      "Operating Systems",
    ],
    email: "amit.verma@gcet.ac.in",
    phone: "+91-1234567892",
    experience: "8 Years",
  },
  {
    id: "4",
    name: "Dr. Sunita Reddy",
    designation: "Professor & HOD",
    department: "Electrical Engineering",
    qualification: "Ph.D. in Power Systems",
    specialization: ["Power Systems", "Renewable Energy", "Smart Grids"],
    email: "sunita.reddy@gcet.ac.in",
    phone: "+91-1234567893",
    experience: "20 Years",
  },
  {
    id: "5",
    name: "Dr. Vikram Singh",
    designation: "Associate Professor",
    department: "Electrical Engineering",
    qualification: "Ph.D. in Control Systems",
    specialization: [
      "Control Systems",
      "Robotics",
      "Industrial Automation",
    ],
    email: "vikram.singh@gcet.ac.in",
    phone: "+91-1234567894",
    experience: "15 Years",
  },
  {
    id: "6",
    name: "Prof. Neha Gupta",
    designation: "Assistant Professor",
    department: "Electrical Engineering",
    qualification: "M.Tech in Electrical Engineering",
    specialization: [
      "Electronics",
      "Digital Systems",
      "Microcontrollers",
    ],
    email: "neha.gupta@gcet.ac.in",
    phone: "+91-1234567895",
    experience: "7 Years",
  },
  {
    id: "7",
    name: "Dr. Anil Mehta",
    designation: "Professor & HOD",
    department: "Mechanical Engineering",
    qualification: "Ph.D. in Thermal Engineering",
    specialization: [
      "Thermal Engineering",
      "Heat Transfer",
      "IC Engines",
    ],
    email: "anil.mehta@gcet.ac.in",
    phone: "+91-1234567896",
    experience: "22 Years",
  },
  {
    id: "8",
    name: "Dr. Kavita Joshi",
    designation: "Associate Professor",
    department: "Mechanical Engineering",
    qualification: "Ph.D. in Manufacturing",
    specialization: ["CAD/CAM", "Manufacturing", "Industrial Engineering"],
    email: "kavita.joshi@gcet.ac.in",
    phone: "+91-1234567897",
    experience: "14 Years",
  },
  {
    id: "9",
    name: "Prof. Rahul Kapoor",
    designation: "Assistant Professor",
    department: "Mechanical Engineering",
    qualification: "M.Tech in Mechanical Engineering",
    specialization: ["Mechanics", "Materials Science", "Design"],
    email: "rahul.kapoor@gcet.ac.in",
    phone: "+91-1234567898",
    experience: "9 Years",
  },
  {
    id: "10",
    name: "Dr. Meera Patel",
    designation: "Professor & HOD",
    department: "Civil Engineering",
    qualification: "Ph.D. in Structural Engineering",
    specialization: [
      "Structural Engineering",
      "Earthquake Engineering",
      "Building Design",
    ],
    email: "meera.patel@gcet.ac.in",
    phone: "+91-1234567899",
    experience: "19 Years",
  },
  {
    id: "11",
    name: "Dr. Suresh Rao",
    designation: "Associate Professor",
    department: "Civil Engineering",
    qualification: "Ph.D. in Transportation Engineering",
    specialization: [
      "Transportation Engineering",
      "Highway Engineering",
      "Traffic Management",
    ],
    email: "suresh.rao@gcet.ac.in",
    phone: "+91-1234567800",
    experience: "16 Years",
  },
  {
    id: "12",
    name: "Prof. Anjali Desai",
    designation: "Assistant Professor",
    department: "Civil Engineering",
    qualification: "M.Tech in Civil Engineering",
    specialization: [
      "Environmental Engineering",
      "Water Resources",
      "Surveying",
    ],
    email: "anjali.desai@gcet.ac.in",
    phone: "+91-1234567801",
    experience: "6 Years",
  },
];

const departments = [
  "All Departments",
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

const Faculty: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const filteredFaculty =
    selectedDepartment === "All Departments"
      ? facultyMembers
      : facultyMembers.filter((f) => f.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Faculty
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Meet our dedicated team of experienced professors and educators
              committed to excellence in engineering education
            </p>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedDepartment === dept
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty) => (
            <div
              key={faculty.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
            >
              {/* Faculty Image Placeholder */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-48 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                  <GraduationCap className="w-16 h-16 text-blue-600" />
                </div>
              </div>

              {/* Faculty Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {faculty.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-2">
                  {faculty.designation}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{faculty.department}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Award className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{faculty.qualification}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Experience: {faculty.experience}
                    </span>
                  </div>
                </div>

                {/* Specialization Tags */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    SPECIALIZATION
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {faculty.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <a
                    href={`mailto:${faculty.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{faculty.email}</span>
                  </a>
                  {faculty.phone && (
                    <a
                      href={`tel:${faculty.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{faculty.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No faculty members found for this department.
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">12+</div>
              <div className="text-blue-100">Faculty Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8+</div>
              <div className="text-blue-100">Ph.D. Holders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Years Avg. Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Research Publications</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faculty;








