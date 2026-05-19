/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Upload } from "lucide-react";

interface ImportUsersDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  progress: number;
  result: { successCount: number; error?: { row: number; field: string; message: string } } | null;
}

export function ImportUsersDialog({
  open,
  onClose,
  onImport,
  submitting,
  progress,
  result
}: ImportUsersDialogProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        open ? 'flex' : 'hidden'
      }`}
      aria-hidden={open ? 'false' : 'true'}
      role="dialog"
    >
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 text-white">
        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Import Users from CSV</h2>
            <p className="text-gray-400 mt-1 text-xs font-medium">Batch create student, teacher, or manager accounts with automatic provisioning</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-all text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Upload Zone */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-all bg-white/[0.01] cursor-pointer relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
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
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-white mb-1">
                {submitting ? 'Processing file...' : 'Upload CSV File'}
              </span>
              <span className="text-xs text-gray-500">
                Click or drag & drop .csv file here
              </span>
            </label>
          </div>
        </div>

        {/* CSV Format Guide */}
        <div className="space-y-5 text-sm text-gray-300 border-t border-white/5 pt-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">CSV Column Guidelines</h3>
            <p className="text-xs text-gray-400 mb-3">
              The CSV file must contain the required columns. Optional columns can be omitted or left blank.
            </p>
            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-white">Required:</strong>{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">firstname</code>,{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">lastname</code>,{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">email</code>,{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">type</code>,{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">sex</code>,{' '}
                <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">dob</code>
              </p>
              <p>
                <strong className="text-gray-400">Optional:</strong>{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">courseId</code>,{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">user_id</code>,{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">phone</code>,{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">addressLine1</code>,{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">city</code>,{' '}
                <code className="text-gray-300 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">country</code>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2">Accepted Value Formats</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
              <li><strong className="text-gray-300">type:</strong> student, teacher, or manager</li>
              <li><strong className="text-gray-300">sex:</strong> male, female, or other</li>
              <li><strong className="text-gray-300">dob:</strong> YYYY-MM-DD format</li>
              <li><strong className="text-gray-300">courseId:</strong> numerical ID of the course/class</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2">System Behavior</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
              <li>Username is auto-generated using first name and birth year.</li>
              <li>Default password is set to match the generated username.</li>
              <li>New user accounts start with a default wallet balance of 5,000 BB.</li>
            </ul>
          </div>
        </div>
          
        {submitting && (
          <div className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/5 mt-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-0.5 bg-primary/30 w-full animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                 <div>
                   <p className="font-bold text-white text-sm">Importing Data...</p>
                   <p className="text-[10px] text-gray-500">Creating users and securing accounts</p>
                 </div>
              </div>
              <span className="text-2xl font-black text-primary tabular-nums">{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {result && !submitting && (
          <div className={`p-6 rounded-xl border flex items-start gap-4 mt-6 animate-in slide-in-from-bottom-4 fade-in-0 duration-500 ${
            result.error ? 'bg-red-500/[0.08] border-red-500/25' : 'bg-emerald-500/[0.08] border-emerald-500/25'
          }`}>
            <div className={`mt-0.5 rounded-lg p-2 flex-shrink-0 ${result.error ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
              {result.error ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM13.707 9.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 111.414-1.414L10 11.793l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-lg tracking-tight ${result.error ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.error ? 'Import Failed' : 'Import Successful'}
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${result.error ? 'text-red-200/60' : 'text-emerald-200/60'}`}>
                {result.error 
                  ? `Failure at row ${result.error.row}: ${result.error.message}. Please verify the CSV structure and try again.`
                  : `Successfully initialized ${result.successCount} users. The digital registry has been updated and students can now log in with their generated credentials.`}
              </p>
              {!result.error && (
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500 text-xs font-bold transition-all hover:text-white"
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
