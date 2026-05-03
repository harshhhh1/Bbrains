"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Upload, Loader2, Check, XCircle, RotateCcw, Eye } from "lucide-react";
import { assignmentApi, type Assignment } from "@/services/api/client";
import { Button } from "@/components/ui/button";
import { canSubmitAssignment } from "@/features/assignments/assignment-utils";
import { AssignmentSubmitDrawer } from "@/features/assignments/components/AssignmentSubmitDrawer";
import { AssignmentViewDialog } from "@/features/assignments/components/AssignmentViewDialog";
import { toast } from "sonner";
import { format, isTomorrow, isToday, parseISO } from "date-fns";
import Link from "next/link";

export function MyTasksCard() {
  const [mounted, setMounted] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        assignmentApi.getAssignments(),
        assignmentApi.getMySubmissions(),
      ]);

      if (assignmentResponse.success && assignmentResponse.data) {
        const submissions = submissionsResponse.success && submissionsResponse.data ? submissionsResponse.data : [];
        const submissionsMap = new Map(submissions.map((submission) => [submission.assignmentId, submission]));

        const enrichedAssignments = assignmentResponse.data.map((assignment) => ({
          ...assignment,
          rewardPoints: assignment.rewardPoints ?? 0,
          submission: submissionsMap.get(assignment.id) || undefined,
        })).slice(0, 3);

        setAssignments(enrichedAssignments);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    setRefreshKey(k => k + 1);
    fetchAssignments();
  };

  const handleAssignmentClick = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewingAssignment(assignment);
  };

  const handleUploadClick = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssignment(assignment);
  };

  const getDueDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM dd");
    } catch (e) {
      return "Soon";
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    const status = assignment.submission?.reviewStatus;
    if (status === "completed") return { label: "Completed", icon: Check, color: "text-green-500", bgColor: "bg-green-500/10" };
    if (status === "incomplete") return { label: "Incomplete", icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10" };
    if (status === "rework") return { label: "Needs Rework", icon: RotateCcw, color: "text-orange-500", bgColor: "bg-orange-500/10" };
    if (assignment.submission) return { label: "Awaiting", icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10" };
    return null;
  };

  return (
    <Card className="h-full border-border/40 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-purple" />
          My Tasks
        </CardTitle>
        {mounted && assignments.length > 0 && canSubmitAssignment(assignments[0]) && (
          <Link href="/assignments">
            <Button 
              size="sm"
              className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl h-8 px-3 shadow-lg shadow-brand-purple/20 transition-all font-bold text-[10px]"
            >
              VIEW ALL
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-[10px] tracking-widest uppercase font-bold">Fetching Tasks...</span>
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((task) => {
              const canSubmit = canSubmitAssignment(task);
              const submissionStatus = getSubmissionStatus(task);
              
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/30 transition-all group cursor-pointer"
                  onClick={(e) => handleAssignmentClick(task, e)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${submissionStatus ? submissionStatus.bgColor : 'bg-brand-purple/10'}`}>
                      {submissionStatus ? (
                        <submissionStatus.icon className={`h-4 w-4 ${submissionStatus.color}`} />
                      ) : (
                        <Clock className="h-4 w-4 text-brand-purple" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md">
                          {getDueDateLabel(task.dueDate)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {task.course?.name || "General"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {canSubmit ? (
                      <Button 
                        onClick={(e) => handleUploadClick(task, e)}
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg p-0 hover:bg-brand-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={(e) => handleAssignmentClick(task, e)}
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-lg p-0 hover:bg-brand-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mb-2 opacity-20 text-green-500" />
              <p className="text-xs font-bold uppercase tracking-widest">Great job! No pending tasks.</p>
            </div>
          )}
          
          <Link 
            href="/assignments" 
            className="flex items-center justify-center w-full py-2 mt-2 text-[11px] font-bold text-brand-purple bg-brand-purple/5 rounded-lg hover:bg-brand-purple/10 transition-all uppercase tracking-widest"
          >
            View All Assignments
          </Link>
        </div>
      </CardContent>

      <AssignmentSubmitDrawer 
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSuccess={handleSuccess}
      />

      <AssignmentViewDialog 
        assignment={viewingAssignment}
        onClose={() => setViewingAssignment(null)}
      />
    </Card>
  );
}

