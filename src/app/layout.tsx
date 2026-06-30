import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import AuthProvider from "@/components/shared/authProvider";
import FirebaseProvider from "@/components/shared/firebaseProvider";
import ThemeProvider from "@/components/shared/themeProvider";
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
