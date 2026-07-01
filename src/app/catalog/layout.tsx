import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg-deep)" }}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
