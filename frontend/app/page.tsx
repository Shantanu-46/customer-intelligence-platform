"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Upload,
  Users,
  AlertTriangle,
  Activity,
  Layers,
  BarChart3,
  Target,
  Settings,
  Brain,
  ChevronRight,
  Database,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";


/* =========================
   TYPES
========================= */

type Data = {
  kpis?: {
    total_customers?: number;
    high_risk_customers?: number;
    medium_risk_customers?: number;
    low_risk_customers?: number;
    churn_rate?: number | null;
    total_spend?: number;
  };

  risk_distribution?: {
    high?: number;
    medium?: number;
    low?: number;
  };

  segmentation?: {
    count?: number;
    clusters?: any[];
  };

  top_risk_customers?: any[];

  profiling?: any;

  [key: string]: any;
};


/* =========================
   MAIN DASHBOARD
========================= */

export default function DashboardPage() {

  const [data, setData] = useState<Data | null>(null);

  const [error, setError] = useState("");

  const [filename, setFilename] = useState("");

  const [mounted, setMounted] = useState(false);


  /* =========================
     LOAD UPLOADED DATA
  ========================= */

  useEffect(() => {

    setMounted(true);

    try {

      const savedAnalysis =
        localStorage.getItem("customerIQAnalysis");

      const savedFilename =
        localStorage.getItem("customerIQFilename");

      if (savedAnalysis) {

        const parsedData = JSON.parse(savedAnalysis);

        setData(parsedData);

        setFilename(
          savedFilename || "Uploaded Dataset"
        );

      } else {

        setError(
          "No dataset uploaded yet. Please upload your customer data."
        );

      }

    } catch (e) {

      console.error(e);

      setError(
        "Could not load your uploaded dataset."
      );

    }

  }, []);


  /* =========================
     PREVENT HYDRATION ISSUE
  ========================= */

  if (!mounted) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-sm text-slate-500">
          Loading CustomerIQ...
        </div>

      </div>
    );

  }


  /* =========================
     ERROR STATE
  ========================= */

  if (error || !data) {

    return (
      <main className="flex min-h-screen bg-slate-50">

        <Sidebar />

        <div className="flex flex-1 items-center justify-center px-6">

          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">

              <Database
                size={30}
                className="text-blue-600"
              />

            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              No Dataset Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Upload your company's customer CSV or Excel
              dataset to generate your CustomerIQ dashboard.
            </p>

            <Link
              href="/upload"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Upload size={18} />
              Upload Customer Data
            </Link>

          </div>

        </div>

      </main>
    );

  }


  /* =========================
     KPI VALUES
  ========================= */

  const totalCustomers =
    data.kpis?.total_customers ?? 0;

  const highRisk =
    data.kpis?.high_risk_customers ?? 0;

  const mediumRisk =
    data.kpis?.medium_risk_customers ?? 0;

  const lowRisk =
    data.kpis?.low_risk_customers ?? 0;

  const churnRate =
    data.kpis?.churn_rate != null
      ? `${data.kpis.churn_rate}%`
      : "N/A";

  const segments =
    data.segmentation?.count ?? 0;


  /* =========================
     RISK DATA
  ========================= */

  const riskData = [
    {
      name: "High Risk",
      value: highRisk,
    },
    {
      name: "Medium Risk",
      value: mediumRisk,
    },
    {
      name: "Low Risk",
      value: lowRisk,
    },
  ].filter(
    (item) => item.value > 0
  );


  /* =========================
     SEGMENT DATA
  ========================= */

  const segmentData =
    data.segmentation?.clusters?.map(
      (cluster: any, index: number) => {

        return {
          name:
            cluster?.name ||
            cluster?.segment ||
            `Segment ${index + 1}`,

          customers:
            cluster?.customers ??
            cluster?.count ??
            cluster?.size ??
            0,
        };

      }
    ) || [];


  /* =========================
     TOP RISK CUSTOMERS
  ========================= */

  const topRiskCustomers =
    Array.isArray(data.top_risk_customers)
      ? data.top_risk_customers
      : [];


  return (
    <main className="min-h-screen bg-slate-50">

      <div className="flex min-h-screen">


        {/* =========================
            SIDEBAR
        ========================= */}

        <Sidebar />


        {/* =========================
            MAIN CONTENT
        ========================= */}

        <section className="flex-1 overflow-x-hidden">

          {/* Header */}

          <header className="border-b bg-white">

            <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-medium text-blue-600">
                  Customer Intelligence Platform
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Customer Overview
                </h1>

              </div>


              <div className="flex flex-wrap items-center gap-3">

                {/* Dataset */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 shadow-sm">

                  <span className="font-medium">
                    Dataset:
                  </span>{" "}

                  {filename || "Uploaded Dataset"}

                </div>


                {/* Upload */}
                <Link
                  href="/upload"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >

                  <Upload size={16} />

                  Upload New Dataset

                </Link>

              </div>

            </div>

          </header>


          {/* Dashboard Content */}

          <div className="space-y-8 p-6 lg:p-8">


            {/* =========================
                KPI CARDS
            ========================= */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <MetricCard
                title="Total Customers"
                value={totalCustomers}
                icon={<Users size={22} />}
                description="Customers analyzed"
              />

              <MetricCard
                title="High Risk"
                value={highRisk}
                icon={<ShieldAlert size={22} />}
                description="Customers at high churn risk"
              />

              <MetricCard
                title="Churn Rate"
                value={churnRate}
                icon={<TrendingUp size={22} />}
                description="Estimated customer churn"
              />

              <MetricCard
                title="Segments"
                value={segments}
                icon={<Layers size={22} />}
                description="Customer behavior groups"
              />

            </div>


            {/* =========================
                CHARTS
            ========================= */}

            <div className="grid gap-6 lg:grid-cols-2">


              {/* Risk Distribution */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Churn Risk Distribution
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Customer risk classification
                    </p>

                  </div>

                  <AlertTriangle
                    size={20}
                    className="text-slate-400"
                  />

                </div>


                <div className="mt-6 h-72">

                  {riskData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={riskData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          innerRadius={55}
                          paddingAngle={3}
                        >

                          {riskData.map(
                            (_, index) => (
                              <Cell
                                key={`risk-${index}`}
                              />
                            )
                          )}

                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>

                  ) : (

                    <EmptyChart />

                  )}

                </div>


                <div className="grid grid-cols-3 gap-3">

                  <RiskLegend
                    label="High"
                    value={highRisk}
                  />

                  <RiskLegend
                    label="Medium"
                    value={mediumRisk}
                  />

                  <RiskLegend
                    label="Low"
                    value={lowRisk}
                  />

                </div>

              </div>


              {/* Customer Segments */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Customer Segments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Customers grouped by behavior
                    </p>

                  </div>

                  <BarChart3
                    size={20}
                    className="text-slate-400"
                  />

                </div>


                <div className="mt-6 h-72">

                  {segmentData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={segmentData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="customers"
                          radius={[6, 6, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  ) : (

                    <EmptyChart />

                  )}

                </div>

              </div>

            </div>


            {/* =========================
                PLATFORM INTELLIGENCE
            ========================= */}

            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-slate-900">
                  Platform Intelligence
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Insights generated from your uploaded dataset.
                </p>

              </div>


              <div className="grid gap-5 md:grid-cols-3">

                <InsightCard
                  icon={<Brain size={21} />}
                  title="AI Churn Prediction"
                  text={`${highRisk} customers are currently classified as high risk.`}
                />

                <InsightCard
                  icon={<Target size={21} />}
                  title="Customer Segmentation"
                  text={`CustomerIQ identified ${segments} customer segments from your dataset.`}
                />

                <InsightCard
                  icon={<Activity size={21} />}
                  title="Business Activity"
                  text={`The platform analyzed ${totalCustomers} customer records.`}
                />

              </div>

            </section>


            {/* =========================
                TOP RISK CUSTOMERS
            ========================= */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b p-6">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Highest Risk Customers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Customers requiring attention
                  </p>

                </div>

                <Link
                  href="/customers"
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all
                  <ChevronRight size={16} />
                </Link>

              </div>


              {topRiskCustomers.length > 0 ? (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px]">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Risk
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Score
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Segment
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {topRiskCustomers
                        .slice(0, 8)
                        .map(
                          (
                            customer: any,
                            index: number
                          ) => {

                            const customerId =
                              customer?.customer_id ||
                              customer?.id ||
                              `Customer ${index + 1}`;

                            const risk =
                              customer?.risk ||
                              customer?.risk_level ||
                              "High";

                            const score =
                              customer?.risk_score ??
                              customer?.churn_probability ??
                              customer?.probability ??
                              "N/A";

                            const segment =
                              customer?.segment ||
                              customer?.cluster ||
                              "N/A";


                            return (
                              <tr
                                key={index}
                                className="transition hover:bg-slate-50"
                              >

                                <td className="px-6 py-4">

                                  <div className="font-semibold text-slate-800">
                                    {customerId}
                                  </div>

                                </td>


                                <td className="px-6 py-4">

                                  <RiskBadge
                                    risk={risk}
                                  />

                                </td>


                                <td className="px-6 py-4 text-sm font-medium text-slate-700">

                                  {typeof score === "number"
                                    ? `${(
                                        score > 1
                                          ? score
                                          : score * 100
                                      ).toFixed(1)}%`
                                    : score}

                                </td>


                                <td className="px-6 py-4 text-sm text-slate-600">

                                  {segment}

                                </td>

                              </tr>
                            );

                          }
                        )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="p-10 text-center">

                  <p className="text-sm text-slate-500">
                    No high-risk customer details available.
                  </p>

                </div>

              )}

            </section>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section>

              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Quick Actions
              </h2>


              <div className="grid gap-5 md:grid-cols-3">


                <QuickAction
                  href="/upload"
                  icon={<Upload size={22} />}
                  title="Upload New Dataset"
                  description="Analyze another company's customer data."
                />


                <QuickAction
                  href="/customers"
                  icon={<Users size={22} />}
                  title="View Customers"
                  description="Explore customer-level risk information."
                />


                <QuickAction
                  href="/segments"
                  icon={<Layers size={22} />}
                  title="Explore Segments"
                  description="Understand customer behavior groups."
                />

              </div>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}


/* =========================
   SIDEBAR
========================= */

function Sidebar() {

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">

      <div className="sticky top-0 h-screen">

        {/* Logo */}

        <div className="border-b px-6 py-6">

          <Link
            href="/"
            className="text-xl font-bold text-slate-900"
          >
            Customer<span className="text-blue-600">
              IQ
            </span>
          </Link>

          <p className="mt-1 text-xs text-slate-400">
            Customer Intelligence Platform
          </p>

        </div>


        {/* Navigation */}

        <nav className="space-y-1 p-4">

          <NavItem
            href="/"
            icon={<Activity size={18} />}
            label="Overview"
            active
          />

          <NavItem
            href="/customers"
            icon={<Users size={18} />}
            label="Customers"
          />

          <NavItem
            href="/segments"
            icon={<Layers size={18} />}
            label="Segments"
          />

          <NavItem
            href="/upload"
            icon={<Upload size={18} />}
            label="Upload Data"
          />

          <NavItem
            href="#"
            icon={<AlertTriangle size={18} />}
            label="Churn Risk"
          />

          <NavItem
            href="#"
            icon={<Target size={18} />}
            label="Retention"
          />

          <NavItem
            href="#"
            icon={<Brain size={18} />}
            label="AI Assistant"
          />

          <NavItem
            href="#"
            icon={<Settings size={18} />}
            label="Settings"
          />

        </nav>


        {/* Bottom */}

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-2">

              <Database
                size={17}
                className="text-blue-600"
              />

              <span className="text-sm font-semibold text-slate-700">
                Dataset Connected
              </span>

            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Dashboard is showing analysis from your uploaded dataset.
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}


/* =========================
   NAV ITEM
========================= */

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >

      {icon}

      {label}

    </Link>
  );
}


/* =========================
   METRIC CARD
========================= */

function MetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  description: string;
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

        </div>


        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

          {icon}

        </div>

      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* =========================
   RISK LEGEND
========================= */

function RiskLegend({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* =========================
   INSIGHT CARD
========================= */

function InsightCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

        {icon}

      </div>

      <h3 className="mt-5 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* =========================
   QUICK ACTION
========================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

          {icon}

        </div>

        <ChevronRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
        />

      </div>

      <h3 className="mt-5 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </Link>
  );
}


/* =========================
   RISK BADGE
========================= */

function RiskBadge({
  risk,
}: {
  risk: string;
}) {

  const normalized =
    String(risk).toLowerCase();


  let classes =
    "bg-slate-100 text-slate-700";


  if (normalized.includes("high")) {

    classes =
      "bg-red-50 text-red-700";

  } else if (normalized.includes("medium")) {

    classes =
      "bg-amber-50 text-amber-700";

  } else if (normalized.includes("low")) {

    classes =
      "bg-emerald-50 text-emerald-700";

  }


  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {risk}
    </span>
  );
}


/* =========================
   EMPTY CHART
========================= */

function EmptyChart() {

  return (
    <div className="flex h-full items-center justify-center">

      <div className="text-center">

        <BarChart3
          size={32}
          className="mx-auto text-slate-300"
        />

        <p className="mt-3 text-sm text-slate-400">
          No chart data available
        </p>

      </div>

    </div>
  );
}