import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle, Minus, Plus, Loader2 } from "lucide-react";
import { getSubjectProgressPercent } from "@/lib/subject-progress";

export function ClassProgressHub({
  courseLoading,
  selectedCourse,
  chapterProgressDraft,
  teacherSubjects,
  savingChapterProgress,
  hasChapterDraftChanges,
  onUpdateProgress,
  onSave,
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-orange" />
          Class Progress Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courseLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin h-5 w-5 text-muted-foreground/40" />
          </div>
        ) : selectedCourse ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Chapter Progress
              </p>
              <Button
                size="sm"
                onClick={onSave}
                disabled={!hasChapterDraftChanges || savingChapterProgress}
              >
                {savingChapterProgress ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : null}
                Save
              </Button>
            </div>
            <div className="space-y-3">
              {teacherSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/60 rounded-2xl bg-muted/20">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    No subjects assigned yet
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    Please contact the admin to assign subjects to your profile.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredProgress = chapterProgressDraft.filter(
                    (entry) => teacherSubjects.includes(entry.subject),
                  );
                  if (filteredProgress.length === 0) {
                    return (
                      <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                        None of your assigned subjects are in this class.
                      </div>
                    );
                  }
                  return filteredProgress.map((entry) => (
                    <div
                      key={entry.subject}
                      className="p-4 border border-border/50 rounded-2xl bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <Badge className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {entry.subject}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-background rounded-lg border border-border/50 p-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                  onUpdateProgress(
                                    entry.subject,
                                    "completedChapters",
                                    Math.max(0, entry.completedChapters - 1),
                                  )
                                }
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <div className="w-10 text-center">
                                <span className="text-sm font-bold">
                                  {entry.completedChapters}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={() =>
                                  onUpdateProgress(
                                    entry.subject,
                                    "completedChapters",
                                    Math.min(
                                      entry.totalChapters,
                                      entry.completedChapters + 1,
                                    ),
                                  )
                                }
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <span className="text-muted-foreground font-medium">
                              /
                            </span>
                            <Input
                              type="number"
                              className="h-8 w-14 text-center font-bold bg-background border-border/50 focus-visible:ring-primary/30"
                              value={entry.totalChapters}
                              onChange={(e) =>
                                onUpdateProgress(
                                  entry.subject,
                                  "totalChapters",
                                  Math.max(0, parseInt(e.target.value) || 0),
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                          <span>Progress</span>
                          <span>{getSubjectProgressPercent(entry)}%</span>
                        </div>
                        <Progress
                          value={getSubjectProgressPercent(entry)}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground text-sm italic">
            Select a class
          </p>
        )}
      </CardContent>
    </Card>
  );
}
