import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // Handle the redirect flow by rendering the
  // prebuilt AuthenticateWithRedirectCallback component.
  // This does not render anything, so you can optionally add
  // a loading spinner.
  return <AuthenticateWithRedirectCallback />;
}