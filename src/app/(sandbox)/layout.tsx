import type React from "react"
export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Recharts Sandbox</h1>
          <p className="mt-2 text-muted-foreground">Experiment with different chart types and configurations</p>
        </div>
        {children}
      </div>
    </div>
  )
}