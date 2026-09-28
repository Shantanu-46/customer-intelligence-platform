import "./globals.css";

export const metadata = {
  title: "CustomerIQ",
  description: "AI-powered customer intelligence and retention platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
