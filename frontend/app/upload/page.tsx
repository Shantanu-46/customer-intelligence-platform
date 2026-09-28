"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
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
      const data = await uploadDataset(file);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Upload Customer Data</h1>
        <p className="mt-2 text-slate-500">
          Upload your company customer CSV or Excel file for automated analysis.
        </p>

        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
          <UploadCloud className="mx-auto text-blue-600" size={44} />
          <h2 className="mt-4 text-xl font-bold">Choose your dataset</h2>
          <p className="mt-2 text-sm text-slate-500">CSV, XLSX or XLS · maximum 20 MB</p>

          <input
            className="mx-auto mt-6 block max-w-sm text-sm"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Dataset"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-bold">Analysis Complete</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <Metric label="Customers" value={result.kpis.total_customers} />
              <Metric label="High Risk" value={result.kpis.high_risk_customers} />
              <Metric label="Churn Rate" value={result.kpis.churn_rate != null ? `${result.kpis.churn_rate}%` : "N/A"} />
              <Metric label="Segments" value={result.segmentation?.count ?? "N/A"} />
            </div>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              Open Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
