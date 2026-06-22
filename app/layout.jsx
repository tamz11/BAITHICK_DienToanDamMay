import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { AuthProvider } from "@/app/AuthProvider";
import ProductFetcher from "@/components/ProductFetcher";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "GoCart. - Shop smarter",
    description: "GoCart. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <AuthProvider>
                    <StoreProvider>
                        <ProductFetcher />
                        <Toaster />
                        {children}

                            {/* Zoho SalesIQ Integration - Chat với Staff bằng tiếng Việt */}
                        <Script id="zoho-salesiq-init" strategy="afterInteractive">
                            {`
                                window.$zoho=window.$zoho || {};
                                $zoho.salesiq=$zoho.salesiq||{
                                    ready:function(){
                                        $zoho.salesiq.language("vi");
                                    }
                                }
                            `}
                        </Script>
                        <Script
                            id="zsiqscript"
                            src="https://salesiq.zohopublic.com/widget?wc=siq2d52c4f445a65aa78b63628be4aaab90"
                            strategy="afterInteractive"
                        />
                    </StoreProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
