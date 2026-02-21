import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Best Outgoing Student | SRM IST KTR",
  description:
    "Best Outgoing Student Award Portal - SRM Institute of Science and Technology, Kattankulathur. Apply, showcase your achievements, and be recognized.",
  keywords: ["SRM", "Best Outgoing Student", "SRM IST", "Kattankulathur", "Award"],
  openGraph: {
    title: "Best Outgoing Student | SRM IST KTR",
    description: "Apply for the Best Outgoing Student Award at SRM IST KTR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <div className="animated-bg" />
        {children}
      </body>
    </html>
  );
}
