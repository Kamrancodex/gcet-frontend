import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  GraduationCap,
  Bell,
  School,
  AlertCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { registrationAPI, noticesAPI } from "../../services/api";

interface OpenRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrationCreated: (registration: any) => void;
  editSession?: {
    _id: string;
    sessionId: string;
    semester: number;
    academicYear: string;
    startDate: string;
    endDate: string;
    feeAmount: number;
    feeDeadline: string;
    isActive: boolean;
    availableCourses: string[];
    libraryRequirement: boolean;
  };
}

interface RegistrationFormData {
  registrationType:
    | "semester"
    | "admission"
    | "external_activity"
    | "workshop"
    | "exam"
    | "other";
  branches: string[]; // Multiple branches: ["CSE", "ME", "CE", "EE"]
  branchSubjects: Record<string, string[]>; // Subjects per branch: { "CSE": [...], "ME": [...] }
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  feeAmount: number;
  feeDeadline: string;
  availableCourses: string[]; // Deprecated - keeping for backward compatibility
  requiresLibraryClearance: boolean;
  createNotice: boolean;
  useAI: boolean;
  noticeTitle: string;
  noticeContent: string;
  signedBy: string;
}

// Engineering Branches available in India
const engineeringBranches = [
  { code: "CSE", name: "Computer Science Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "ECE", name: "Electronics & Communication Engineering" },
  { code: "IT", name: "Information Technology" },
  { code: "BT", name: "Biotechnology" },
  { code: "CH", name: "Chemical Engineering" },
  { code: "AE", name: "Automobile Engineering" },
  { code: "ASE", name: "Aerospace Engineering" },
];

// Standard 10 subjects per semester for each branch (6 theory + 4 practical)
const branchSubjects: Record<string, Record<number, string[]>> = {
  CSE: {
    5: [
      // 6 Theory Subjects (150 marks each = 50 internal + 100 external)
      "Computer Networks (Theory)",
      "Database Management Systems (Theory)",
      "Operating Systems (Theory)",
      "Software Engineering (Theory)",
      "Web Technologies (Theory)",
      "Artificial Intelligence (Theory)",
      // 4 Practical/Lab
      "Computer Networks Lab (Practical)",
      "DBMS Lab (Practical)",
      "Web Technologies Lab (Practical)",
      "Mini Project (Project Work)",
    ],
    6: [
      "Machine Learning (Theory)",
      "Distributed Systems (Theory)",
      "Information Security (Theory)",
      "Mobile Computing (Theory)",
      "Compiler Design (Theory)",
      "Cloud Computing (Theory)",
      "Machine Learning Lab (Practical)",
      "Mobile Development Lab (Practical)",
      "Security Lab (Practical)",
      "Project Work I (Project)",
    ],
  },
  ME: {
    5: [
      // 6 Theory Subjects
      "Thermodynamics (Theory)",
      "Fluid Mechanics (Theory)",
      "Manufacturing Technology (Theory)",
      "Machine Design (Theory)",
      "Heat Transfer (Theory)",
      "Strength of Materials (Theory)",
      // 4 Practical/Lab
      "Thermodynamics Lab (Practical)",
      "Fluid Mechanics Lab (Practical)",
      "Manufacturing Lab (Practical)",
      "Mini Project (Project Work)",
    ],
    6: [
      "Mechanical Vibrations (Theory)",
      "Automobile Engineering (Theory)",
      "Industrial Engineering (Theory)",
      "Refrigeration & AC (Theory)",
      "Dynamics of Machinery (Theory)",
      "Production Technology (Theory)",
      "Vibrations Lab (Practical)",
      "Automobile Lab (Practical)",
      "Production Lab (Practical)",
      "Project Work I (Project)",
    ],
  },
  CE: {
    5: [
      // 6 Theory Subjects
      "Structural Analysis (Theory)",
      "Geotechnical Engineering (Theory)",
      "Concrete Technology (Theory)",
      "Transportation Engineering (Theory)",
      "Water Resources Engineering (Theory)",
      "Environmental Engineering (Theory)",
      // 4 Practical/Lab
      "Structural Analysis Lab (Practical)",
      "Geotechnical Lab (Practical)",
      "Concrete Lab (Practical)",
      "Mini Project (Project Work)",
    ],
  },
  EE: {
    5: [
      // 6 Theory Subjects
      "Power Systems (Theory)",
      "Control Systems (Theory)",
      "Electrical Machines (Theory)",
      "Power Electronics (Theory)",
      "Signals and Systems (Theory)",
      "Digital Signal Processing (Theory)",
      // 4 Practical/Lab
      "Power Systems Lab (Practical)",
      "Control Systems Lab (Practical)",
      "Electrical Machines Lab (Practical)",
      "Mini Project (Project Work)",
    ],
  },
  ECE: {
    5: [
      "Digital Communication (Theory)",
      "Microprocessors (Theory)",
      "Analog Communication (Theory)",
      "Electromagnetic Theory (Theory)",
      "VLSI Design (Theory)",
      "Control Systems (Theory)",
      "Digital Communication Lab (Practical)",
      "Microprocessors Lab (Practical)",
      "VLSI Lab (Practical)",
      "Mini Project (Project Work)",
    ],
  },
  IT: {
    5: [
      "Computer Networks (Theory)",
      "Database Management (Theory)",
      "Software Engineering (Theory)",
      "Web Development (Theory)",
      "System Administration (Theory)",
      "Network Security (Theory)",
      "Networks Lab (Practical)",
      "Database Lab (Practical)",
      "Web Development Lab (Practical)",
      "Mini Project (Project Work)",
    ],
  },
};

const OpenRegistrationModal: React.FC<OpenRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistrationCreated,
  editSession,
}) => {
  const isEditMode = !!editSession;
  const [formData, setFormData] = useState<RegistrationFormData>({
    registrationType: "semester",
    branches: ["CSE"], // Start with CSE selected
    branchSubjects: {
      CSE: branchSubjects["CSE"]?.[5] || [],
    },
    semester: 5,
    academicYear: "2024-25",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    feeAmount: 45000,
    feeDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    availableCourses: [], // Deprecated
    requiresLibraryClearance: false,
    createNotice: true,
    useAI: true,
    noticeTitle: "",
    noticeContent: "",
    signedBy: "Principal, GCET Safapora",
  });

  const [selectedBranchForEdit, setSelectedBranchForEdit] =
    useState<string>("CSE");
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize form data when editing
  React.useEffect(() => {
    if (editSession) {
      setFormData({
        registrationType: "semester",
        branches: ["CSE"], // Default, will be updated
        branchSubjects: {
          CSE: editSession.availableCourses || [],
        },
        semester: editSession.semester,
        academicYear: editSession.academicYear,
        startDate: editSession.startDate.split("T")[0],
        endDate: editSession.endDate.split("T")[0],
        feeAmount: editSession.feeAmount,
        feeDeadline: editSession.feeDeadline.split("T")[0],
        availableCourses: editSession.availableCourses || [],
        requiresLibraryClearance: editSession.libraryRequirement,
        createNotice: false, // Don't create notice when editing
        useAI: false,
        noticeTitle: "",
        noticeContent: "",
        signedBy: "Principal, GCET Safapora",
      });
    }
  }, [editSession]);

  // Conditional rendering flags
  const showSemesterField =
    formData.registrationType === "semester" ||
    formData.registrationType === "exam";
  const showCoursesField =
    formData.registrationType === "semester" ||
    formData.registrationType === "admission";

  // Update available subjects when branches or semester changes
  React.useEffect(() => {
    if (showCoursesField && formData.branches.length > 0) {
      // Initialize subjects for newly added branches
      const newBranchSubjects = { ...formData.branchSubjects };

      formData.branches.forEach((branch) => {
        if (!newBranchSubjects[branch]) {
          // Load default subjects for this branch
          newBranchSubjects[branch] =
            branchSubjects[branch]?.[formData.semester] || [];
        }
      });

      // Remove subjects for unchecked branches
      Object.keys(newBranchSubjects).forEach((branch) => {
        if (!formData.branches.includes(branch)) {
          delete newBranchSubjects[branch];
        }
      });

      setFormData((prev) => ({
        ...prev,
        branchSubjects: newBranchSubjects,
      }));

      // Set first branch as selected for editing if current selection is not in branches
      if (
        !formData.branches.includes(selectedBranchForEdit) &&
        formData.branches.length > 0
      ) {
        setSelectedBranchForEdit(formData.branches[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.branches, formData.semester, showCoursesField]);

  // Auto-generate notice content when form data changes
  React.useEffect(() => {
    if (formData.createNotice && !formData.useAI) {
      let title = "";
      let content = "";

      switch (formData.registrationType) {
        case "semester": {
          title = `Semester ${formData.semester} Registration Open - Academic Year ${formData.academicYear}`;
          const eligibleBranches = formData.branches
            .map(
              (code) =>
                engineeringBranches.find((b) => b.code === code)?.name || code
            )
            .join(", ");
          content = `
We are pleased to announce that registration is now open for Semester ${
            formData.semester
          } for the Academic Year ${formData.academicYear}.

🎓 ELIGIBLE BRANCHES:
${formData.branches
  .map(
    (code) =>
      `• ${code} - ${
        engineeringBranches.find((b) => b.code === code)?.name || code
      }`
  )
  .join("\n")}

📅 IMPORTANT DATES:
• Registration Start Date: ${formatDate(formData.startDate)}
• Registration End Date: ${formatDate(formData.endDate)}
• Fee Payment Deadline: ${formatDate(formData.feeDeadline)}

💰 REGISTRATION FEE:
• Semester Fee: ₹${formData.feeAmount.toLocaleString()}

📚 AVAILABLE SUBJECTS (All Branches):
${Object.entries(formData.branchSubjects)
  .map(
    ([branch, subjects]) =>
      `\n${branch}:\n${subjects.map((s) => `  • ${s}`).join("\n")}`
  )
  .join("\n")}

${
  formData.requiresLibraryClearance
    ? `📚 LIBRARY CLEARANCE REQUIRED:
Students must have library clearance before registration.
Please visit the library to clear any pending books.

`
    : ""
}⚠️ REGISTRATION PROCESS:
1. Enter your University Registration Number
2. Verify and update your details
3. Select courses for the semester
4. Complete fee payment
${
  formData.requiresLibraryClearance
    ? "5. Ensure library clearance is completed\n"
    : ""
}
This registration is only for students enrolled in: ${eligibleBranches}

Register now to secure your seat for the upcoming semester!
          `.trim();
          break;
        }

        case "admission":
          title = `Admission Open for Academic Year ${formData.academicYear}`;
          content = `
We are pleased to announce that admissions are now open for Academic Year ${
            formData.academicYear
          }.

📅 IMPORTANT DATES:
• Admission Start Date: ${formatDate(formData.startDate)}
• Admission End Date: ${formatDate(formData.endDate)}
• Fee Payment Deadline: ${formatDate(formData.feeDeadline)}

💰 ADMISSION FEE:
• Application Fee: ₹${formData.feeAmount.toLocaleString()}

🎓 AVAILABLE PROGRAMS:
${formData.availableCourses.map((course) => `• ${course}`).join("\n")}

⚠️ ADMISSION PROCESS:
1. Fill out the application form
2. Upload required documents
3. Complete fee payment
4. Wait for admission confirmation

For more information, contact the admissions office.
          `.trim();
          break;

        case "external_activity":
          title = `Registration Open - ${
            formData.availableCourses[0] || "Event"
          }`;
          content = `
Registration is now open for our upcoming event!

📅 EVENT DATES:
• Event Start: ${formatDate(formData.startDate)}
• Event End: ${formatDate(formData.endDate)}
• Registration Deadline: ${formatDate(formData.feeDeadline)}

💰 REGISTRATION FEE:
• Participation Fee: ₹${formData.feeAmount.toLocaleString()}

Activities included:
${formData.availableCourses.map((course) => `• ${course}`).join("\n")}

Register now to participate!
          `.trim();
          break;

        case "workshop":
          title = `Workshop Registration - ${
            formData.availableCourses[0] || "Professional Development"
          }`;
          content = `
Join our professional development workshop!

📅 WORKSHOP SCHEDULE:
• Workshop Dates: ${formatDate(formData.startDate)} to ${formatDate(
            formData.endDate
          )}
• Registration Deadline: ${formatDate(formData.feeDeadline)}

💰 WORKSHOP FEE:
• Registration Fee: ₹${formData.feeAmount.toLocaleString()}

Topics covered:
${formData.availableCourses.map((course) => `• ${course}`).join("\n")}

Limited seats available. Register early!
          `.trim();
          break;

        case "exam":
          title = `Examination Registration - Semester ${formData.semester}`;
          content = `
Exam form registration is now open for Semester ${formData.semester}.

📅 IMPORTANT DATES:
• Registration Opens: ${formatDate(formData.startDate)}
• Registration Closes: ${formatDate(formData.endDate)}
• Fee Payment Deadline: ${formatDate(formData.feeDeadline)}

💰 EXAMINATION FEE:
• Exam Fee: ₹${formData.feeAmount.toLocaleString()}

Subjects:
${formData.availableCourses.map((course) => `• ${course}`).join("\n")}

${
  formData.requiresLibraryClearance
    ? `📚 LIBRARY CLEARANCE REQUIRED before exam registration.\n\n`
    : ""
}Register on time to avoid late fees!
          `.trim();
          break;

        default:
          title = `Registration Open - ${formData.academicYear}`;
          content = `
Registration is now open!

📅 DATES:
• Start: ${formatDate(formData.startDate)}
• End: ${formatDate(formData.endDate)}
• Deadline: ${formatDate(formData.feeDeadline)}

💰 FEE: ₹${formData.feeAmount.toLocaleString()}

For more information, contact the administrative office.
          `.trim();
      }

      setFormData((prev) => ({
        ...prev,
        noticeTitle: title,
        noticeContent: content,
      }));
    }
  }, [
    formData.registrationType,
    formData.semester,
    formData.academicYear,
    formData.startDate,
    formData.endDate,
    formData.feeDeadline,
    formData.feeAmount,
    formData.availableCourses,
    formData.requiresLibraryClearance,
    formData.createNotice,
    formData.useAI,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateAINotice = async () => {
    if (!formData.useAI) return;

    setAiLoading(true);
    try {
      // Simulate AI API call - in real implementation, use OpenAI or similar
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const libraryRequired =
        formData.semester === 5 || formData.semester === 7;
      const title = `🎓 Semester ${formData.semester} Registration Now Open - Transform Your Academic Journey!`;

      const aiContent = `
🌟 EXCITING NEWS! Registration for Semester ${
        formData.semester
      } (Academic Year ${formData.academicYear}) is now LIVE!

📅 KEY DATES TO REMEMBER:
✨ Registration Opens: ${formatDate(formData.startDate)}
🚀 Registration Closes: ${formatDate(formData.endDate)}
💳 Fee Payment Deadline: ${formatDate(formData.feeDeadline)}

💰 INVESTMENT IN YOUR FUTURE:
Semester Fee: ₹${formData.feeAmount.toLocaleString()} (Best value education in the region!)

🎯 CUTTING-EDGE COURSES AVAILABLE:
${formData.availableCourses
  .map((course, index) => `${index + 1}. ${course} 🔥`)
  .join("\n")}

${
  libraryRequired
    ? `📚 LIBRARY CLEARANCE CHECKPOINT:
🎯 Semester ${formData.semester} students: Ensure 70% library book clearance
📖 Visit our state-of-the-art library to clear pending books
⚡ Fast-track clearance available during registration period

`
    : ""
}🚀 STREAMLINED REGISTRATION PROCESS:
1️⃣ Enter your University Registration Number (Lightning fast lookup!)
2️⃣ Verify & update your profile (Keep it fresh!)
3️⃣ Choose your courses (Build your expertise!)
4️⃣ Secure payment gateway (100% safe & instant!)
${
  libraryRequired
    ? "5️⃣ Library clearance verification (Automated check!)\n"
    : ""
}
⚠️ IMPORTANT REMINDERS:
🔥 Early bird gets the best course slots!
✅ All enrolled students are pre-qualified
🎯 Zero tolerance for late submissions
💪 Academic office support available 24/7

🌟 WHY CHOOSE GCET SAFAPORA?
• Industry-aligned curriculum
• Expert faculty with real-world experience  
• State-of-the-art facilities
• 100% placement assistance
• Innovation-driven learning environment

Don't miss this opportunity to advance your career! Register TODAY and join the league of successful GCET graduates making waves in the industry! 🚀

#GCETSafapora #FutureReady #TechEducation #Innovation
      `.trim();

      setFormData((prev) => ({
        ...prev,
        noticeTitle: title,
        noticeContent: aiContent,
      }));
    } catch (error) {
      console.error("AI generation failed:", error);
      setErrors({ ai: "Failed to generate AI content. Please try again." });
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate branches for semester/admission/exam registrations
    if (
      (formData.registrationType === "semester" ||
        formData.registrationType === "admission" ||
        formData.registrationType === "exam") &&
      formData.branches.length === 0
    ) {
      newErrors.branches = "Please select at least one engineering branch";
    }

    if (formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = "Semester must be between 1 and 8";
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic year is required";
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (new Date(formData.feeDeadline) <= new Date(formData.endDate)) {
      newErrors.feeDeadline =
        "Fee deadline should be after registration end date";
    }

    if (formData.feeAmount <= 0) {
      newErrors.feeAmount = "Fee amount must be greater than 0";
    }

    // Validate that each selected branch has subjects
    if (showCoursesField) {
      const branchesWithoutSubjects = formData.branches.filter(
        (branch) =>
          !formData.branchSubjects[branch] ||
          formData.branchSubjects[branch].length === 0
      );
      if (branchesWithoutSubjects.length > 0) {
        newErrors.courses = `Missing subjects for branches: ${branchesWithoutSubjects.join(
          ", "
        )}`;
      }
    }

    if (formData.createNotice && !formData.noticeTitle.trim()) {
      newErrors.noticeTitle = "Notice title is required when creating notice";
    }

    if (formData.createNotice && !formData.noticeContent.trim()) {
      newErrors.noticeContent =
        "Notice content is required when creating notice";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Build availableCourses from selected branches' subjects (backend requires non-empty array)
      const compiledCourses = formData.branches.flatMap(
        (branch) => formData.branchSubjects[branch] || []
      );

      if (!compiledCourses.length) {
        setErrors({
          courses:
            "Please add at least one subject for the selected branches before opening registration.",
        });
        setLoading(false);
        return;
      }

      let registrationSession;
      
      if (isEditMode && editSession) {
        // Update existing session
        registrationSession = await registrationAPI.updateSession(editSession._id, {
          semester: formData.semester,
          academicYear: formData.academicYear,
          startDate: formData.startDate,
          endDate: formData.endDate,
          feeAmount: formData.feeAmount,
          feeDeadline: formData.feeDeadline,
          availableCourses: compiledCourses,
          libraryRequirement: formData.requiresLibraryClearance,
        });
      } else {
        // Create new registration session
        registrationSession = await registrationAPI.createSession({
          semester: formData.semester,
          academicYear: formData.academicYear,
          startDate: formData.startDate,
          endDate: formData.endDate,
          feeAmount: formData.feeAmount,
          feeDeadline: formData.feeDeadline,
          availableCourses: compiledCourses,
          libraryRequirement: formData.requiresLibraryClearance,
        });
      }

      // Create notice if requested (only for new sessions)
      if (!isEditMode && formData.createNotice) {
        await noticesAPI.create({
          title: formData.noticeTitle,
          content: formData.noticeContent,
          type: "announcement",
          priority: "high",
          targetAudience: "students",
          startDate: formData.startDate,
          endDate: formData.endDate,
          links: [
            {
              title: "Register Now",
              url: `/registration/apply/${registrationSession._id || "new"}`,
            },
          ],
          signedBy: formData.signedBy,
        });
      }

      onRegistrationCreated(registrationSession);
      onClose();
    } catch (error) {
      console.error("Error creating registration session:", error);
      setErrors({
        general: "Failed to create registration session. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddSubjectModal = () => {
    setNewSubjectName("");
    setIsAddSubjectModalOpen(true);
  };

  const addCourse = () => {
    if (newSubjectName.trim()) {
      setFormData((prev) => ({
        ...prev,
        branchSubjects: {
          ...prev.branchSubjects,
          [selectedBranchForEdit]: [
            ...(prev.branchSubjects[selectedBranchForEdit] || []),
            newSubjectName.trim(),
          ],
        },
      }));
      setIsAddSubjectModalOpen(false);
      setNewSubjectName("");
    }
  };

  const removeCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      branchSubjects: {
        ...prev.branchSubjects,
        [selectedBranchForEdit]: (
          prev.branchSubjects[selectedBranchForEdit] || []
        ).filter((_, i) => i !== index),
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <School className="w-8 h-8" />
                  <div>
                    <h1 className="text-xl font-bold">
                      {isEditMode ? "Edit Semester Registration" : "Open Semester Registration"}
                    </h1>
                    <p className="text-blue-100">
                      Govt College of Engineering and Technology Safapora
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="p-6 space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Registration Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Type *
                  </label>
                  <select
                    value={formData.registrationType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        registrationType: e.target
                          .value as RegistrationFormData["registrationType"],
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="semester">Semester Registration</option>
                    <option value="admission">Admission</option>
                    <option value="exam">Examination Form</option>
                    <option value="external_activity">
                      External Activity/Event
                    </option>
                    <option value="workshop">Workshop/Training</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select what this registration is for - form fields will
                    adapt accordingly
                  </p>
                </div>

                {/* Multi-Branch Selection (for semester registration/exam) */}
                {(formData.registrationType === "semester" ||
                  formData.registrationType === "exam" ||
                  formData.registrationType === "admission") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Eligible Engineering Branches *
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {engineeringBranches.map((branch) => (
                        <label
                          key={branch.code}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.branches.includes(branch.code)
                              ? "bg-blue-100 border-2 border-blue-500 shadow-sm"
                              : "bg-white border-2 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.branches.includes(branch.code)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                branches: isChecked
                                  ? [...prev.branches, branch.code]
                                  : prev.branches.filter(
                                      (b) => b !== branch.code
                                    ),
                              }));
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {branch.code}
                            </div>
                            <div className="text-xs text-gray-600">
                              {branch.name}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ✅ Select multiple branches for this registration. Only
                      students from selected branches can register.
                      {formData.branches.length > 0 && (
                        <span className="ml-2 font-semibold text-blue-600">
                          ({formData.branches.length} selected)
                        </span>
                      )}
                    </p>
                    {errors.branches && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.branches}
                      </p>
                    )}
                  </div>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {showSemesterField && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            semester: parseInt(e.target.value),
                          }))
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.semester ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                      {errors.semester && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.semester}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.academicYear
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 2024-25"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.academicYear}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates and Fee */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.endDate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Payment Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.feeDeadline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          feeDeadline: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.feeDeadline
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.feeDeadline && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.feeDeadline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fee Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester Fee Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.feeAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        feeAmount: parseInt(e.target.value) || 0,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.feeAmount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="45000"
                  />
                  {errors.feeAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.feeAmount}
                    </p>
                  )}
                </div>

                {/* Library Clearance Toggle */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Library Clearance Required
                      </h3>
                      <p className="text-sm text-gray-600">
                        Enable if students need library clearance before
                        registration
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresLibraryClearance}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            requiresLibraryClearance: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900">
                        {formData.requiresLibraryClearance ? "Yes" : "No"}
                      </span>
                    </label>
                  </div>
                  {formData.requiresLibraryClearance && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <p className="text-sm font-medium text-orange-700">
                          Library NOC will be verified during registration
                        </p>
                      </div>
                      <p className="text-xs text-orange-600">
                        Students must clear all pending books and fines before
                        they can register
                      </p>
                    </div>
                  )}
                </div>

                {/* Branch-Specific Subject Editor */}
                {showCoursesField && formData.branches.length > 0 && (
                  <div className="space-y-4">
                    {/* Branch Selector Tabs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Edit Subjects by Branch *
                      </label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.branches.map((branch) => {
                          const subjectCount =
                            formData.branchSubjects[branch]?.length || 0;
                          const isSelected = selectedBranchForEdit === branch;

                          return (
                            <button
                              key={branch}
                              type="button"
                              onClick={() => setSelectedBranchForEdit(branch)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{branch}</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {subjectCount}
                                  {subjectCount === 10 ? " ✓" : ""}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subject Editor for Selected Branch */}
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedBranchForEdit} -{" "}
                            {engineeringBranches.find(
                              (b) => b.code === selectedBranchForEdit
                            )?.name || selectedBranchForEdit}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Standard: 6 Theory Subjects (150 marks each) + 4
                            Practicals/Labs
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openAddSubjectModal}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                        >
                          + Add Subject
                        </button>
                      </div>

                      {/* Subject Count Info */}
                      {formData.branchSubjects[selectedBranchForEdit] && (
                        <div className="mb-3 p-2 bg-white border border-blue-300 rounded">
                          <p className="text-xs text-blue-700">
                            <strong>Total Subjects:</strong>{" "}
                            {formData.branchSubjects[selectedBranchForEdit]
                              ?.length || 0}
                            {formData.branchSubjects[selectedBranchForEdit]
                              ?.length === 10
                              ? " ✓ (Standard)"
                              : ` (Add ${
                                  10 -
                                  (formData.branchSubjects[
                                    selectedBranchForEdit
                                  ]?.length || 0)
                                } more for standard)`}
                          </p>
                        </div>
                      )}

                      {/* Subject List */}
                      <div className="space-y-2 max-h-96 overflow-y-auto bg-white rounded-lg p-3">
                        {formData.branchSubjects[selectedBranchForEdit]
                          ?.length > 0 ? (
                          formData.branchSubjects[selectedBranchForEdit].map(
                            (course, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                  course.includes("(Theory)")
                                    ? "bg-blue-50 border border-blue-200"
                                    : course.includes("(Practical)") ||
                                      course.includes("(Lab)")
                                    ? "bg-green-50 border border-green-200"
                                    : course.includes("(Project)")
                                    ? "bg-purple-50 border border-purple-200"
                                    : "bg-gray-50 border border-gray-200"
                                }`}
                              >
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <GraduationCap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span className="flex-1 text-sm">{course}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCourse(index)}
                                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded"
                                  title="Remove subject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                              No subjects added yet for {selectedBranchForEdit}
                            </p>
                            <button
                              type="button"
                              onClick={openAddSubjectModal}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              + Add First Subject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {errors.courses && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.courses}
                      </p>
                    )}
                  </div>
                )}

                {/* Auto-Create Notice */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="createNotice"
                      checked={formData.createNotice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          createNotice: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="createNotice"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Auto-create registration notice
                    </label>
                  </div>

                  {formData.createNotice && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                      {/* AI Toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="useAI"
                          checked={formData.useAI}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              useAI: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label
                          htmlFor="useAI"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Use AI-powered notice generation
                        </label>
                        {formData.useAI && (
                          <button
                            type="button"
                            onClick={generateAINotice}
                            disabled={aiLoading}
                            className="ml-auto px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            {aiLoading ? "Generating..." : "Generate AI Notice"}
                          </button>
                        )}
                      </div>

                      {errors.ai && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-red-600 text-sm">{errors.ai}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notice Title
                        </label>
                        <input
                          type="text"
                          value={formData.noticeTitle}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              noticeTitle: e.target.value,
                            }))
                          }
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.noticeTitle
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          readOnly={formData.useAI}
                        />
                        {errors.noticeTitle && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticeTitle}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notice Content
                        </label>
                        <textarea
                          value={formData.noticeContent}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              noticeContent: e.target.value,
                            }))
                          }
                          rows={8}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            errors.noticeContent
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          readOnly={formData.useAI}
                        />
                        {errors.noticeContent && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticeContent}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Signed By
                        </label>
                        <input
                          type="text"
                          value={formData.signedBy}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              signedBy: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Principal, GCET Safapora"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Note:</span> This will open
                  semester registration and optionally create a public notice
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading 
                      ? (isEditMode ? "Updating..." : "Opening...") 
                      : (isEditMode ? "Update Registration" : "Open Registration")
                    }
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddSubjectModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Add Subject for {selectedBranchForEdit}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {engineeringBranches.find(
                  (b) => b.code === selectedBranchForEdit
                )?.name || selectedBranchForEdit}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name *
              </label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addCourse();
                  }
                }}
                placeholder='e.g., "Computer Networks (Theory)" or "CN Lab (Practical)"'
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  <strong>Examples:</strong>
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Database Systems (Theory)",
                    "DBMS Lab (Practical)",
                    "Mini Project (Project)",
                    "Seminar (Seminar)",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setNewSubjectName(example)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setNewSubjectName("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addCourse}
                disabled={!newSubjectName.trim()}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium ${
                  newSubjectName.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OpenRegistrationModal;
