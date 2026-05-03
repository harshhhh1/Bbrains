export type SemesterSubject = {
  id: string;
  name: string;
  code: string;
  examTotalMarks: number;
};

export type SemesterEntry = {
  id: string;
  semesterNumber: number;
  subjects: SemesterSubject[];
};

export type ClassFormState = {
  name: string;
  description: string;
  standard: string;
  subjectsText: string;
  feePerStudent: string;
  durationValue: string;
  durationUnit: "months" | "years";
  studentCapacity: string;
  timetable: ClassTimetableEntry[];
  semesters: SemesterEntry[];
};

