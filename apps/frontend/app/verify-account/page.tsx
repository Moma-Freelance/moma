'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';



export default function VerifyAccount() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(42);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Countdown timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <Link href="/signup" className="inline-block mb-8 p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors">
        <ArrowLeft size={20} />
      </Link>

      <div className="max-w-sm mx-auto text-center">
        <div className="bg-[#F2FBF9] w-16 h-16 rounded-2xl flex items-start justify-start mx-auto mb-8 text-[#28C7AC]">
          <Mail size={32} />
        </div>

        <h1 className="text-[32px] font-bold text-black mb-3">Verify your email</h1>
        <p className="text-[#666D80] text-[15px] mb-8">
          Enter the 6-digit code we sent to <br />
          <span className="font-semibold text-black">sarah.adeyemi@gmail.com</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => { inputRefs.current[i] = el; }}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-14 text-[#171717]  h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-[#28C7AC] focus:outline-none focus:ring-1 focus:ring-[#28C7AC]"
            />
          ))}
        </div>

        <p className="text-[#666D80] text-[14px] mb-12">
          🕒 Resend code in <span className="font-bold text-black">0:{timer.toString().padStart(2, '0')}</span>
        </p>

        <button
          onClick={() => router.push('/home')}
          className="w-full bg-black text-white font-bold py-4 rounded-full hover:bg-zinc-800 transition-colors"
        >
          Continue →
        </button>

        <p className="text-[#666D80] text-[14px] mt-6">
          Entered the wrong email?{' '}
          <Link href="/signup" className="text-[#28C7AC] font-semibold hover:underline">
            Change
          </Link>
        </p>
      </div>
    </div>
  );
}