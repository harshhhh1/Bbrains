/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Upload } from "lucide-react";

export function ImportUsersDialog({
  open,
  onClose,
  onImport,
  submitting,
  progress,
  result,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        open ? "flex" : "hidden"
      }`}
      aria-hidden={open ? "false" : "true"}
      role="dialog"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 text-white shadow-primary/10">
        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Import Users from CSV
            </h2>
            <p className="text-gray-400 mt-2 text-sm font-medium">
              Batch create student, teacher, or manager accounts with automatic
              provisioning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 group-hover:text-white group-hover:rotate-90 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner group">
              <h3 className="font-bold text-primary text-[11px] mb-3 uppercase tracking-[0.2em]">
                Required Columns
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                {[
                  "firstname",
                  "lastname",
                  "email",
                  "type",
                  "sex",
                  "dob",
                  "courseId",
                ].map((col) => (
                  <code
                    key={col}
                    className="bg-black/40 p-2 rounded-lg border border-primary/20 text-gray-200 font-mono"
                  >
                    {col}
                  </code>
                ))}
              </div>
              <h3 className="font-bold text-gray-500 text-[11px] mb-2 uppercase tracking-[0.2em]">
                Optional Columns
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  "user_id",
                  "phone",
                  "addressLine1",
                  "city",
                  "country",
                  "addressLine2",
                  "state",
                  "postalCode",
                ].map((col) => (
                  <code
                    key={col}
                    className="bg-black/20 p-2 rounded-lg border border-dashed border-white/5 text-gray-500 font-mono group-hover:border-white/10 transition-colors"
                  >
                    {col}
                  </code>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-gray-600 leading-relaxed">
                Columns can be in{" "}
                <span className="text-gray-400">any order</span>. Leave optional
                cells blank to set them to null. Provide{" "}
                <code className="text-gray-400">user_id</code> to use your own
                unique identifier, or leave blank for an auto-generated one.
              </p>
            </div>

            <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20 text-xs">
              <h3 className="font-bold text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Validation Rules
              </h3>
              <ul className="space-y-3 text-amber-200/60 font-medium">
                <li className="flex justify-between">
                  <span className="text-amber-500/80">type</span>{" "}
                  <span>student, teacher, or manager</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-amber-500/80">sex</span>{" "}
                  <span>male, female, or other</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-amber-500/80">dob</span>{" "}
                  <span>YYYY-MM-DD format</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-amber-500/80">user_id</span>{" "}
                  <span>any unique string value</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-amber-500/80">courseId</span>{" "}
                  <span>numerical ID of the class</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/20 text-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                <svg
                  className="w-12 h-12 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2H6Z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-400 mb-3 uppercase tracking-wider">
                System Handling
              </h3>
              <p className="text-blue-200/50 mb-4 leading-relaxed">
                The system will automatically provision these fields to ensure
                security and consistency:
              </p>
              <ul className="space-y-2 text-blue-200/80 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" /> Username
                  generated from name + DOB
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" /> Default
                  password matches username
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" /> Starting
                  wallet balance: 5,000 BB
                </li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-primary/50 transition-all group bg-white/[0.02] cursor-pointer relative overflow-hidden h-[210px] flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={onImport}
                className="hidden"
              />

              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center relative z-10"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all mb-4 shadow-2xl shadow-primary/20">
                  <Upload className="h-7 w-7" />
                </div>
                <span className="text-xl font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                  {submitting ? "Processing file..." : "Drop CSV Here"}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black group-hover:text-gray-400">
                  Select from device
                </span>
              </label>
            </div>
          </div>
        </div>

        {submitting && (
          <div className="space-y-5 p-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-primary/30 w-full animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div>
                  <p className="font-bold text-white">Importing Data...</p>
                  <p className="text-xs text-gray-500">
                    Creating users and securing accounts
                  </p>
                </div>
              </div>
              <span className="text-3xl font-black text-primary tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden border border-white/5 p-1">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(var(--primary),0.6)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {result && !submitting && (
          <div
            className={`p-8 rounded-3xl border flex items-start gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in-0 duration-700 ${
              result.error
                ? "bg-red-500/[0.08] border-red-500/30"
                : "bg-emerald-500/[0.08] border-emerald-500/30"
            }`}
          >
            <div
              className={`mt-1 rounded-2xl p-3 flex-shrink-0 shadow-lg ${result.error ? "bg-red-500/20 text-red-500 shadow-red-500/10" : "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10"}`}
            >
              {result.error ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM13.707 9.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 111.414-1.414L10 11.793l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-black text-xl tracking-tight ${result.error ? "text-red-400" : "text-emerald-400"}`}
              >
                {result.error ? "Import Halted" : "Batch Protocol Successful"}
              </p>
              <p
                className={`mt-2 font-medium leading-relaxed ${result.error ? "text-red-200/60" : "text-emerald-200/60"}`}
              >
                {result.error
                  ? `Failure at row ${result.error.row}: ${result.error.message}. Please verify the CSV structure and try again.`
                  : `Successfully initialized ${result.successCount} users. The digital registry has been updated and students can now log in with their generated credentials.`}
              </p>
              {!result.error && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 hover:bg-emerald-500 text-sm font-bold transition-all hover:text-white"
                >
                  Refresh Directory
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
