import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0a0f1a]">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 flex flex-col items-center">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            CivicPulse LK Authentication
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-muted">
            Sign in to report, verify, or coordinate infrastructure repairs.
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-2xl rounded-2xl bg-surface border border-primary/20 backdrop-blur-xl",
              headerTitle: "text-foreground text-lg font-bold",
              headerSubtitle: "text-muted text-sm",
              socialButtonsBlockButton:
                "bg-slate-800 border-slate-700 text-foreground hover:bg-slate-700 text-sm",
              formButtonPrimary:
                "bg-primary hover:bg-primary-light text-foreground font-semibold text-sm rounded-lg py-2.5 transition-all shadow-lg shadow-primary/20",
              formFieldLabel: "text-muted text-xs font-medium",
              formFieldInput:
                "bg-surface border-primary/20 text-foreground focus:border-primary text-sm rounded-lg",
              footerActionLink: "text-primary hover:text-primary-light font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}

