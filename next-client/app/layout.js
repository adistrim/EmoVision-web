import "./globals.css";

export const metadata = {
  title: "EmoVision",
  description: "Emotion detection using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
