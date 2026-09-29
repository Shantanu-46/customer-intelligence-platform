"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { uploadDataset } from "../../lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      setError("Please select a CSV or Excel file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Send file to FastAPI backend
      const data = await uploadDataset(file);

      // Save analysis result in browser
      localStorage.setItem(
        "customerIQAnalysis",
        JSON.stringify(data)
      );

      // Save uploaded filename
      localStorage.setItem(
        "customerIQFilename",
        file.name
      );

      // Show result on upload page
      setResult(data);
    } catch (e: any) {
      setError(
        e?.message || "Something went wrong while analyzing the dataset."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearUpload() {
    setFile(null);
    setResult(null);
    setError("");

    localStorage.removeItem("customerIQAnalysis");
    localStorage.removeItem("customerIQFilename");
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="font-bold text-slate-900">
            Customer<span className="text-blue-600">IQ</span>
          </div>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Customer Intelligence
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Upload Customer Data
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Upload your company's customer dataset and CustomerIQ will
            automatically analyze customer behavior, churn risk and
            customer segments.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition hover:border-blue-400">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <UploadCloud
                size={34}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Upload your customer dataset
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Supported formats: CSV, XLSX and XLS
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Maximum file size: 20 MB
            </p>

            {/* File Input */}
            <div className="mx-auto mt-7 max-w-md">

              <label
                htmlFor="customer-file"
                className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
              >
                <FileSpreadsheet size={20} className="text-blue-600" />

                {file ? file.name : "Choose Customer Dataset"}

              </label>

              <input
                id="customer-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                  setResult(null);
                }}
              />

            </div>

            {/* Selected File */}
            {file && (
              <div className="mx-auto mt-5 max-w-md rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={20}
                    className="text-blue-600"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-7 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing Dataset..."
                : "Analyze Dataset"}
            </button>

            {/* Error */}
            {error && (
              <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

          </div>
        </div>

        {/* Analysis Result */}
        {result && (
          <div className="mt-8">

            <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">

              {/* Success */}
              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2
                    size={26}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Analysis Complete
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    CustomerIQ successfully analyzed{" "}
                    <span className="font-semibold text-slate-700">
                      {file?.name}
                    </span>
                  </p>
                </div>

              </div>

              {/* Metrics */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Metric
                  label="Total Customers"
                  value={result?.kpis?.total_customers ?? 0}
                />

                <Metric
                  label="High Risk"
                  value={result?.kpis?.high_risk_customers ?? 0}
                />

                <Metric
                  label="Churn Rate"
                  value={
                    result?.kpis?.churn_rate != null
                      ? `${result.kpis.churn_rate}%`
                      : "N/A"
                  }
                />

                <Metric
                  label="Segments"
                  value={result?.segmentation?.count ?? "N/A"}
                />

              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  href="/"
                  className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Open Dashboard
                </Link>

                <button
                  onClick={clearUpload}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Upload Another Dataset
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}


/* Metric Card */
function Metric({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}
