"use client"

import { useState, useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  User,
  Palette,
  Shield,
  ShieldAlert,
  Save,
  Loader2,
  AlertTriangle,
  Trash2,
  UserX,
  Sun,
  Moon,
  Monitor,
  BrainCircuit,
  Database,
  Check,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

// ─── Delete Account Dialog ─────────────────────────────────────────────────────

function DeleteAccountDialog() {
  const { signOut } = useClerk()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" })
      const result = await res.json()
      if (result.success) {
        toast.success("Account deleted successfully.")
        await signOut()
        router.push("/")
      } else {
        toast.error(result.error || "Failed to delete account")
      }
    } catch {
      toast.error("An error occurred while deleting your account.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmText(""); }}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <UserX className="h-4 w-4" /> Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Delete Your Account
          </DialogTitle>
          <DialogDescription>
            This action is <strong>permanent and irreversible</strong>. All your resumes, preferences, scores, and data will be deleted. Your Clerk account will also be removed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Type <span className="font-mono font-bold text-destructive">DELETE</span> below to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="font-mono"
            disabled={isDeleting}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={isDeleting}>Cancel</Button></DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Theme Selector ────────────────────────────────────────────────────────────

function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- needed for hydration safety with next-themes
  useEffect(() => { setMounted(true) }, [])

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <div className="flex gap-2">
      {options.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? "default" : "outline"}
          size="sm"
          className="gap-2 flex-1"
          onClick={() => setTheme(value)}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  )
}

// ─── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}

// ─── Settings Page ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  // Profile fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileDirty, setProfileDirty] = useState(false)

  // App preferences
  const [showAiFeedback, setShowAiFeedback] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Initialize from Clerk user
  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName ?? "")
      setLastName(user.lastName ?? "")
    }
  }, [isLoaded, user])

  // Initialize AI feedback from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showAiFeedback")
      setShowAiFeedback(stored !== null ? stored === "true" : true)
    }
  }, [])

  // Load app settings from S3
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings")
        const result = await res.json()
        if (result.success && result.data) {
          setDataSharing(result.data.dataSharing ?? false)
        }
      } catch {
        console.error("Failed to load settings")
      } finally {
        setIsLoadingSettings(false)
      }
    }
    if (isLoaded) loadSettings()
  }, [isLoaded])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSavingProfile(true)
    try {
      await user.update({ firstName, lastName })
      setProfileDirty(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile.")
      console.error(error)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleAiFeedbackChange = (value: boolean) => {
    setShowAiFeedback(value)
    if (typeof window !== "undefined") {
      localStorage.setItem("showAiFeedback", String(value))
    }
    toast.success(value ? "AI feedback enabled" : "AI feedback disabled")
  }

  const handleDataSharingChange = async (value: boolean) => {
    setDataSharing(value)
    setIsSavingSettings(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSharing: value }),
      })
      const result = await res.json()
      if (!result.success) {
        setDataSharing(!value) // revert
        toast.error("Failed to save preference")
      } else {
        toast.success(value ? "Data sharing enabled" : "Data sharing disabled")
      }
    } catch {
      setDataSharing(!value) // revert
      toast.error("Failed to save preference")
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-muted">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ─── Section 1: Profile Information ─────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Profile Information
              </CardTitle>
              <CardDescription>
                Update your display name. Email and profile picture are managed through your Clerk account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setProfileDirty(true); }}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setProfileDirty(true); }}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="text-sm px-3 py-2 rounded-md border bg-muted/50">
                  {user?.primaryEmailAddress?.emailAddress ?? "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Managed by Clerk. Click your profile avatar to change email or password.
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={!profileDirty || isSavingProfile}
                className="gap-2"
              >
                {isSavingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : profileDirty ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isSavingProfile ? "Saving..." : profileDirty ? "Save Changes" : "Saved"}
              </Button>
            </CardContent>
          </Card>

          {/* ─── Section 2: App Preferences ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Preferences
              </CardTitle>
              <CardDescription>
                Customize your app experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <ThemeSelector />
              </div>

              <Separator />

              {/* AI Feedback */}
              <ToggleRow
                label="AI Feedback"
                description="Show AI-generated resume improvement suggestions on the dashboard"
                checked={showAiFeedback}
                onChange={handleAiFeedbackChange}
              />

              <Separator />

              {/* Data Sharing */}
              <ToggleRow
                label="Data Sharing for Research"
                description="Allow your anonymized resume data to be used for academic research by the Grasshopper Labs team"
                checked={dataSharing}
                onChange={handleDataSharingChange}
                disabled={isLoadingSettings || isSavingSettings}
              />
            </CardContent>
          </Card>

          {/* ─── Section 3: Danger Zone ─────────────────────────────────── */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
