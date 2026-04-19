"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumb({ items, customItems }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
      breadcrumbs.push({
        label,
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex justify-start items-center space-x-2 text-sm text-[var(--muted)]">
      {breadcrumbs.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && (
            <svg
              className="mx-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}