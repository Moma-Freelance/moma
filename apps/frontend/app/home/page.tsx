'use client';

import { Bell, Check, Lock, ChevronRight, Home, FileText, Wallet, Activity, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function HomePage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24 relative max-w-md mx-auto shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[#0F172A] text-white rounded-full flex items-center justify-center font-semibold text-lg tracking-wide">
                        SA
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#8BA39B] text-[13px] font-medium">Good morning</span>
                        <span className="text-[#171717] font-bold text-[16px]">Sarah Adeyemi</span>
                    </div>
                </div>

                {/* Notification Bell */}
                <div className="relative w-12 h-12 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center">
                    <Bell size={20} className="text-[#171717]" strokeWidth={2} />
                    {/* Notification Dot */}
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full"></div>
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="mx-6 p-6 rounded-[24px] bg-[#EAF6F3] mb-6">
                <h1 className="text-[22px] font-bold text-[#171717] mb-1.5 flex items-center gap-2">
                    Welcome, Sarah <span className="text-2xl">👋</span>
                </h1>
                <p className="text-[#305C53] text-[15px] leading-snug pr-4">
                    A few quick steps and you'll be ready to receive payments.
                </p>
            </div>

            {/* Onboarding Checklist Card */}
            <div className="mx-6 p-6 rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">

                {/* Card Header & Progress Bar */}
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-[18px] font-bold text-[#171717]">Finish setting up</h2>
                    <span className="text-[#28C7AC] text-[15px] font-semibold">1 <span className="text-[#A7F3D0] mx-0.5">/</span> 5</span>
                </div>
                <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden mb-2">
                    <div className="w-1/5 h-full bg-[#28C7AC] rounded-full"></div>
                </div>

                {/* Task 1: Completed */}
                <div className="flex items-center gap-4 py-4">
                    <div className="w-8 h-8 rounded-full bg-[#28C7AC] flex items-center justify-center shrink-0">
                        <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[#9CA3AF] font-medium text-[16px]">Email verified</span>
                </div>

                {/* Task 2: Active */}
                <div className="flex items-center justify-between p-4 bg-[#F2FBF9] border border-[#28C7AC]/30 rounded-[20px] -mx-4 px-4 my-1">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[#28C7AC] flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28C7AC]"></div>
                        </div>
                        <div>
                            <p className="text-[#171717] font-bold text-[15px]">Complete your profile</p>
                            <p className="text-[#4C7A70] text-[13px] mt-0.5">Add your name & profession</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/home/complete-profile')} className="bg-[#0F172A] text-white text-[13px] font-bold px-5 py-2 rounded-full hover:bg-zinc-800 transition-colors">
                        Start
                    </button>
                </div>

                {/* Task 3: Pending */}
                <div className="flex items-center justify-between py-4 border-b border-gray-50/80">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] shrink-0"></div>
                        <p className="text-[#171717] font-bold text-[15px]">Add your bank account</p>
                    </div>
                    <button className="bg-white text-[#171717] border border-[#171717] text-[13px] font-bold px-5 py-2 rounded-full hover:bg-gray-50 transition-colors">
                        Skip
                    </button>
                </div>

                {/* Task 4: Locked */}
                <div className="flex items-center justify-between py-5 border-b border-gray-50/80">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[#F3F4F6] flex items-center justify-center shrink-0">
                            <Lock size={14} className="text-[#D1D5DB]" strokeWidth={2.5} />
                        </div>
                        <p className="text-[#D1D5DB] font-medium text-[15px]">Generate your virtual account</p>
                    </div>
                    <ChevronRight size={18} className="text-[#D1D5DB]" />
                </div>

                {/* Task 5: Locked */}
                <div className="flex items-center gap-4 pt-5 pb-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Lock size={14} className="text-[#D1D5DB]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[#D1D5DB] font-medium text-[15px]">Set up your salary schedule</p>
                        <p className="text-[#E5E7EB] text-[13px] mt-0.5">Unlocks after your first payment</p>
                    </div>
                </div>

            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">

                {/* Home (Active) */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <Home size={22} className="text-[#171717]" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold text-[#171717]">Home</span>
                </div>

                {/* Contracts */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <FileText size={22} className="text-[#9CA3AF]" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-[#9CA3AF]">Contracts</span>
                </div>

                {/* Wallet */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <Wallet size={22} className="text-[#9CA3AF]" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-[#9CA3AF]">Wallet</span>
                </div>

                {/* Activity */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <Activity size={22} className="text-[#9CA3AF]" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-[#9CA3AF]">Activity</span>
                </div>

                {/* Settings */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <Settings size={22} className="text-[#9CA3AF]" strokeWidth={2} />
                    <span className="text-[10px] font-medium text-[#9CA3AF]">Settings</span>
                </div>

            </div>
        </div>
    );
}