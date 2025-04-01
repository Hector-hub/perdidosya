"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const policies = [
  {
    title: "Política de Privacidad",
    href: "/politicas-privacidad",
    description: "Cómo manejamos y protegemos tu información personal",
  },
  {
    title: "Términos y Condiciones",
    href: "/terminos-condiciones",
    description: "Reglas y condiciones de uso de la plataforma",
  },
  {
    title: "Política de Cookies",
    href: "/politicas-cookies",
    description: "Cómo utilizamos las cookies en nuestra plataforma",
  },
];

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Políticas</h2>
              <nav className="space-y-2">
                {policies.map((policy) => (
                  <Link
                    key={policy.href}
                    href={policy.href}
                    className={`block p-3 rounded-lg transition-colors ${
                      pathname === policy.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium">{policy.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {policy.description}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
