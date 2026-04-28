import { api } from "./base";

export const academicApi = {
  getCourses: () => api.get<any[]>("/courses"),
  getCourseStudents: (courseId: number | string) => api.get<any[]>(`/courses/${courseId}/students`),
  getCourseTeachers: (courseId: number | string) => api.get<any[]>(`/courses/${courseId}/teachers`),
  createCourse: (data: any) => api.post<any>("/courses", data),
  updateCourse: (id: number | string, data: any) => api.put<any>(`/courses/${id}`, data),
  deleteCourse: (id: number | string) => api.delete<any>(`/courses/${id}`),
  
  getAssignments: () => api.get<any[]>("/academic/assignments"),
  createAssignment: (data: any) => api.post<any>("/academic/assignments", data),
  updateAssignment: (id: string | number, data: any) => api.put<any>(`/academic/assignments/${id}`, data),
  deleteAssignment: (id: string | number) => api.delete<any>(`/academic/assignments/${id}`),
  submitAssignment: (data: any) => api.post<any>("/academic/assignments/submit", data),
  getMySubmissions: () => api.get<any[]>("/academic/assignments/submissions/my"),
  getAssignmentSubmissions: (assignmentId: string | number) => api.get<any[]>(`/academic/assignments/${assignmentId}/submissions`),
  reviewSubmission: (submissionId: string | number, data: any) => api.post<any>(`/academic/assignments/submissions/${submissionId}/review`, data),
  
  getAssessments: () => api.get<any[]>("/academic/assessments"),
  getTeacherAssessments: () => api.get<any[]>("/academic/assessments/teacher"),
  getAssessmentSetup: (params?: any) => api.get<any>("/academic/assessments/setup", { params }),
  getSetup: (params?: any) => api.get<any>("/academic/assessments/setup", { params }),
  createAssessment: (data: any) => api.post<any>("/academic/assessments", data),
  updateAssessment: (id: string | number, data: any) => api.put<any>(`/academic/assessments/${id}`, data),
  getMyResults: () => api.get<any[]>("/academic/assessments/my"),
  
  getAttendance: (date: string) => api.get<any[]>(`/attendance?date=${date}`),
  getAttendanceByDate: (date: string) => api.get<any[]>(`/attendance?date=${date}`),
  markAttendance: (data: any) => api.post<any>("/attendance", data),
  markAttendanceBulk: (data: any) => api.post<any>("/attendance/bulk", data),
  getStudentAttendanceHistory: (studentId: string) => api.get<any[]>(`/attendance/student/${studentId}`),
  getStudentHistory: (studentId: string) => api.get<any[]>(`/attendance/student/${studentId}`),
  getMyAchievements: () => api.get<any[]>("/achievements/me"),
  
  enroll: (courseId: number | string) => api.post<any>("/enrollments", { courseId }),
  getMyEnrollments: () => api.get<any[]>("/enrollments/me"),
};
