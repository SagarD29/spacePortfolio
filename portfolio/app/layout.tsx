import "./globals.css";

export const metadata = {
  title: "Sagar Desai — Portfolio",
  description: "Electronic Engineering & ML/Data Automation portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased grain">{children}</body>
    </html>
  );
}
