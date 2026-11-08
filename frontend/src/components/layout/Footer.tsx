import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E7EBE7] mt-auto py-10 px-6 md:px-12 text-[#75817A] text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-[#183C32] font-bold text-base">
            <div className="w-7 h-7 rounded-lg bg-[#183C32] text-white flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <span>CareGuide</span>
          </div>
          <p className="max-w-sm text-xs text-[#75817A] leading-relaxed">
            Your personal care journey, all in one place. Discover science-backed products, organise daily routines, track your progress, and get guidance powered by AI.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#183C32] font-semibold bg-[#E7F1EB] px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4 text-[#183C32]" />
            <span>Dermatologist verified formulations & instructions</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-[#17211D] text-xs uppercase tracking-wider mb-3">
            Navigation
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/discover" className="hover:text-[#183C32] transition-colors">
                Discover Catalogue
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-[#183C32] transition-colors">
                Product Comparison
              </Link>
            </li>
            <li>
              <Link to="/routines" className="hover:text-[#183C32] transition-colors">
                Routine Manager
              </Link>
            </li>
            <li>
              <Link to="/progress" className="hover:text-[#183C32] transition-colors">
                Progress Journal
              </Link>
            </li>
            <li>
              <Link to="/ai-assistant" className="hover:text-[#183C32] transition-colors">
                CareGuide AI
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 className="font-bold text-[#17211D] text-xs uppercase tracking-wider mb-3">
            Support
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/orders" className="hover:text-[#183C32] transition-colors">
                Track Sample Order
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-[#183C32] transition-colors">
                Help Center & FAQs
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-[#183C32] transition-colors">
                Preferences & Demo Session
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Medical & Evaluation Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#E7EBE7] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <p className="leading-relaxed text-center md:text-left max-w-2xl">
          <strong>Medical Disclaimer:</strong> CareGuide AI provides general product information and personal care assistance. It does not provide medical diagnoses or replace consultation with a licensed healthcare professional.
        </p>
        <p className="text-gray-400 shrink-0">
          © {new Date().getFullYear()} CareGuide for Man Matters.
        </p>
      </div>
    </footer>
  );
};
