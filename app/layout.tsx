import './globals.css';
import { AuthProvider } from "./context/authcontext";
export const metadata = {
  title: 'Buyer Lead Intake',
  description: 'Mini buyer lead app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
      
    </html>
  );
}
