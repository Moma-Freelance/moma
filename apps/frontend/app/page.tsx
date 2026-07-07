'use client';

import { useState } from 'react';
import { IdCard, Users, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

export default function Onboarding() {
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');

  return (
    <div className="min-h-screen bg-[#0A110E] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Subtle Background Glow behind the logo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#28C7AC] rounded-full blur-[140px] opacity-15 pointer-events-none"></div>

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        {/* Logo Icon */}
        <div className="w-[72px] h-[72px] bg-[#28C7AC] rounded-[1.25rem] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(40,199,172,0.2)]">
          <span className="text-black text-4xl font-extrabold tracking-tighter mt-1">
            m
          </span>
        </div>

        {/* Brand & Tagline */}
        <h1 className="text-white text-[32px] font-bold mb-3 tracking-tight">
          Moma
        </h1>
        <p className="text-[#8BA39B] text-center text-[15px] mb-12 max-w-[280px] leading-relaxed">
          Turn irregular freelance income into a steady, salary-like payout.
        </p>

        {/* Role Selection Group */}
        <div className="w-full mb-8">
          <p className="text-[#8BA39B] text-[13px] font-medium mb-3">
            I'm joining as a...
          </p>

          <div className="flex flex-col gap-3">
            {/* Freelancer Option */}
            <button
              onClick={() => setRole('freelancer')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-[1.5px] transition-all duration-200 ${role === 'freelancer'
                  ? 'bg-[#15201C] border-[#28C7AC]'
                  : 'bg-[#15201C] border-transparent opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${role === 'freelancer' ? 'bg-[#1E3029] text-[#28C7AC]' : 'bg-[#1E2724] text-[#647971]'
                    }`}
                >
                  <IdCard size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-[15px]">Freelancer</p>
                  <p className="text-[#8BA39B] text-[13px] mt-0.5">Get paid like a salary</p>
                </div>
              </div>
              {role === 'freelancer' ? (
                <CheckCircle2 size={24} className="text-[#28C7AC]" fill="#28C7AC" color="#15201C" />
              ) : (
                <Circle size={24} className="text-[#364741]" strokeWidth={1.5} />
              )}
            </button>

            {/* Client Option */}
            <button
              onClick={() => setRole('client')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-[1.5px] transition-all duration-200 ${role === 'client'
                  ? 'bg-[#15201C] border-[#28C7AC]'
                  : 'bg-[#15201C] border-transparent opacity-80 hover:opacity-100'
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${role === 'client' ? 'bg-[#1E3029] text-[#28C7AC]' : 'bg-[#1E2724] text-[#647971]'
                    }`}
                >
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-[15px]">Client</p>
                  <p className="text-[#8BA39B] text-[13px] mt-0.5">Pay freelancers easily</p>
                </div>
              </div>
              {role === 'client' ? (
                <CheckCircle2 size={24} className="text-[#28C7AC]" fill="#28C7AC" color="#15201C" />
              ) : (
                <Circle size={24} className="text-[#364741]" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <Link
          href="/create-account" // Links to the Create Account route
          className="w-full bg-white text-black font-bold text-[16px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-6 active:scale-[0.98]"
        >
          Continue <ArrowRight size={20} strokeWidth={2.5} />
        </Link>

        {/* Footer Login Link */}
        <p className="text-[#8BA39B] text-[14px]">
          Already have an account?{' '}
          <Link href="/signin" className="text-[#28C7AC] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}