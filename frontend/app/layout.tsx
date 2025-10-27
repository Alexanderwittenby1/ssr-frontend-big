
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavbarServer from "@/components/NavbarServer";




export default async function RootLayout({children,}: {children: React.ReactNode;}) {

  
  return (
    <html lang="sv">
      <body >
     
          <div className="flex flex-col">
            <div className="flex flex-1">
              <main className="flex-1 overflow-auto">
                <NavbarServer />
                {children}
                <Toaster position="bottom-right" reverseOrder={false} />
              </main>
            </div>
          </div>
       
      </body>
    </html>
  );
}
