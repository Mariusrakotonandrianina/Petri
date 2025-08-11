import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=""
      >
        <div>
          <Header />
        </div>
        <div>
          {children}
        </div>
        <div>
          <Footer/>
        </div>
      </body>
    </html>
  );
}
