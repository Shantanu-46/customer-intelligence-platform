import Link from "next/link";

export default function CustomersPage() {
  return (
    <main className="mx-auto max-w-5xl p-10">
      <Link href="/" className="text-blue-600">← Dashboard</Link>
      <h1 className="mt-8 text-3xl font-bold">Customers</h1>
      <p className="mt-2 text-slate-500">
        Customer-level exploration will be expanded in the next version.
      </p>
    </main>
  );
}
