import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import AuthProvider from "@/components/shared/auth-provider";
import FirebaseProvider from "@/components/shared/firebase-provider";
import ThemeProvider from "@/components/shared/theme-provider";
import "./globals.css";

const bodyFont = localFont({
  src: "../../public/fonts/Couse/Cause-VariableFont_wght.ttf",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const headingFont = localFont({
  src: "../../public/fonts/JetBrains/JetBrainsMono[wght].ttf",
  variable: "--font-heading",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sant.Ai | Science, Technology & Artificial Intelligence",
  description:
    "Building the Future Through Science, Technology, and AI — platform kolaborasi proyek antar mahasiswa Fakultas Ilmu Komputer Universitas Saintek Muhammadiyah.",
  openGraph: {
    title: "Sant.Ai | Science, Technology & Artificial Intelligence",
    description:
      "Building the Future Through Science, Technology, and AI — platform kolaborasi proyek antar mahasiswa Fakultas Ilmu Komputer Universitas Saintek Muhammadiyah.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${bodyFont.variable} ${headingFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("sant-ai:theme");if(t==="dark"||(t!="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
        }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <FirebaseProvider>{children}</FirebaseProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
