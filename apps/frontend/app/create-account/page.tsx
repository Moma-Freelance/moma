'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, Lock, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CreateAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      {/* Back Button */}
      <Link href="/" className="inline-block mb-8 p-2 shadow-md text-[#171717]  rounded-full border border-gray-100 hover:bg-gray-50 transition-colors">
        <ArrowLeft size={20} />
      </Link>

      <div className="max-w-sm mx-auto">
        <h1 className="text-[32px] font-bold text-black mb-3">Create your account</h1>
        <p className="text-[#666D80] text-[15px] mb-8">
          Start turning project payments into a steady salary.
        </p>

        {/* Form */}
        <form className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-[#171717] font-medium text-[14px] mb-2">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-[#28C7AC]" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 text-[#171717]  pr-4 py-3 border-2 border-[#28C7AC] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20"
                placeholder="sarah.adeyemi@gmail.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[#171717] font-medium text-[14px] mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-[#666D80]" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 text-[#171717]  pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20"
                placeholder="••••••••••••"
              />
              <EyeOff className="absolute right-4 top-3.5 text-[#666D80]" size={20} />
            </div>
            <div className="flex items-center gap-2 mt-3 text-[#28C7AC] text-[13px]">
              <CheckCircle2 size={16} />
              <span className="font-medium">Strong — 8+ characters with a number</span>
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-black rounded border-gray-300" />
            <span className="text-[14px] text-gray-700">
              I agree to Moma's <a href="#" className="font-bold underline text-[#28C7AC]">Terms of Service</a> and <a href="#" className="font-bold underline text-[#28C7AC]">Privacy Policy</a>.
            </span>
          </label>

          {/* Submit */}
         <Link
          href="/verify-account" // Links to the Create Account route
          className="w-full bg-black text-white font-bold text-[16px] py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black-100 transition-colors mb-6 active:scale-[0.98]"
        >
          Create Account <ArrowRight size={20} strokeWidth={2.5} />
        </Link>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[14px]"><span className="bg-white px-4 text-[#666D80]">or</span></div>
        </div>

        {/* Google Auth */}
        <button className="w-full text-[#171717]  border-2 border-gray-100 py-4 rounded-full flex items-center justify-center gap-3 font-semibold hover:bg-gray-50 transition-colors">
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}