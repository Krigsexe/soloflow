import { ClerkOrganizationProfile } from "~/components/auth/clerk-wrapper";
import { getDictionary } from "~/lib/get-dictionary";

interface OrganizationPageProps {
  params: {
    lang: string;
  };
}

export default async function OrganizationPage({
  params: { lang },
}: OrganizationPageProps) {
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {dict?.organization?.title || "Gestion d'Organisation"}
        </h1>
        <p className="text-muted-foreground">
          {dict?.organization?.description || "Gérez votre organisation, membres et paramètres"}
        </p>
      </div>
      
      <div className="flex justify-center">
        <ClerkOrganizationProfile className="w-full max-w-4xl" />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: { lang },
}: OrganizationPageProps) {
  const dict = await getDictionary(lang);
  
  return {
    title: dict?.organization?.title || "Gestion d'Organisation",
    description: dict?.organization?.description || "Gérez votre organisation, membres et paramètres",
  };
}