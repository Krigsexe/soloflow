"use client";

import { SignInModal } from "~/components/sign-in-modal";
// Temporarily disabled Clerk modal - component renamed to .disabled
// import { SignInClerkModal } from "~/components/sign-in-modal-clerk";
import { useMounted } from "~/hooks/use-mounted";

export const ModalProvider = ({ dict }: { dict: Record<string, string> }) => {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <>
      <SignInModal dict={dict} />
      {/* Temporarily disabled - requires valid Clerk keys */}
      {/* <SignInClerkModal dict={dict} /> */}
    </>
  );
};
