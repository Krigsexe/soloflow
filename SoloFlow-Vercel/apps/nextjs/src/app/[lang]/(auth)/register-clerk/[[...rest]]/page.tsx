import { getDictionary } from "~/lib/get-dictionary";
import { ClerkSignUp } from "~/components/auth/clerk-wrapper";

interface RegisterPageProps {
  params: {
    lang: string;
  };
  searchParams: {
    from?: string;
  };
}

export default async function RegisterPage({
  params: { lang },
  searchParams,
}: RegisterPageProps) {
  const dict = await getDictionary(lang);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {dict?.register?.welcome || "Créer un compte"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict?.register?.signup_title || "Inscrivez-vous pour commencer"}
          </p>
        </div>
        
        <ClerkSignUp lang={lang} />
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          <span className="hover:text-brand underline underline-offset-4">
            {dict?.register?.privacy || "Seuls votre email et photo de profil seront stockés."}
          </span>
        </p>
      </div>
    </div>
  );
}