"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, Users, AlertTriangle, Activity, Layers } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getSample } from "../lib/api";

type Data = any;

function Card({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSample().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <main className="p-10">{error}</main>;
  if (!data) return <main className="p-10">Loading CustomerIQ...</main>;

  const chart = data.churn?.risk_distribution || [];

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">CustomerIQ</h1>
            <p className="text-sm text-slate-500">Customer intelligence & retention</p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Upload size={17} />
            Upload Data
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Customer Intelligence Dashboard</h2>
          <p className="mt-1 text-slate-500">
            Understand customers, identify risk, and find retention opportunities.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <Card title="Total Customers" value={data.kpis.total_customers.toLocaleString()} icon={Users} />
          <Card title="High Risk" value={data.kpis.high_risk_customers.toLocaleString()} icon={AlertTriangle} />
          <Card title="Churn Rate" value={data.kpis.churn_rate != null ? `${data.kpis.churn_rate}%` : "N/A"} icon={Activity} />
          <Card title="Segments" value={data.segmentation?.count ?? "N/A"} icon={Layers} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Risk Distribution</h3>
            <div className="h-72">
              {chart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                      {chart.map((_: any, index: number) => (
                        <Cell key={index} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  No churn label detected.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Platform Status</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="font-semibold">Data Quality</div>
                <div className="mt-1 text-sm text-slate-500">
                  {data.analytics.missing_values} missing values · {data.analytics.duplicate_rows} duplicate rows
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="font-semibold">Churn Model</div>
                <div className="mt-1 text-sm text-slate-500">
                  {data.churn.available
                    ? `Trained successfully · test accuracy ${Math.round(data.churn.accuracy * 100)}%`
                    : data.churn.reason}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="font-semibold">Segmentation</div>
                <div className="mt-1 text-sm text-slate-500">
                  {data.segmentation.available
                    ? `${data.segmentation.count} customer segments generated`
                    : data.segmentation.reason}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Highest Risk Customers</h3>
              <p className="text-sm text-slate-500">Customers with the highest predicted churn probability.</p>
            </div>
            <Link href="/upload" className="text-sm font-semibold text-blue-600">
              Analyze another dataset →
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            {data.churn.risk_customers?.length ? (
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Risk</th>
                    <th className="px-3 py-3">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {data.churn.risk_customers.map((customer: any, index: number) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="px-3 py-3 font-medium">
                        {customer.customer_id || `Customer ${index + 1}`}
                      </td>
                      <td className="px-3 py-3">
                        {Math.round(customer.risk_probability * 100)}%
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          {customer.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-xl bg-slate-50 p-5 text-slate-500">
                Upload a dataset with a churn label to enable customer risk prediction.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
