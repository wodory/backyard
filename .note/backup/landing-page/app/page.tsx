import AuthSection from "@/components/auth-section"
import RandomImage from "@/components/random-image"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left column - Random Welcome Image */}
      <div className="relative w-full md:w-1/2 bg-slate-900">
        <RandomImage />
      </div>

      {/* Right column - Authentication */}
      <div className="flex w-full items-center justify-center md:w-1/2">
        <AuthSection />
      </div>
    </div>
  )
}
