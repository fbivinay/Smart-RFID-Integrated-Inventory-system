import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import LayoutShell from "@/components/LayoutShell";

const title = "Trend Trackers | Smart RFID Inventory";
const description = "Retail analytics dashboard for Texs Mart RFID inventory intelligence.";
const shareDescription =
  "Every garment carries an RFID tag: live rack status, misplacement and theft alerts, analytics and an AI assistant for the store.";

export const metadata = {
  metadataBase: new URL("https://final-tt-rfid.vercel.app"),
  title,
  description,
  openGraph: {
    type: "website",
    url: "/",
    title,
    description: shareDescription,
    images: [{ url: "/og.png", width: 1440, height: 756 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: shareDescription,
    images: ["/og.png"],
  },
};

// Desktop only: phones and tablets get a message instead of the app. Runs in <head>,
// before anything paints, so the app never flashes on a phone.
const DESKTOP_ONLY_CSS = `
html[data-desktop-only]{display:flex!important;flex-direction:column;align-items:center;justify-content:center;height:100%;margin:0;padding:32px;box-sizing:border-box;overflow:hidden!important;background:#0f172a!important;color:#f1f5f9;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center}
html[data-desktop-only] body{display:none!important}
html[data-desktop-only]::before{content:"Please open this website on a laptop or desktop";max-width:340px;font-size:22px;font-weight:700;line-height:1.3}
html[data-desktop-only]::after{content:"It is built for larger screens and is not available on phones or tablets.";max-width:340px;margin-top:12px;font-size:15px;color:#94a3b8}`;
const DESKTOP_ONLY_JS = `(function(){try{var n=navigator,ua=n.userAgent||"",mq=function(q){return!!(window.matchMedia&&matchMedia(q).matches)};
if((n.userAgentData&&n.userAgentData.mobile)||/Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle|PlayBook|BlackBerry|BB10|Opera Mini|IEMobile|webOS/i.test(ua)||(/Macintosh/.test(ua)&&n.maxTouchPoints>1)||(mq("(pointer: coarse)")&&!mq("(any-pointer: fine)")))document.documentElement.setAttribute("data-desktop-only","")}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script sets data-desktop-only before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: DESKTOP_ONLY_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: DESKTOP_ONLY_JS }} />
      </head>
      <body>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
