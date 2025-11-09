import React, { useEffect, useMemo, useState } from "react";
import { X, Search, CheckCircle, XCircle, Users, Download } from "lucide-react";
import { adminAPI, registrationAPI } from "../../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  semester: number;
}

interface RegistrationRecord {
  _id: string;
  universityRegNumber: string;
  studentName: string;
  email: string;
  currentSemester: number;
  status: "pending" | "completed" | "payment_pending" | "library_pending";
  feeStatus: "pending" | "paid" | "partial" | "overdue";
  libraryCleared: boolean;
}

const SessionDetailsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  sessionId,
  semester,
}) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const [apiRegs] = await Promise.all([
          registrationAPI.getRegistrations({ sessionId, semester }),
        ]);
        setRegistrations((apiRegs || []) as any);

        // Eligible = students currently in (semester-1) and not in regs list
        const currentSem = Math.max(1, (semester as number) - 1);
        const studentsResp = await adminAPI.getStudents({
          semester: currentSem,
          limit: 1000,
        });
        const registeredSet = new Set(
          ((apiRegs || []) as any[]).map((r: any) => r.universityRegNumber)
        );
        const notRegistered = (
          studentsResp.students ||
          studentsResp ||
          []
        ).filter((s: any) => !registeredSet.has(s.universityRegNumber));
        setEligibleStudents(notRegistered);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, sessionId, semester]);

  const filteredRegs = useMemo(() => {
    if (!search) return registrations;
    const q = search.toLowerCase();
    return registrations.filter(
      (r) =>
        r.studentName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.universityRegNumber?.toLowerCase().includes(q)
    );
  }, [registrations, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-5xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Session Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Registered Students */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
              <div className="font-medium">Registered Students</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="pl-7 pr-3 py-1.5 border rounded"
                  />
                </div>
                <button className="px-2 py-1 text-sm bg-gray-100 rounded flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Fee</th>
                    <th className="text-left p-2">Library</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{r.studentName}</div>
                        <div className="text-gray-600">
                          {r.universityRegNumber}
                        </div>
                        <div className="text-gray-600">{r.email}</div>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100">
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2 text-xs">{r.feeStatus}</td>
                      <td className="p-2">
                        {r.libraryCleared ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRegs.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={4}>
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Not Yet Registered (Eligible) */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
              <div className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> Not Yet Registered
              </div>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Current Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.map((s) => (
                    <tr key={s._id || s.studentId} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-gray-600">
                          {s.universityRegNumber}
                        </div>
                        <div className="text-gray-600">{s.email}</div>
                      </td>
                      <td className="p-2">
                        {s.course?.semester ?? s.currentSemester}
                      </td>
                    </tr>
                  ))}
                  {eligibleStudents.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={2}>
                        All eligible students have registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsDrawer;
