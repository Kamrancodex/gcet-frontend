import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Calendar,
  Users,
  ExternalLink,
  School,
  FileText,
  Share2,
  Copy,
  Mail,
  MessageSquare,
} from "lucide-react";

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  targetAudience: string;
  targetCourse?: string;
  targetSemester?: number;
  startDate: string;
  endDate: string;
  publishedBy: string;
  publishedAt: string;
  links?: { title: string; url: string }[];
  signedBy?: string;
}

interface NoticeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
}

const NoticeViewModal: React.FC<NoticeViewModalProps> = ({
  isOpen,
  onClose,
  notice,
}) => {
  if (!notice) return null;

  const handleDownloadPDF = () => {
    // Create a more formatted content for PDF-like download
    const content = `
GOVT COLLEGE OF ENGINEERING AND TECHNOLOGY SAFAPORA
OFFICIAL NOTICE
═══════════════════════════════════════════════════════════════

NOTICE TITLE: ${notice.title.toUpperCase()}
NOTICE TYPE: ${notice.type.toUpperCase().replace("_", " ")}
PRIORITY LEVEL: ${notice.priority.toUpperCase()}

PUBLICATION DETAILS:
• Published Date: ${formatDate(notice.publishedAt)}
• Valid From: ${formatDate(notice.startDate)}
• Valid Until: ${formatDate(notice.endDate)}
• Target Audience: ${getAudienceDisplay()}
• Published By: ${notice.publishedBy}

NOTICE CONTENT:
${notice.content}

${
  notice.links && notice.links.length > 0
    ? `
ADDITIONAL RESOURCES:
${notice.links
  .map((link, index) => `${index + 1}. ${link.title}: ${link.url}`)
  .join("\n")}
`
    : ""
}

═══════════════════════════════════════════════════════════════
This is an official notice from Govt College of Engineering and Technology Safapora.
For any queries, please contact the college administration.

— Signed by Principal, GCET Safapora —
Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GCET-Notice-${notice.title
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = (platform: string) => {
    const noticeUrl = `${window.location.origin}/notice/${notice._id}`;
    const shareText = `📢 GCET Notice: ${
      notice.title
    }\n\n${notice.content.substring(
      0,
      100
    )}...\n\nRead full notice: ${noticeUrl}`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "email":
        window.open(
          `mailto:?subject=${encodeURIComponent(
            `GCET Notice: ${notice.title}`
          )}&body=${encodeURIComponent(shareText)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareText).then(() => {
          alert("Notice details copied to clipboard!");
        });
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAudienceDisplay = () => {
    if (notice.targetAudience === "specific_course" && notice.targetCourse) {
      return notice.targetCourse;
    }
    if (
      notice.targetAudience === "specific_semester" &&
      notice.targetSemester
    ) {
      return `Semester ${notice.targetSemester}`;
    }
    return notice.targetAudience.replace("_", " ").toUpperCase();
  };

  const getPriorityColor = () => {
    switch (notice.priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header with College Branding */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <School className="w-10 h-10" />
                  <div>
                    <h1 className="text-xl font-bold">
                      Govt College of Engineering and Technology
                    </h1>
                    <p className="text-blue-100">Safapora</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Download Button - Smaller */}
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-md font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>

                  {/* Share Dropdown - Smaller */}
                  <div className="relative group">
                    <button className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors font-medium shadow-md text-sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    {/* Share Options */}
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleShare("whatsapp")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare("email")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </button>
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
            </div>

            {/* Notice Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Notice Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor()}`}
                  >
                    {notice.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {notice.type.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {notice.title}
                </h2>

                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Valid Period</div>
                      <div>
                        {formatDate(notice.startDate)} -{" "}
                        {formatDate(notice.endDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Target Audience</div>
                      <div>{getAudienceDisplay()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Published</div>
                      <div>{formatDate(notice.publishedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Content */}
              <div className="prose max-w-none mb-6">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </div>
              </div>

              {/* Links Section */}
              {notice.links && notice.links.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Additional Resources
                  </h3>
                  <div className="space-y-2">
                    {notice.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Signature */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
              <div className="flex flex-col items-center space-y-4">
                {/* Publication Info */}
                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-medium text-gray-800">
                      Published by
                    </div>
                    <div className="text-gray-600">{notice.publishedBy}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="font-medium text-gray-800">Date</div>
                    <div className="text-gray-600">
                      {formatDate(notice.publishedAt)}
                    </div>
                  </div>
                </div>

                {/* Official Signature */}
                <div className="text-center">
                  <div className="inline-block bg-white border-2 border-blue-200 px-6 py-3 rounded-lg shadow-sm">
                    <div className="text-sm font-semibold text-gray-800 mb-1">
                      — {notice.signedBy || "Principal, GCET Safapora"} —
                    </div>
                    <div className="text-xs text-gray-500">
                      Official College Notice
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NoticeViewModal;
