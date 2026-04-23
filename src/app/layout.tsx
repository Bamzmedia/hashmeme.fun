import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlowSwap | The Radiant Hub for Hedera Memes & Staking",
  description: "Institutional-grade decentralized finance and meme launchpad on Hedera. Discover, launch, and stake verified ledger assets with zero-slippage liquidity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05070a]">
        <WalletProvider>
          <div className="flex-grow">
            {children}
          </div>

          {/* HIGH-FIDELITY PROTOCOL FOOTER */}
          <footer className="z-10 py-12 px-6 border-t border-white/5 bg-[#05070a]/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <div className="p-1 rounded-sm border border-blue-500/40 rotate-45 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">GlowSwap Protocol</span>
                </div>

                <div className="flex flex-wrap justify-center gap-10">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Logic: Radiant</div>
                        <a href="https://hashscan.io/testnet/contract/0.0.3959082" target="_blank" className="block text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]">Swap Router (v2.5)</a>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                        <div className="text-[8px] font-bold text-purple-500 uppercase tracking-widest">Consensus: Active</div>
                        <a href="https://hashscan.io/testnet/topic/0.0.5241085" target="_blank" className="block text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]">Live HCS Ledger</a>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                        <div className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Registry: Public</div>
                        <a href="https://github.com/Bamzmedia/glowswap" target="_blank" className="block text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]">Verified Source</a>
                    </div>
                </div>

                <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em] font-mono">
                    Build v3.0.0 Radiant
                </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
