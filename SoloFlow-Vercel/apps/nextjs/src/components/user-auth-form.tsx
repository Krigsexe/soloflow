"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@soloflow/ui";
import { buttonVariants } from "@soloflow/ui/button";
import * as Icons from "@soloflow/ui/icons";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
  disabled?: boolean;
}

export function UserAuthForm({
  className,
  lang,
  dict,
  disabled,
  ...props
}: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  function handleSignIn() {
    setIsLoading(true);
    router.push(`/${lang}/login-clerk`);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <button 
        className={cn(buttonVariants())} 
        onClick={handleSignIn}
        disabled={isLoading || disabled}
      >
        {isLoading && (
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        {dict.signin_email || "Sign In"}
      </button>
    </div>
  );
}
