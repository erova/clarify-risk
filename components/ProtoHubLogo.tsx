import Link from "next/link";

interface ProtoHubLogoProps {
  href?: string;
  showText?: boolean;
}

export function ProtoHubLogo({ href = "/", showText = true }: ProtoHubLogoProps) {
  const logo = (
    <div className="flex items-center gap-2.5">
      {/* Proto Hub "P" mark */}
      <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
        <span className="text-white font-bold text-sm tracking-tight">P</span>
      </div>
      {showText && (
        <span className="font-semibold text-white tracking-tight">
          Proto Hub
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {logo}
      </Link>
    );
  }

  return logo;
}
