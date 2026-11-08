import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Heart,
  Smile,
  Shield,
  Layers,
  Activity,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";

const CATEGORIES = [
  { id: "Hair", label: "Hair Care", desc: "Hair fall, thinning, dandruff, and scalp health" },
  { id: "Beard", label: "Beard Care", desc: "Patchy growth, density, and beard grooming" },
  { id: "Skin", label: "Skin Care", desc: "Hydration, oil control, and post-shave soothing" },
  { id: "Wellness", label: "General Wellness", desc: "Stress management, sleep quality, and vitality" },
  { id: "Other", label: "Other Personal Care", desc: "General daily self-care and maintenance" },
];

const CONCERNS_BY_CAT: Record<string, string[]> = {
  Hair: ["Hair fall concerns", "Dandruff & flakes", "Dry & frizzy hair", "Receding hairline"],
  Beard: ["Patchy beard growth", "Rough or stiff beard", "Beard itchiness"],
  Skin: ["Dehydrated / dry skin", "Excess sebum & oiliness", "Razor burn / irritation"],
  Wellness: ["High stress & cortisol", "Poor sleep quality", "Low daily energy"],
  Other: ["General hygiene routine", "Ingredient sensitivities"],
};

const GOALS = [
  "Organise my products in one place",
  "Build a consistent daily routine",
  "Understand ingredients and usage directions",
  "Track my personal care progress with photos",
  "Get answers to product questions with AI",
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, updateSession } = useSession();

  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(session?.name || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    session?.selectedCategories?.length ? session.selectedCategories : ["Hair", "Skin"]
  );
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    session?.concerns?.length ? session.concerns : ["Hair fall concerns"]
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    session?.goals?.length ? session.goals : [GOALS[0], GOALS[1]]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Compile concerns based on active categories
  const relevantConcerns = selectedCategories.flatMap(
    (cat) => CONCERNS_BY_CAT[cat] || []
  );

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updateSession({
        name: userName.trim() || "Care Member",
        selectedCategories,
        concerns: selectedConcerns,
        goals: selectedGoals,
        onboardingCompleted: true,
      });
      navigate("/dashboard");
    } catch {
      // Navigate anyway on local fallback
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Step Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-[#75817A] mb-2 uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span>{Math.round((step / 5) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-[#E7EBE7] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#183C32] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Cards */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-10 shadow-lg">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F1EB] text-[#183C32] flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#17211D]">
                Let's understand your care goals.
              </h2>
              <p className="text-xs text-[#75817A] mt-1.5 leading-relaxed">
                Tell us what you would like to manage. You can update this anytime.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                What should we call you?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (e.g. Alex)"
                className="w-full px-4 py-3 rounded-xl border border-[#E7EBE7] text-sm focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#17211D]">
                Select your care categories
              </h2>
              <p className="text-xs text-[#75817A] mt-1">
                Choose one or more categories you want to focus on.
              </p>
            </div>

            <div className="space-y-2.5">
              {CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selected
                        ? "border-[#183C32] bg-[#E7F1EB]/50"
                        : "border-[#E7EBE7] bg-[#F8F9F6] hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[#17211D]">{cat.label}</h3>
                      <p className="text-xs text-[#75817A] mt-0.5">{cat.desc}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        selected
                          ? "bg-[#183C32] border-[#183C32] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#17211D]">
                Select your primary concerns
              </h2>
              <p className="text-xs text-[#75817A] mt-1">
                These help us organize your routine. These are user-selected concerns, not medical diagnoses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relevantConcerns.map((concern) => {
                const selected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selected
                        ? "border-[#183C32] bg-[#E7F1EB]/60 font-semibold text-[#183C32]"
                        : "border-[#E7EBE7] bg-[#F8F9F6] text-[#17211D] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs">{concern}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        selected
                          ? "bg-[#183C32] border-[#183C32] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#17211D]">
                What are your main goals with CareGuide?
              </h2>
              <p className="text-xs text-[#75817A] mt-1">
                Select everything that applies to your daily journey.
              </p>
            </div>

            <div className="space-y-2.5">
              {GOALS.map((goal) => {
                const selected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selected
                        ? "border-[#183C32] bg-[#E7F1EB]/50 font-semibold text-[#183C32]"
                        : "border-[#E7EBE7] bg-[#F8F9F6] text-[#17211D] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs">{goal}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        selected
                          ? "bg-[#183C32] border-[#183C32] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-6 space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#E7F1EB] text-[#183C32] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#17211D]">
                You're all set, {userName || "Care Member"}!
              </h2>
              <p className="text-xs text-[#75817A] max-w-sm mx-auto mt-2 leading-relaxed">
                Your personalized CareGuide dashboard is ready with routines, product recommendations, and AI assistance.
              </p>
            </div>

            <div className="bg-[#F8F9F6] p-4 rounded-2xl border border-[#E7EBE7] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#75817A]">Selected Categories:</span>
                <span className="font-semibold text-[#183C32]">
                  {selectedCategories.join(", ") || "General"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75817A]">Focus Concerns:</span>
                <span className="font-semibold text-[#183C32]">
                  {selectedConcerns.length} selected
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#183C32] text-white text-sm font-bold hover:bg-[#122e26] transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? "Preparing Dashboard..." : "Go to My Dashboard"}
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#E7EBE7] mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#75817A] hover:text-[#17211D] hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-all shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
