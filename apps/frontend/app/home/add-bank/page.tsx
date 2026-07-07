'use client';

import { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddBankAccountPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('0123456789');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home/account-live');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 font-sans max-w-md mx-auto shadow-sm relative flex flex-col justify-between">
      
      {/* Upper Content Container */}
      <div>
        {/* Navigation Top Bar */}
        <div className="flex items-center gap-4 mt-6 mb-6">
          <Link 
            href="/home/complete-profile" 
            className="w-12 h-12 rounded-[16px] border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#171717]" />
          </Link>
          <h1 className="text-[20px] font-bold text-[#171717]">Add bank account</h1>
        </div>

        {/* Subtitle */}
        <p className="text-[#666D80] text-[15px] mb-6 leading-relaxed">
          Your payouts will be sent to this account on your salary schedule.
        </p>

        {/* Security Banner */}
        <div className="bg-[#EAF6F3] border border-[#28C7AC]/20 rounded-2xl p-4 flex gap-3 mb-8">
          <ShieldCheck size={20} className="text-[#28C7AC] shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[#4C7A70] text-[13px] leading-relaxed font-medium">
            Bank details are encrypted end-to-end and used only to send your payouts — never shared with clients.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Bank Dropdown */}
          <div>
            <label className="block text-[#666D80] font-medium text-[14px] mb-2">Bank</label>
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3">
                {/* GTBank Custom Logo Box */}
                <div className="w-8 h-8 bg-[#E35205] rounded-[8px] flex items-center justify-center text-white font-bold text-[13px] tracking-tight">
                  GT
                </div>
                <span className="text-[#171717] font-semibold text-[15px]">GTBank</span>
              </div>
              <ChevronDown size={20} className="text-[#666D80]" />
            </div>
          </div>

          {/* Account Number Input */}
          <div>
            <label className="block text-[#666D80] font-medium text-[14px] mb-2">Account number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-[16px] text-[#171717] font-bold tracking-[0.15em] font-mono focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20 focus:border-[#28C7AC]"
            />
          </div>

          {/* Verified Account Card */}
          <div className="w-full px-4 py-4 bg-white border-2 border-[#28C7AC] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#28C7AC] rounded-full flex items-center justify-center shrink-0">
                <Check size={18} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-[#171717] font-bold text-[15px]">Sarah A. Adeyemi</p>
                <p className="text-[#666D80] text-[13px] mt-0.5">GTBank · account confirmed</p>
              </div>
            </div>
            <div className="bg-[#EAF6F3] text-[#119C84] px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide">
              Verified
            </div>
          </div>

        </form>
      </div>

      {/* Action Footer Button Area */}
      <div className="mt-8 mb-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-[#0F172A] text-white font-bold py-4.5 rounded-full text-[16px] transition-colors hover:bg-zinc-800 active:scale-[0.99]"
        >
          Save bank account
        </button>
      </div>

    </div>
  );
}