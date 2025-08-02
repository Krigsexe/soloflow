interface LoginClerkLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default function LoginClerkLayout({ 
  children, 
  params: { lang } 
}: LoginClerkLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}