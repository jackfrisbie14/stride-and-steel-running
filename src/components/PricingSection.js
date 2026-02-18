"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MONTHLY_PRICE = 29.99;
const TRIAL_PRICE = 0.99;
const TRIAL_DAYS = 7;

function TermsModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Subscription Terms & Refund Policy</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-zinc-300">
          <p className="text-zinc-400 italic">
            Please note that to the extent permitted by applicable law, all purchases are non-refundable and/or non-exchangeable, unless otherwise stated herein or required by applicable law.
          </p>

          {/* Section 1 */}
          <h3 className="text-white font-bold text-base pt-4 border-t border-zinc-800">1. MONEY-BACK GUARANTEE RULES</h3>
          <p>
            In addition to refund rights available under applicable laws, if you made a purchase directly on our website and the money-back option was presented to you during checkout, you are eligible to receive a refund provided that <strong className="text-white">all</strong> of the following conditions are met:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must contact us via email at{" "}
              <a href="mailto:support@strideandsteelrunning.com" className="text-blue-400 hover:underline">support@strideandsteelrunning.com</a>
              {" "}within 30 days after your initial purchase and before the end of your subscription period.
            </li>
            <li>You should have adhered to the training plan for at least 14 days in a row, and your refund request should include supporting materials to demonstrate your compliance. Specifically, please provide us with screenshots of your workout history from your dashboard, indicating your personal progress.</li>
            <li>We will review your application and notify you (by email) whether your application is approved.</li>
          </ul>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <h4 className="text-white font-semibold mb-2">IMPORTANT STATEMENT</h4>
            <p className="mb-2">
              Please note that only fulfillment of <strong className="text-white">all</strong> the above requirements allows you to receive a full Voluntary Refund under "Money-back guarantee". For clarity, this "Money-back guarantee" does <strong className="text-white">not</strong> apply to the following cases:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Personal reasons (you don't like the product, it did not meet your expectations, etc.);</li>
              <li>Financial reasons (you did not expect that you would be charged, that the trial would convert into a subscription, that the subscription would automatically renew, or that the services are paid, etc.).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <h3 className="text-white font-bold text-base pt-4 border-t border-zinc-800">2. GENERAL REFUND RULES</h3>
          <p>
            Generally, if you do not meet the conditions set out above, the fees you have paid are non-refundable and non-exchangeable, unless otherwise stated herein or required by applicable law.
          </p>

          <div className="space-y-4 pl-4 border-l-2 border-zinc-700">
            <div>
              <h4 className="text-white font-semibold">Note for residents of US states (California)</h4>
              <p className="text-zinc-400">
                If you reside in California and cancel the purchase at any time prior to midnight of the third business day after the date of such purchase, we will return the payment you have made.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold">Note for EU residents</h4>
              <p className="text-zinc-400">
                If you are an EU user, you have a period of 14 days to withdraw from a contract, without giving any reason, and without incurring any costs. The cancellation period will expire after 14 days from your purchase of the Service.
              </p>
              <p className="text-zinc-400 mt-2">
                To exercise the right of withdrawal, you must inform us of your decision to withdraw from this contract by email at{" "}
                <a href="mailto:support@strideandsteelrunning.com" className="text-blue-400 hover:underline">support@strideandsteelrunning.com</a>.
                To meet the withdrawal deadline, it is sufficient for you to send your communication before the withdrawal period has expired.
              </p>
              <p className="text-zinc-400 mt-2">
                If you withdraw from this contract, we shall reimburse you for all payments received from you without undue delay, and in any event not later than 14 days from the day on which we are informed about your decision. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise.
              </p>
              <p className="text-zinc-400 mt-2">
                If you have provided your prior express consent to begin the performance during the right of withdrawal period and acknowledgment that you will lose your right of withdrawal, then you will not be eligible for a refund in relation to digital content and will only be eligible for a proportional refund in relation to digital service.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold">Note for Brazil residents</h4>
              <p className="text-zinc-400">
                In accordance with Brazilian Consumer Protection Law, you have the right to cancel your purchase of the Service within seven (7) calendar days from the date of purchase, without providing any reason. If you exercise this right, we will refund the full amount paid without undue delay using the same payment method used for the original transaction.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <h3 className="text-white font-bold text-base pt-4 border-t border-zinc-800">3. HOW TO REQUEST A REFUND</h3>
          <p>
            If you are eligible for a refund, as outlined herein or required by applicable law, and would like to request one, please follow the instructions below:
          </p>

          <div className="space-y-3">
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <h4 className="text-white font-semibold">App Store Purchases</h4>
              <p className="text-zinc-400">
                If you purchased a subscription through the App Store, please note that refunds are handled by Apple. To request a refund, follow the instructions provided on the Apple support page.
              </p>
            </div>

            <div className="bg-zinc-800/30 rounded-lg p-3">
              <h4 className="text-white font-semibold">Google Play Store or Website Purchases</h4>
              <p className="text-zinc-400">
                If you purchased a subscription using your Google Play Store account or directly through our website, please contact our support team at{" "}
                <a href="mailto:support@strideandsteelrunning.com" className="text-blue-400 hover:underline">support@strideandsteelrunning.com</a>.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <h3 className="text-white font-bold text-base pt-4 border-t border-zinc-800">4. SUBSCRIPTION TERMS</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your subscription begins with a {TRIAL_DAYS}-day trial period for ${TRIAL_PRICE}. After the trial period, your subscription will automatically renew at ${MONTHLY_PRICE}/month unless you cancel before the trial ends.</li>
            <li>Subsequent renewals will be charged at the standard subscription rate of ${MONTHLY_PRICE}/month.</li>
            <li>You may cancel your subscription at any time through your account Settings or by contacting support. Cancellation will take effect at the end of your current billing period.</li>
            <li>No refunds or credits will be provided for partial billing periods upon cancellation.</li>
          </ul>

          <p className="text-zinc-500 text-xs pt-6 border-t border-zinc-800">
            Last updated: February 2026. Stride & Steel Running reserves the right to modify these terms at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto mt-12">
      {/* Main Pricing Card */}
      <div className="relative rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden">
        {/* Popular Badge */}
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
          MOST POPULAR
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-bold text-center mb-2">Running Pro</h3>
          <p className="text-zinc-400 text-center mb-6">Personalized running program for every goal</p>

          {/* Trial Price */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-white">${TRIAL_PRICE}</span>
            </div>
            <p className="text-lg text-blue-400 font-medium mt-2">for your first {TRIAL_DAYS} days</p>
            <p className="text-zinc-500 text-sm mt-2">then ${MONTHLY_PRICE}/month</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              "Personalized 7-day running plan",
              "Speed work: intervals, tempo, hills",
              "Easy runs, long runs, progressions",
              "Cross-training: yoga, cycling, swimming",
              "Active recovery sessions",
              "Progress tracking dashboard",
              "Pre & post workout assessments",
              "Race-specific training plans",
              "New workouts every week",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                  <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-zinc-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/checkout"
            className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-center text-lg font-bold text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
          >
            Start 7-Day Trial for $0.99 →
          </Link>

          {/* Auto-renewal disclaimer */}
          <p className="mt-4 text-xs text-zinc-500 text-center leading-relaxed">
            By continuing, you agree to pay ${TRIAL_PRICE} today for a {TRIAL_DAYS}-day trial. After the trial, your subscription will auto-renew at ${MONTHLY_PRICE} USD/month unless you cancel in Settings. Please see our{" "}
            <button onClick={() => setShowTerms(true)} className="text-zinc-400 underline hover:text-zinc-300">
              Subscription terms
            </button>
            ,{" "}
            <button onClick={() => setShowTerms(true)} className="text-zinc-400 underline hover:text-zinc-300">
              Refund policy
            </button>
            .
          </p>

          {/* Guarantee */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-zinc-400 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Cancel anytime • No contracts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Money-Back Guarantee */}
      <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-green-400 font-bold text-lg">30-Day Money-Back Guarantee</h4>
            <p className="text-zinc-400 text-sm">Try risk-free. Not satisfied? Get a full refund.</p>
          </div>
        </div>
        <button
          onClick={() => setShowTerms(true)}
          className="text-green-400 text-sm underline hover:text-green-300 transition-colors"
        >
          View Terms & Conditions
        </button>
      </div>

      {/* Terms Modal */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}
