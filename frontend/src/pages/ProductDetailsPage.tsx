import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  Scale,
  Sparkles,
  BotMessageSquare,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Package,
} from "lucide-react";
import { productService } from "../services/productService.ts";
import { myCareService } from "../services/myCareService.ts";
import { Product } from "../types/product.ts";
import { useSession } from "../context/SessionContext.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { ErrorState } from "../components/common/ErrorState.tsx";
import { formatCurrencyINR } from "../lib/utils.ts";

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { sessionId } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        setActiveImage(data.imageUrl || "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Product not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCare = async () => {
    if (!product || isAdding || isAdded) return;
    setIsAdding(true);
    try {
      await myCareService.addProduct({
        sessionId,
        productId: product.id,
        status: "active",
        personalNotes: `Added ${product.name} to my care schedule.`,
        dosageSchedule: product.usageInstructions?.slice(0, 50) || "Daily as per directions",
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    } catch {
      // handled
    } finally {
      setIsAdding(false);
    }
  };

  const askAiAboutProduct = (question: string) => {
    if (!product) return;
    navigate(
      `/ai-assistant?productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(
        product.name
      )}&prompt=${encodeURIComponent(question)}`
    );
  };

  if (isLoading) {
    return <PageLoader message="Loading product information..." />;
  }

  if (error || !product) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto">
        <ErrorState
          title="Product Not Found"
          message={error || "We couldn't retrieve this product from the catalogue."}
          actionLabel="Back to Catalogue"
          onRetry={() => navigate("/discover")}
        />
      </div>
    );
  }

  const galleryImages = [
    product.imageUrl,
    ...(product.additionalImages || []),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 sm:space-y-10 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-6xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C7A72] hover:text-[#0F2E24] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Main Product Hero / Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 bg-white rounded-2xl border border-[#E2E7E2] p-4 sm:p-6 md:p-10 shadow-2xs">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="aspect-square rounded-2xl bg-[#F6F7F4] border border-[#EEF2EE] overflow-hidden flex items-center justify-center p-4 sm:p-6">
            <img
              src={activeImage || product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  type="button"
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#F6F7F4] p-1 cursor-pointer ${
                    activeImage === img ? "border-[#0F2E24]" : "border-[#E2E7E2]"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price, Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#0F2E24] tracking-wider uppercase">
              <span>{product.category} Care · Clinical Grade</span>
              {product.tag && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0F2E24] text-white font-bold">
                  {product.tag}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2 tabular-nums">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-none" />
                  <span className="text-xs font-bold text-[#131B17] ml-1">
                    {product.rating}
                  </span>
                </div>
                {product.ratingCount && (
                  <span className="text-xs text-[#6C7A72]">
                    · {product.ratingCount} verified clinical reviews
                  </span>
                )}
              </div>
            )}

            <p className="text-xs md:text-sm text-[#6C7A72] leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-6 border-t border-[#EEF2EE] space-y-4">
            <div className="flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl md:text-3xl font-black text-[#131B17]">
                {formatCurrencyINR(product.price)}
              </span>
              {product.originalPrice && product.price !== undefined && product.originalPrice > product.price && (
                <span className="text-sm text-[#6C7A72] line-through">
                  {formatCurrencyINR(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-[#207D53] font-semibold bg-[#E7F1EB] px-2.5 py-0.5 rounded-md">
                Verified Formulation
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddToCare}
                disabled={isAdding}
                type="button"
                className={`flex-1 py-3 px-6 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isAdded
                    ? "bg-[#207D53] text-white"
                    : "bg-[#0F2E24] text-white hover:bg-[#0a2119]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In My Active Care</span>
                  </>
                ) : isAdding ? (
                  <span>Adding to Care...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to My Care</span>
                  </>
                )}
              </button>

              <Link
                to={`/compare?ids=${product.id}`}
                className="py-3 px-5 rounded-xl bg-white border border-[#E2E7E2] text-[#131B17] text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Scale className="w-4 h-4 text-[#6C7A72]" />
                <span>Compare</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Product Detail Tabs / Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Ingredients */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#183C32]" />
              <span>Key Active Ingredients</span>
            </h3>
            <p className="text-xs text-[#75817A]">
              Clinically selected components formulated for maximum bio-availability:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="px-3 py-1.5 rounded-xl bg-[#F8F9F6] border border-[#E7EBE7] text-xs font-semibold text-[#183C32]"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Documented Benefits</span>
            </h3>
            <ul className="space-y-2">
              {product.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#17211D]">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Usage Instructions */}
        {product.usageInstructions && (
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D]">
              Approved Usage Instructions
            </h3>
            <p className="text-xs text-[#17211D] leading-relaxed bg-[#F8F9F6] p-4 rounded-2xl border border-[#E7EBE7]/80">
              {product.usageInstructions}
            </p>
          </div>
        )}

        {/* Precautions */}
        {product.precautions && product.precautions.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Precautions & Safety</span>
            </h3>
            <ul className="space-y-1.5">
              {product.precautions.map((p, i) => (
                <li key={i} className="text-xs text-[#75817A] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D]">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {product.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E7EBE7] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    type="button"
                    className="w-full p-4 text-left font-semibold text-xs text-[#17211D] flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#75817A]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#75817A]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#75817A] leading-relaxed bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Product Assistance Section */}
      <div className="bg-gradient-to-br from-[#0F2E24] via-[#143B2F] to-[#0A221A] text-white rounded-2xl p-6 md:p-8 shadow-xl space-y-4 border border-[#0F2E24]">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <BotMessageSquare className="w-4 h-4" />
          <span>CareGuide AI · Clinical Companion</span>
        </div>

        <div>
          <h3 className="text-xl font-bold">
            Consult CareGuide AI regarding {product.name}
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Instant formulation queries, ingredient synergy, or routine placement powered by Gemini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {[
            `What are the listed active ingredients in ${product.name}?`,
            `Explain the usage directions for ${product.name}`,
            `What safety precautions should I follow?`,
            `How should I slot this into my morning or evening routine?`,
          ].map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => askAiAboutProduct(promptText)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-left font-medium text-white transition-colors cursor-pointer border border-white/10"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
