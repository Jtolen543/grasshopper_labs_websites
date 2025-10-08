import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const AppProviders = ({children}: {children: React.ReactNode}) => {
    return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        <Header />
        <div className="pb-20"></div>
        {children}
        <Footer />
      </ThemeProvider>
    )
}