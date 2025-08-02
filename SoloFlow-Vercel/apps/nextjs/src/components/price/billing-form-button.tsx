"use client";

import { useTransition } from "react";

import { Button } from "@soloflow/ui/button";
import * as Icons from "@soloflow/ui/icons";

import { trpc } from "~/trpc/client";
import type { SubscriptionPlan, UserSubscriptionPlan } from "~/types";

interface BillingFormButtonProps {
  offer: SubscriptionPlan;
  subscriptionPlan: UserSubscriptionPlan;
  year: boolean;
  dict: Record<string, string>;
}

export function BillingFormButton({
  year,
  offer,
  dict,
  subscriptionPlan,
}: BillingFormButtonProps) {
  const [isPending, startTransition] = useTransition();

  const stripePlanId = year
    ? offer?.stripeIds?.yearly
    : offer?.stripeIds?.monthly;

  const handleCreateSession = () => {
    startTransition(() => {
      trpc.stripe.createSession.mutate({ planId: stripePlanId! })
        .then((res) => {
          if (res?.url) {
            window.location.href = res.url;
          }
        })
        .catch((error) => {
          console.error('Error creating session:', error);
        });
    });
  };

  return (
    <Button
      variant="default"
      className="w-full"
      disabled={isPending}
      onClick={stripeSessionAction}
    >
      {isPending ? (
        <>
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> Loading...
        </>
      ) : (
        <>
          {subscriptionPlan.stripePriceId
            ? dict.manage_subscription
            : dict.upgrade}
        </>
      )}
    </Button>
  );
}
