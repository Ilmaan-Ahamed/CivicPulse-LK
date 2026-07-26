import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0a0f1a]">
      {/* Ambient glow */}
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 flex flex-col items-center">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Join CivicPulse LK
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-400">
            Start reporting public infrastructure issues & earning trust in your community.
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-2xl rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl",
              headerTitle: "text-white text-lg font-bold",
              headerSubtitle: "text-slate-400 text-sm",
              socialButtonsBlockButton:
                "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-sm",
              formButtonPrimary:
                "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg py-2.5 transition-all shadow-lg shadow-emerald-600/20",
              formFieldLabel: "text-slate-300 text-xs font-medium",
              formFieldInput:
                "bg-slate-950/60 border-slate-800 text-white focus:border-emerald-500 text-sm rounded-lg",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}
