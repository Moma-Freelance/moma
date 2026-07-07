'use client';

import { useState } from 'react';
import { ArrowLeft, Camera, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('Sarah');
  const [lastName, setLastName] = useState('Adeyemi');
  const [phone, setPhone] = useState('803 456 7890');
  const [profession, setProfession] = useState('UI Designer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Action logic for save & continue goes here
    router.push('/home/add-bank');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 font-sans max-w-md mx-auto shadow-sm relative flex flex-col justify-between">
      
      {/* Upper Content Container */}
      <div>
        {/* Navigation Top Bar */}
        <div className="flex items-center gap-4 mt-6 mb-10">
          <Link 
            href="/home" 
            className="w-12 h-12 rounded-full border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#171717]" />
          </Link>
          <h1 className="text-[20px] font-bold text-[#171717]">Complete profile</h1>
        </div>

        {/* Profile Avatar with Camera Overlay Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-[100px] h-[100px] bg-[#0F172A] text-white rounded-full flex items-center justify-center font-bold text-2xl tracking-wide select-none">
              SA
            </div>
            {/* Camera Overlay Badge positioned at bottom right */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#28C7AC] rounded-full border-[3px] border-[#F9FAFB] flex items-center justify-center text-white shadow-sm hover:scale-105 active:scale-95 transition-transform">
              <Camera size={14} fill="currentColor" className="text-[#28C7AC]" strokeWidth={2.5} color="white" />
            </button>
          </div>
          <button className="text-[#28C7AC] font-semibold text-[14px] mt-3 hover:underline">
            Add a photo
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name Two-Column Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#666D80] font-medium text-[14px] mb-2">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] text-[#171717] font-medium focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20 focus:border-[#28C7AC]"
              />
            </div>
            <div>
              <label className="block text-[#666D80] font-medium text-[14px] mb-2">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] text-[#171717] font-medium focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20 focus:border-[#28C7AC]"
              />
            </div>
          </div>

          {/* Phone Number Input with Prefix Unit Box */}
          <div>
            <label className="block text-[#666D80] font-medium text-[14px] mb-2">Phone number</label>
            <div className="w-full bg-white border border-gray-200 rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-[#28C7AC]/20 focus-within:border-[#28C7AC] transition-all">
              <span className="pl-4 pr-3 py-3.5 text-[#171717] font-medium text-[15px] select-none border-r border-gray-100">
                +234
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-transparent text-[15px] text-[#171717] font-semibold tracking-wide focus:outline-none"
              />
            </div>
          </div>

          {/* Profession Dropdown Box */}
          <div>
            <label className="block text-[#666D80] font-medium text-[14px] mb-2">
              Profession <span className="text-[#9CA3AF] font-normal">· optional</span>
            </label>
            <div className="relative">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] text-[#171717] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#28C7AC]/20 focus:border-[#28C7AC] cursor-pointer"
              >
                <option value="UI Designer">UI Designer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Product Manager">Product Manager</option>
              </select>
              <ChevronDown 
                size={18} 
                className="absolute right-4 top-4 text-[#666D80] pointer-events-none" 
                strokeWidth={2.5}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Action Footer Button Area */}
      <div className="mt-8 mb-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-full text-[16px] transition-colors hover:bg-zinc-800 active:scale-[0.99]"
        >
          Save & continue
        </button>
      </div>

    </div>
  );
}