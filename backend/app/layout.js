export const metadata = {
  title: "Clonytweet Backend",
  description: "API service for Clonytweet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
