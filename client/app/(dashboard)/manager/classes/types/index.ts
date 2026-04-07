import { ClassTimetableEntry, Course } from "@/services/api/client";

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
};

export const standardOptions = [
  "1st Standard",
  "2nd Standard",
  "3rd Standard",
  "4th Standard",
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
  "9th Standard",
  "10th Standard",
  "11th Standard",
  "12th Standard",
  "FY BSc",
  "SY BSc",
  "TY BSc",
  "FY BCom",
  "SY BCom",
  "TY BCom",
  "FY BA",
  "SY BA",
  "TY BA",
  "FY BCA",
  "SY BCA",
  "TY BCA",
];

export const emptyForm: ClassFormState = {
  name: "",
  description: "",
  standard: "",
  subjectsText: "",
  feePerStudent: "",
  durationValue: "",
  durationUnit: "months",
  studentCapacity: "",
  timetable: [],
};
