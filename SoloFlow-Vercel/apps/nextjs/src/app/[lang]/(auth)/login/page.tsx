
"use client";

import { signIn } from "@soloflow/auth/react";

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      <button onClick={() => signIn("email", { email: "test@example.com" })}>Sign in with Email</button>
    </div>
  );
}
