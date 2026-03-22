"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  BarChart3,
  Clock, 
  Heart,
  LogIn,
  LogOut,
  User,
  Menu,
  Layers,
  Lightbulb,
  Users,
  CreditCard,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { unlinkCurrentUserSearchByQuery } from "@/app/actions/searches"
import { signOut, useSession } from "@/lib/auth-client"

interface SidebarProps {
  searchHistory: string[]
  onSearchHistoryClick: (term: string) => void
  onDeleteSearchHistory: (term: string) => void
  onLogoClick: () => void
  isDesktopExpanded: boolean
  onDesktopExpandedChange: (expanded: boolean) => void
}

const navLinks = [
  { href: "#how-it-works", label: "How it works", icon: Layers },
  { href: "#features", label: "Features", icon: Lightbulb },
  { href: "#use-cases", label: "Use Cases", icon: Users },
  { href: "#pricing", label: "Pricing", icon: CreditCard },
]

export function Sidebar({
  searchHistory,
  onSearchHistoryClick,
  onDeleteSearchHistory,
  onLogoClick,
  isDesktopExpanded,
  onDesktopExpandedChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationClass = "duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]"

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current)
      }
    }
  }, [])

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current)
      collapseTimerRef.current = null
    }
  }

  const handleDesktopEnter = () => {
    clearCollapseTimer()
    onDesktopExpandedChange(true)
  }

  const handleDesktopLeave = () => {
    if (isProfileMenuOpen) {
      return
    }

    clearCollapseTimer()
    collapseTimerRef.current = setTimeout(() => {
      onDesktopExpandedChange(false)
    }, 180)
  }

  const handleProfileMenuOpenChange = (open: boolean) => {
    setIsProfileMenuOpen(open)

    if (open) {
      clearCollapseTimer()
      onDesktopExpandedChange(true)
    }
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-65 p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent 
            searchHistory={searchHistory} 
            onNavLinkClick={() => setIsOpen(false)}
            onSearchHistoryClick={(term) => {
              onSearchHistoryClick(term)
              setIsOpen(false)
            }}
            onDeleteSearchHistory={onDeleteSearchHistory}
            onLogoClick={() => {
              onLogoClick()
              setIsOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar will-change-[width] transition-[width] motion-reduce:transition-none ${animationClass}`}
        style={{ width: isDesktopExpanded ? "220px" : "85px" }}
        onMouseEnter={handleDesktopEnter}
        onMouseLeave={handleDesktopLeave}
        onFocusCapture={handleDesktopEnter}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            handleDesktopLeave()
          }
        }}
      >
        <SidebarContent 
          searchHistory={searchHistory} 
          onSearchHistoryClick={onSearchHistoryClick}
          onDeleteSearchHistory={onDeleteSearchHistory}
          onLogoClick={onLogoClick}
          isCollapsed={!isDesktopExpanded}
          onProfileMenuOpenChange={handleProfileMenuOpenChange}
        />
      </aside>
    </>
  )
}

function SidebarContent({ 
  searchHistory, 
  onSearchHistoryClick,
  onDeleteSearchHistory,
  onLogoClick,
  onNavLinkClick,
  isCollapsed = false,
  onProfileMenuOpenChange,
}: { 
  searchHistory: string[]
  onSearchHistoryClick: (term: string) => void 
  onDeleteSearchHistory: (term: string) => void
  onLogoClick: () => void
  onNavLinkClick?: () => void
  isCollapsed?: boolean
  onProfileMenuOpenChange?: (open: boolean) => void
}) {
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const isDark = resolvedTheme !== "light"
  const recentSearches = [...searchHistory].reverse()
  const user = session?.user
  const userInitials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U"

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return

    event.preventDefault()
    const section = document.querySelector(href)
    if (section) {
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      })
      onNavLinkClick?.()
    } else {
      window.location.href = `/${href}`
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`${isCollapsed ? "p-1" : "p-1 pb-3"}`}>
        <Link
          href="/"
          onClick={onLogoClick}
          className={`flex min-w-0 ${isCollapsed ? "w-fit justify-center mx-auto" : "w-full items-center"}`}
        >
          <div className={`relative h-24 ${isCollapsed ? "w-20" : "w-full"} lg:h-28`}>
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-420 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
              }`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-accent ">
                <Image
                  src="/logo.svg"
                  alt="Darwinly"
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 object-contain"
                  priority
                />
              </span>
            </div>

            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-420 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isCollapsed ? "opacity-0 translate-x-1" : "opacity-100 translate-x-0"
              }`}
            >
              <span className="flex items-center gap-3 rounded-2xl bg-sidebar-accent px-3 py-2.5">
                <Image
                  src="/logo.svg"
                  alt="Darwinly"
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 object-contain"
                  priority
                />
                <span className="text-xl font-semibold leading-none tracking-tight">
                  <span className={isDark ? "text-white" : "text-black"}>Darwin</span>
                  <span className="text-zinc-500">ly</span>
                </span>
              </span>
            </div>
          </div>
        </Link>
      </div>

      {!isCollapsed ? (
        <>
          {/* Navigation */}
          <nav className="px-1 pb-3">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(event) => handleNavClick(event, link.href)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search History */}
          <div className="flex-1 min-h-0 px-4 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent searches
            </div>
            <ScrollArea className="h-full pr-1">
              {recentSearches.length > 0 ? (
                <ul className="space-y-1 pb-2">
                  {recentSearches.map((term, index) => (
                    <li key={`${term}-${index}`} className="group relative">
                      <button
                        onClick={() => onSearchHistoryClick(term)}
                        className="w-full text-left rounded-lg px-3 py-2 pr-8 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground truncate block"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation()
                          onDeleteSearchHistory(term)
                          if (!user) return
                          try {
                            await unlinkCurrentUserSearchByQuery(term)
                          } catch (error) {
                            console.error("Failed to unlink search from user history", error)
                          }
                        }}
                        aria-label={`Delete search ${term}`}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-sidebar-accent transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground/60">
                  Your search history will appear here.
                </p>
              )}
            </ScrollArea>
          </div>

          {/* Auth */}
          <div className="mt-auto p-1 pb-3">
            {user ? (
              <DropdownMenu onOpenChange={onProfileMenuOpenChange}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl bg-sidebar-accent px-3 py-2.5 text-left transition-colors hover:brightness-95"
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Logged in user"} />
                      <AvatarFallback className="text-sm font-medium">
                        {user.name ? userInitials : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.name ?? "Signed in"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" sideOffset={10} className="w-56">
                  <DropdownMenuItem onSelect={() => router.push("/usage")}>
                    <BarChart3 className="h-4 w-4" />
                    Usage
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/favoritos")}>
                    <Heart className="h-4 w-4" />
                    Starred
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/sign-in"
                className="flex w-full items-center gap-3 rounded-2xl bg-sidebar-accent px-3 py-2.5 transition-colors hover:brightness-95"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                  <LogIn className="h-5 w-5 text-muted-foreground" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Sign in</span>
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="mt-auto p-1 pb-3 flex justify-center">
          {user ? (
            <DropdownMenu onOpenChange={onProfileMenuOpenChange}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-accent transition-colors hover:brightness-95"
                  title={user.name ?? "Signed in user"}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Logged in user"} />
                    <AvatarFallback className="text-sm font-medium">
                      {user.name ? userInitials : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={10} className="w-56">
                <DropdownMenuItem onSelect={() => router.push("/usage")}>
                  <BarChart3 className="h-4 w-4" />
                  Usage
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/favoritos")}>
                  <Heart className="h-4 w-4" />
                  Starred
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/sign-in"
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar-accent transition-colors hover:brightness-95 group"
              title="Sign in"
            >
              <LogIn className="h-7 w-7 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
