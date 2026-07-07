'use client';

import { Check, Copy, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountLivePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A110E] flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-72 h-72 bg-[#28C7AC] rounded-full blur-[140px] opacity-15 pointer-events-none"></div>

      {/* Main Content Centered */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm mx-auto mt-8">
        
        {/* Glowing Success Checkmark */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#28C7AC] blur-xl opacity-20 rounded-full scale-[1.6]"></div>
          <div className="absolute inset-0 bg-[#28C7AC] blur-md opacity-40 rounded-full scale-[1.2]"></div>
          <div className="w-16 h-16 bg-[#28C7AC] rounded-full flex items-center justify-center relative z-10">
            <Check size={32} className="text-[#0A110E]" strokeWidth={3} />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-white text-[32px] font-bold mb-3 tracking-tight text-center">
          Your account is live
        </h1>
        <p className="text-[#8BA39B] text-center text-[15px] mb-10 max-w-[280px] leading-relaxed">
          Clients can now send payments straight to your dedicated Moma account.
        </p>

        {/* Account Details Card */}
        <div className="w-full bg-[#15201C] rounded-[24px] p-6 text-left border border-[#1E2E28]/50 shadow-lg">
          
          {/* Account Name */}
          <div>
            <p className="text-[#647971] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Account Name
            </p>
            <p className="text-white text-[16px] font-semibold">
              Sarah A. Adeyemi
            </p>
          </div>

          <div className="border-t border-[#1E2E28] my-5"></div>

          {/* Account Number */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#647971] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Account Number
              </p>
              <p className="text-white text-[20px] font-bold tracking-[0.12em] font-mono">
                8021 004 931
              </p>
            </div>
            <button className="w-10 h-10 bg-[#1E3029] rounded-xl flex items-center justify-center hover:bg-[#263D34] transition-colors active:scale-95">
              <Copy size={18} className="text-[#28C7AC]" />
            </button>
          </div>

          <div className="border-t border-[#1E2E28] my-5"></div>

          {/* Bank Name */}
          <div>
            <p className="text-[#647971] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Bank
            </p>
            <p className="text-white text-[16px] font-semibold">
              Nomba MFB
            </p>
          </div>

        </div>
      </div>

      {/* Action Footer Button Area */}
      <div className="w-full max-w-sm mx-auto z-10 mb-4 mt-8">
        <button
          onClick={() => router.push('/home')}
          className="w-full bg-white text-black font-bold py-4 rounded-full text-[16px] transition-colors hover:bg-gray-100 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          Go to dashboard <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}