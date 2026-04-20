import WalletConnectButton from '@/components/WalletConnectButton';
import Link from 'next/link';
import TrendingGallery from '@/components/TrendingGallery';
import TradeFeed from '@/components/TradeFeed';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col lg:flex-row justify-between max-w-7xl mx-auto w-full px-6 pt-24 pb-16">
        <div className="text-left max-w-2xl lg:pr-10 pt-10">
            <div className="inline-flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10 backdrop-blur-md shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="text-sm font-bold text-gray-300 tracking-wide">Hedera Testnet Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                HashMeme
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-medium max-w-xl">
                The ultimate premium token launchpad on Hedera. Connect your HashPack wallet to start swapping, minting, and launching the next big meme coin.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <WalletConnectButton />
                <Link href="/dashboard">
                    <button className="px-8 py-3 rounded-full font-bold text-md transition-all duration-300 bg-white/5 text-gray-200 hover:bg-white/10 hover:-translate-y-0.5 border border-white/10 shadow-lg">
                    Enter Launchpad
                    </button>
                </Link>
                <Link href="/swap">
                    <button className="px-8 py-3 rounded-full font-bold text-md transition-all duration-300 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 border border-pink-500/30 hover:-translate-y-0.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    DEX Swap
                    </button>
                </Link>
                <Link href="/stake">
                    <button className="px-8 py-3 rounded-full font-bold text-md transition-all duration-300 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 hover:-translate-y-0.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center">
                    Earn HBAR
                    </button>
                </Link>
            </div>
        </div>

        {/* Trade Feed injected into Hero split on Desktop */}
        <div className="w-full max-w-md mt-16 lg:mt-0">
            <TradeFeed />
        </div>
      </section>
      
      {/* Trending Gallery injected below */}
      <section className="relative z-10 w-full bg-black/40 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex-grow">
        <TrendingGallery />
      </section>

      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-[800px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
    </main>
  );
}
