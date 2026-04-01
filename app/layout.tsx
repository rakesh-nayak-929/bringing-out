import Navbar from "../components/Navbar";

export const metadata = {
  title: "Bringing Out",
  description: "Creator Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}