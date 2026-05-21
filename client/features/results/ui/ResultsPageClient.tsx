"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer, PageHeader, PageSection, SectionHeader } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchField } from "@/components/ui/toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assessmentApi, dashboardApi, type StudentAssessmentResult } from "@/services/api/client";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { ResultCard } from "@/features/results/ui/ResultCard";
import { ResultsStats } from "@/features/results/ui/ResultsStats";

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
      <PageContainer width="lg" padding="spacious">
        <LoadingState label="Syncing Results..." className="py-40" iconClassName="size-10" />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="lg" padding="spacious" gap="xl">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Trophy className="size-10 text-primary" />
            Exam Results
          </span>
        }
        description="Report card of test and examination results."
        titleClassName="text-4xl font-black tracking-tight"
        descriptionClassName="text-lg font-medium"
        actions={
          <SearchField
            wrapperClassName="group max-w-md"
            iconClassName="left-4 size-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary"
            className="h-14 rounded-2xl pl-12 pr-4 bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg placeholder:text-muted-foreground/30"
            placeholder="Search topic or subject..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        }
      />

      <ResultsStats 
        totalCount={results.length}
        subjectCount={new Set(results.map(r => r.assessment.subject)).size}
        overallAverage={averageScore}
        filteredAverage={filteredAverageScore}
        filteredCount={filteredResults.length}
        loading={loading}
      />

      <PageSection className="border-t border-border/50 pt-6">
        <SectionHeader
          title="Exam List"
          description="Detailed breakdown of your exam scores."
          className="[&_h2]:text-xl [&_h2]:font-black"
          actions={
           
           <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Type</span>
                  <Select value={assessmentTypeFilter} onValueChange={setAssessmentTypeFilter}>
                    <SelectTrigger className="h-11 min-w-[160px] rounded-xl bg-muted/20 border-border/40 font-bold">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                      <SelectItem value="all">All Types</SelectItem>
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
                      <SelectItem value="all">All Subjects</SelectItem>
                      {resultSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
           </div>
          }
        />

        {filteredResults.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-16" />}
            title="No Records Matched"
            description="Adjust your criteria or check back after the next results."
            className="rounded-[2.5rem] border-2 border-border/40 py-24"
          />
        ) : (
          <Grid className="animate-in fade-in duration-700">
            {filteredResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </Grid>
        )}
      </PageSection>
    </PageContainer>
  );
}
