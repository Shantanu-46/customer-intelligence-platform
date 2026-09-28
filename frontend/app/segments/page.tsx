import Link from "next/link";

export default function SegmentsPage() {
  return (
    <main className="mx-auto max-w-5xl p-10">
      <Link href="/" className="text-blue-600">← Dashboard</Link>
      <h1 className="mt-8 text-3xl font-bold">Customer Segments</h1>
      <p className="mt-2 text-slate-500">
        K-Means segmentation is already available through the backend API.
      </p>
    </main>
  );
}
