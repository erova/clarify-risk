import Link from "next/link";

interface DiligentLogoProps {
  href?: string;
  showText?: boolean;
}

export function DiligentLogo({ href = "/", showText = true }: DiligentLogoProps) {
  const logo = (
    <div className="flex items-center gap-2.5">
      {/* Diligent "D" mark */}
      <div className="w-8 h-8 bg-gradient-to-br from-[#C41230] to-[#8B001E] rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
        <span className="text-white font-bold text-sm tracking-tight">D</span>
      </div>
      {showText && (
        <span className="font-semibold text-white tracking-tight">
          Diligent <span className="text-gray-400 font-normal">Prototypes</span>
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
