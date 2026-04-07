"use client"

import React from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle2, Clock, Download, Eye, FileText, Loader2, Search, Upload, X } from "lucide-react"

import { TeacherAssignmentManager } from "@/features/assignments/components/TeacherAssignmentManager"
import { TeacherGradingView } from "@/features/grading/components/TeacherGradingView"
import { ChatImagePreview } from "@/components/chat-image-preview"

import { fmtDate, isImageFile, getImageMimeType, getStatusBadgeVariant } from "./utils"
import { useAssignments } from "./hooks/useAssignments"
import { AssignmentCard } from "./components"

export default function AssignmentsPage() {
  const {
    searchQuery,
    setSearchQuery,
    userRole,
    assignments,
    loading,
    submitting,
    submitAssignment,
    setSubmitAssignment,
    viewAssignment,
    setViewAssignment,
    submissionComment,
    setSubmissionComment,
    selectedFile,
    filePreviewUrl,
    handleFileSelect,
    clearFileSelection,
    handleSubmit,
    filteredAssignments,
  } = useAssignments()

  if (loading) {
    return (
      <DashboardContent>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
        </div>
      </DashboardContent>
    )
  }

  if (userRole === "teacher" || userRole === "admin") {
    return (
      <DashboardContent className="max-w-[1400px]">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Assignment Management</h1>
          <p className="text-muted-foreground font-medium mt-1">Create assignments and grade student submissions.</p>
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
            <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
            <TabsTrigger value="grade">Grade Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="manage" className="mt-0">
            <TeacherAssignmentManager />
          </TabsContent>
          <TabsContent value="grade" className="mt-0">
            <TeacherGradingView />
          </TabsContent>
        </Tabs>
      </DashboardContent>
    )
  }

  const upcomingAssignments = filteredAssignments.filter((a) => !a.submission)
  const previousAssignments = filteredAssignments.filter((a) => a.submission)

  return (
    <DashboardContent className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Assignments</h1>
          <p className="mt-2 text-lg text-muted-foreground">Keep track of your homework and submissions.</p>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Upcoming ({upcomingAssignments.length})</h2>
          <div className="grid gap-4">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isPrevious={false}
                  setViewAssignment={setViewAssignment}
                  setSubmitAssignment={setSubmitAssignment}
                />
              ))
            ) : (
              <Card className="border-border/60 bg-muted/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-brand-mint" />
                  <p className="text-lg font-semibold">You're all caught up!</p>
                  <p className="text-sm">No pending assignments found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-muted-foreground">
            Previous ({previousAssignments.length})
          </h2>
          <div className="grid gap-4">
            {previousAssignments.length > 0 ? (
              previousAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isPrevious={true}
                  setViewAssignment={setViewAssignment}
                  setSubmitAssignment={setSubmitAssignment}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic pl-2">No previous assignments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Assignment Drawer */}
      <Drawer
        open={!!submitAssignment}
        onOpenChange={(open) => {
          if (!open) {
            setSubmitAssignment(null)
            clearFileSelection()
            setSubmissionComment("")
          }
        }}
      >
        <DrawerContent className="mx-auto max-w-2xl px-6 py-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl">Submit Assignment</DrawerTitle>
            <DrawerDescription className="text-base">
              You are submitting work for <strong>{submitAssignment?.title}</strong>
            </DrawerDescription>
          </DrawerHeader>

          <div className="my-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Answer / Comments
              </label>
              <Textarea
                placeholder="Type your response or comments here..."
                className="min-h-[150px] resize-none border-2 bg-muted/30 p-4 text-base"
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Attachment (Optional)
              </label>
              {!selectedFile ? (
                <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 py-12 transition-colors hover:border-brand-orange/50 hover:bg-brand-orange/5">
                  <div className="rounded-full bg-brand-orange/10 p-4 text-brand-orange transition-transform group-hover:scale-110">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-foreground">Click to upload file</p>
                  <p className="text-sm text-muted-foreground">PDF, Word, Images up to 10MB</p>
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="relative flex items-center justify-between rounded-xl border-2 border-brand-orange/20 bg-brand-orange/5 p-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="rounded-lg bg-brand-orange/20 p-3 text-brand-orange">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFileSelection}
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="flex-row gap-4 px-0">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl h-12 text-base font-bold">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1 rounded-xl h-12 bg-brand-orange text-base font-bold text-white shadow-lg hover:bg-brand-orange/90"
              onClick={handleSubmit}
              disabled={submitting || (!submissionComment.trim() && !selectedFile)}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {submitting ? "Submitting..." : "Submit Work"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewAssignment} onOpenChange={(open) => !open && setViewAssignment(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {viewAssignment && (
            <div className="flex flex-col h-full">
              <div className="bg-muted p-8 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="bg-background">{viewAssignment.course?.name || "General"}</Badge>
                  <Badge variant={getStatusBadgeVariant(viewAssignment.status)}>
                    {viewAssignment.status || "incomplete"}
                  </Badge>
                </div>
                <DialogTitle className="text-3xl font-black leading-tight mb-2">
                  {viewAssignment.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Due {fmtDate(viewAssignment.dueDate)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Posted {fmtDate(viewAssignment.createdAt)}</span>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-background">
                <div className="space-y-4">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Instructions</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-base">
                    <p className="whitespace-pre-wrap">{viewAssignment.description}</p>
                  </div>
                </div>

                {viewAssignment.attachmentUrl && (
                  <div className="space-y-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Attached Material</h4>

                    {isImageFile(viewAssignment.attachmentUrl) ? (
                      <div className="overflow-hidden rounded-2xl border-2 border-border/50">
                        <ChatImagePreview
                          url={viewAssignment.attachmentUrl}
                          mimeType={getImageMimeType(viewAssignment.attachmentUrl)}
                          className="w-full h-auto object-cover max-h-[400px]"
                        />
                      </div>
                    ) : (
                      <a
                        href={viewAssignment.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 rounded-2xl border-2 border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50 hover:border-primary/50 group"
                      >
                        <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:scale-110 transition-transform">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">Reference Material</p>
                          <p className="text-sm text-muted-foreground">Click to view/download attachment</p>
                        </div>
                        <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </a>
                    )}
                  </div>
                )}

                {viewAssignment.submission && (
                  <div className="mt-8 rounded-2xl border-2 border-brand-mint/20 bg-brand-mint/5 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-brand-mint" />
                      <h4 className="font-bold text-brand-mint">Your Submission</h4>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-foreground bg-background p-4 rounded-xl border">
                        {viewAssignment.submission.content || "No comments provided."}
                      </p>

                      {viewAssignment.submission.fileUrl && (
                        <a
                          href={viewAssignment.submission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline bg-brand-orange/10 px-4 py-2 rounded-lg"
                        >
                          <FileText className="h-4 w-4" />
                          View Submitted File
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {viewAssignment.grade && (
                  <div className="mt-8 rounded-2xl border-2 border-green-500/20 bg-green-500/5 p-6">
                    <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 rounded-md">Grade Received</div>
                    </h4>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-black text-green-600">{viewAssignment.grade.grade}</span>
                      <span className="text-xl font-bold text-green-600/50 pb-1">/ 100</span>
                    </div>
                    {viewAssignment.grade.feedback && (
                      <div className="bg-background rounded-xl p-4 border border-green-500/20">
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Teacher Feedback</p>
                        <p className="text-sm italic text-foreground">"{viewAssignment.grade.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  )
}
