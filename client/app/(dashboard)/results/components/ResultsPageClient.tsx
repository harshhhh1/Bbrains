"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assessmentApi, dashboardApi, type StudentAssessmentResult } from "@/services/api/client";
import { Loader2, Search, Trophy } from "lucide-react";
import { toast } from "sonner";
import { ResultCard } from "../_components/ResultCard";
import { ResultsStats } from "../_components/ResultsStats";

function resultPercentage(result: StudentAssessmentResult) {
  const total = Number(result.assessment.totalMarks || 0);
  if (!total) return 0;
  return Math.round((Number(result.marksObtained || 0) / total) * 100);
}

export default function ResultsPage() {
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [results, setResults] = useState<StudentAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, resultResponse] = await Promise.all([
        dashboardApi.getUser(),
        assessmentApi.getMyResults(),
      ]);

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type);
      }

      if (resultResponse.success && resultResponse.data) {
        setResults(resultResponse.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (assessmentTypeFilter !== "all" && result.assessment.assessmentType !== assessmentTypeFilter) return false;
      if (subjectFilter !== "all" && result.assessment.subject !== subjectFilter) return false;
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        result.assessment.subject.toLowerCase().includes(query) ||
        result.assessment.topic.toLowerCase().includes(query) ||
        result.assessment.course?.name?.toLowerCase().includes(query)
      );
    });
  }, [assessmentTypeFilter, results, searchQuery, subjectFilter]);

  const resultSubjects = useMemo(() => {
    return Array.from(new Set(results.map((result) => result.assessment.subject))).sort((a, b) => a.localeCompare(b));
  }, [results]);

  const averageScore = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((sum, result) => sum + resultPercentage(result), 0);
    return Math.round(total / results.length);
  }, [results]);

  const filteredAverageScore = useMemo(() => {
    if (!filteredResults.length) return 0;
    const total = filteredResults.reduce((sum, result) => sum + resultPercentage(result), 0);
    return Math.round(total / filteredResults.length);
  }, [filteredResults]);

  if (loading && !userRole) {
    return (
      <DashboardContent>
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground font-mono">Syncing Registry...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="mx-auto w-full max-w-6xl p-6 md:p-12 space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
             <Trophy className="h-10 w-10 text-primary" />
             Academic Performance
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Verified transcript of test and examination publishings.</p>
        </div>

        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            className="h-14 rounded-2xl pl-12 pr-4 bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg placeholder:text-muted-foreground/30"
            placeholder="Search topic or subject..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </header>

      <ResultsStats 
        totalCount={results.length}
        subjectCount={new Set(results.map(r => r.assessment.subject)).size}
        overallAverage={averageScore}
        filteredAverage={filteredAverageScore}
        filteredCount={filteredResults.length}
        loading={loading}
      />

      <div className="space-y-8 pt-6 border-t border-border/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
           <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight">Examination Ledger</h2>
              <p className="text-sm font-medium text-muted-foreground">Detailed breakdown of individual performance records.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Type</span>
                  <Select value={assessmentTypeFilter} onValueChange={setAssessmentTypeFilter}>
                    <SelectTrigger className="h-11 min-w-[160px] rounded-xl bg-muted/20 border-border/40 font-bold">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="all">Aggregate</SelectItem>
                      <SelectItem value="test">Class Test</SelectItem>
                      <SelectItem value="exam">Main Exam</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Subject</span>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="h-11 min-w-[200px] rounded-xl bg-muted/20 border-border/40 font-bold">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="all">Universal</SelectItem>
                      {resultSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
           </div>
        </div>

        {filteredResults.length === 0 ? (
          <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-24">
            <div className="flex flex-col items-center justify-center text-center px-6">
              <Trophy className="w-16 h-16 text-muted-foreground/20 mb-6" />
              <h3 className="text-xl font-bold">No Records Matched</h3>
              <p className="text-muted-foreground mt-2 max-w-xs font-medium">Adjust your criteria or check back after the next publishing.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 animate-in fade-in duration-700">
            {filteredResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}
      </div>
    </DashboardContent>
  );
}
