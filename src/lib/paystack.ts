export interface StudioPackage {
  id: string;
  name: string;
  price: number; // in GHS
  depositPercent: number; // usually 30%
  duration: string;
  tagline: string;
  popular?: boolean;
  startingFrom?: boolean;
  features: string[];
  deliverables: string;
  badge?: string;
}

export interface StudioExtra {
  id: string;
  title: string;
  price: string;
  description: string;
}

export const STUDIO_PACKAGES: StudioPackage[] = [
  {
    id: "entry",
    name: "Entry",
    price: 300,
    depositPercent: 30,
    duration: "30-Minute Session",
    tagline: "Ideal for quick headshots, single look portraits & solo artists",
    features: [
      "3 Retouched Pictures",
      "1 Outfit",
      "30-Minute Session",
      "Professional Studio Lighting",
      "Online Private Gallery Access",
    ],
    deliverables: "3 Retouched Pictures",
  },
  {
    id: "standard",
    name: "Standard",
    price: 550,
    depositPercent: 30,
    duration: "50-Minute Session",
    tagline: "Our most requested package for creators, models & artists",
    popular: true,
    badge: "MOST POPULAR",
    features: [
      "6 Retouched Pictures",
      "Up to 2 Outfits / looks",
      "50-Minute Session",
      "Creative Lighting & Color Backdrops",
      "High-speed tethered preview on set",
    ],
    deliverables: "6 Retouched Pictures",
  },
  {
    id: "premium",
    name: "Premium",
    price: 1000,
    depositPercent: 30,
    duration: "1 Hour 20 Minute Session",
    tagline: "For brands, album covers, editorial & portfolio builds",
    badge: "PRO CHOICE",
    features: [
      "12 Retouched Pictures",
      "Up to 3 Outfits / looks",
      "1 Hour 20 Minute Session",
      "Advanced Color Grading & Retouching",
      "Full Commercial Release Rights",
    ],
    deliverables: "12 Retouched Pictures",
  },
  {
    id: "super",
    name: "Super Pack",
    price: 2000,
    depositPercent: 30,
    duration: "2+ -Hour Session",
    tagline: "The ultimate VIP shoot with video visuals and multiple styling looks",
    badge: "VIP EXPERIENCE",
    startingFrom: true,
    features: [
      "20 Retouched Pictures",
      "30-Second Video Reel",
      "4+ Outfits / looks",
      "2+ -Hour Session",
      "Dedicated Assistant & VIP Green Room",
    ],
    deliverables: "20 Retouched Pictures + 30-Second Video Reel",
  },
];

export const STUDIO_EXTRAS: StudioExtra[] = [
  {
    id: "video_reels",
    title: "Video Reels",
    price: "Starting at Gh¢200",
    description: "Cinematic vertical video reel edited for Instagram, TikTok & promotional rollouts.",
  },
  {
    id: "extra_retouch",
    title: "Additional Retouched Pictures",
    price: "Standard per-image rate",
    description: "Extra high-resolution images retouched with magazine-grade skin smoothing & color grading.",
  },
  {
    id: "extra_outfit",
    title: "Extra Outfit Changes",
    price: "Available for an additional fee",
    description: "Add more outfits and styling changes to your scheduled session.",
  },
  {
    id: "raw_files",
    title: "Raw Files",
    price: "Full gallery access available for purchase",
    description: "Receive the complete unedited RAW / JPEG photo gallery from your shoot.",
  },
  {
    id: "physical_frames",
    title: "Physical Frames",
    price: "Pricing varies by size",
    description: "Custom premium museum-grade photo frames and luxury canvas prints.",
  },
];

/**
 * Calculates 30% deposit and remaining balance in GHS
 */
export function calculatePaymentBreakdown(packagePrice: number, depositPercent = 30) {
  const depositAmount = Math.round((packagePrice * depositPercent) / 100);
  const balanceDue = packagePrice - depositAmount;
  return {
    packagePrice,
    depositPercent,
    depositAmount,
    balanceDue,
  };
}

/**
 * Format GHS currency display as Gh¢
 */
export function formatGHS(amount: number): string {
  return `Gh¢${amount.toLocaleString("en-GH")}`;
}

export interface PaystackTransactionConfig {
  email: string;
  amount: number; // in GHS (will be converted to pesewas: amount * 100)
  currency?: string;
  reference: string;
  metadata?: Record<string, any>;
  onSuccess?: (response: { reference: string; status: string }) => void;
  onCancel?: () => void;
}

/**
 * Initialize Paystack Inline Popup
 */
export function initializePaystackPayment(config: PaystackTransactionConfig) {
  const publicKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key";

  if (typeof window === "undefined") return;

  // Check if Paystack script is already loaded
  const existingScript = document.getElementById("paystack-inline-js");
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => triggerPaystackPopup(config, publicKey);
    document.body.appendChild(script);
  } else {
    triggerPaystackPopup(config, publicKey);
  }
}

function triggerPaystackPopup(
  config: PaystackTransactionConfig,
  publicKey: string
) {
  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop) {
    console.warn("Paystack Inline script not available, falling back to simulated checkout.");
    setTimeout(() => {
      if (
        confirm(
          `[PAYSTACK CHECKOUT DEMO]\nPay Gh¢${config.amount} deposit for reference: ${config.reference}?\n\nClick OK to simulate Successful Payment.`
        )
      ) {
        config.onSuccess?.({ reference: config.reference, status: "success" });
      } else {
        config.onCancel?.();
      }
    }, 400);
    return;
  }

  try {
    const handler = PaystackPop.setup({
      key: publicKey,
      email: config.email,
      amount: Math.round(config.amount * 100), // in pesewas
      currency: config.currency || "GHS",
      ref: config.reference,
      metadata: config.metadata || {},
      callback: (response: any) => {
        if (config.onSuccess) {
          config.onSuccess({
            reference: response.reference || config.reference,
            status: "success",
          });
        }
      },
      onClose: () => {
        if (config.onCancel) {
          config.onCancel();
        }
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error("Paystack popup error:", error);
    if (
      confirm(
        `[PAYSTACK DEMO]\nSimulate successful Gh¢${config.amount} payment for ${config.reference}?`
      )
    ) {
      config.onSuccess?.({ reference: config.reference, status: "success" });
    } else {
      config.onCancel?.();
    }
  }
}
