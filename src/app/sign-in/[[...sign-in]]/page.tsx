import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-lg border border-border/50 bg-background/95 backdrop-blur",
          },
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
