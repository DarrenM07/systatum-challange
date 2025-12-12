import "./styles.css";

export const metadata = {
  title: "Products API",
  description: "Frontend playground for the Systatum Product API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
