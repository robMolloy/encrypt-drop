import { Typography } from "@/components";
import { functions } from "@/config/firebaseConfig";
import { useNotifyStore } from "@/modules/notify";
import { $ } from "@/utils/useReactive";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, PaymentIntentResult } from "@stripe/stripe-js";
import { httpsCallable } from "firebase/functions";
import { FormEvent, useEffect, useRef } from "react";
import { z } from "zod";

const createStripePaymentIntentFunction = httpsCallable(functions, "createStripePaymentIntent");
const createStripePaymentIntentSchema = z.object({ clientSecret: z.string() });
const createStripePaymentIntent = async (p: { amount: number; currency: string }) => {
  const response = await createStripePaymentIntentFunction(p);
  const parsedResponse = createStripePaymentIntentSchema.safeParse(response.data);
  return parsedResponse;
};
const stripePromise = loadStripe(
  "pk_test_51QhH4nIGFJRyk0RhXvRc2rpNtuV0iHmS5T6sIUxxUWO8nj9wvJa7vEgVPZ0RhuQSP7NIagxu1dFdn6xfowpnzWnz00R1ukCj7h",
);

const MyPaymentElement = (p: {
  onSuccess: (x: PaymentIntentResult) => void;
  onError: (x: string | undefined) => void;
}) => {
  const $isLoading = $(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ($isLoading.value) return;
    $isLoading.set(true);

    await (async () => {
      if (!stripe || !elements) return;

      const result = await stripe.confirmPayment({ elements, redirect: "if_required" });

      if (result.error) p.onError(result.error.message);
      else p.onSuccess(result);
    })();

    $isLoading.set(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <br />
      <button className="btn btn-primary w-full">
        {$isLoading.value ? <span className="loading loading-spinner" /> : "Submit"}
      </button>
    </form>
  );
};

const CheckoutForm = (
  p: Parameters<typeof MyPaymentElement>[0] & { amount: number; currency: string },
) => {
  const $paymentIntentClientSecret = $<string>();
  const $error = $<"failed to create a paymentIntent">();
  const isFirstRender = useRef(true);

  const step = (() => {
    if ($error.value) return $error.value;
    if (!$paymentIntentClientSecret.value) return "loading";
    return "ready";
  })();

  useEffect(() => {
    if (!isFirstRender.current) return;

    (async () => {
      const paymentIntentResponse = await createStripePaymentIntent({
        amount: p.amount,
        currency: p.currency,
      });
      if (!paymentIntentResponse.success) return $error.set("failed to create a paymentIntent");
      $paymentIntentClientSecret.set(paymentIntentResponse.data.clientSecret);
    })();
    isFirstRender.current = false;
  }, []);

  return (
    <div className="card bg-white">
      <div className="card-body">
        {step === "loading" && (
          <div className="flex h-64 items-center justify-center gap-2">
            <span className="loading loading-spinner loading-lg size-16" />
          </div>
        )}

        {step === "ready" && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: $paymentIntentClientSecret.value }}
          >
            <div>amount: {p.amount}</div>
            <div>currency: {p.currency}</div>
            <MyPaymentElement onSuccess={p.onSuccess} onError={p.onError} />
          </Elements>
        )}

        {step === "failed to create a paymentIntent" && <div>Something went wrong</div>}
      </div>
    </div>
  );
};

export default function PaymentCompletionPage() {
  const $step = $<"initial" | "success">("initial");
  const notify = useNotifyStore();

  return (
    <main className={`min-h-screen`}>
      <Typography fullPage>
        <div>
          {$step.value === "initial" && (
            <CheckoutForm
              amount={345}
              currency="USD"
              onError={(x) => {
                notify.push({
                  type: "alert-error",
                  heading: "failed to create a paymentIntent",
                  children: <div>{x}</div>,
                });
              }}
              onSuccess={(x) => {
                console.log(`payment-completion.page.tsx:${/*LL*/ 131}`, { x });

                notify.push({
                  type: "alert-success",
                  heading: "Payment complete",
                });
                $step.set("success");
              }}
            />
          )}
          {$step.value === "success" && <div>success</div>}
        </div>
      </Typography>
    </main>
  );
}
