import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ResumeProvider } from "@/contexts/resume-context"

export const AppProviders = ({children}: {children: React.ReactNode}) => {
    return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <ResumeProvider>
          <Header />
          <div className="pb-20"></div>
          {children}
          <Footer />
        </ResumeProvider>
      </ThemeProvider>
    )
}