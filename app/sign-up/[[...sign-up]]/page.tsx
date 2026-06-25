import { SignUp } from "@clerk/nextjs";
import { AuraniLogo } from "@/components/brand/aurani-logo";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Link href="/" aria-label="Aurani home">
        <AuraniLogo size="lg" />
      </Link>
      <SignUp />
    </div>
  );
}
