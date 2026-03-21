"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { 
  Clock, 
  LogIn, 
  UserPlus, 
  Menu,
  Layers,
  Lightbulb,
  Users,
  CreditCard,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

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
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    clearCollapseTimer()
    collapseTimerRef.current = setTimeout(() => {
      onDesktopExpandedChange(false)
    }, 140)
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
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent 
            searchHistory={searchHistory} 
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
        className="hidden lg:flex fixed left-0 top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar will-change-[width] transition-[width] duration-500 ease-out"
        style={{ width: isDesktopExpanded ? "260px" : "120px" }}
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
  isCollapsed = false,
}: { 
  searchHistory: string[]
  onSearchHistoryClick: (term: string) => void 
  onDeleteSearchHistory: (term: string) => void
  onLogoClick: () => void
  isCollapsed?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== "light"
  const recentSearches = [...searchHistory].reverse()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`${isCollapsed ? "p-2" : "p-4 pb-3"}`}>
        <Link
          href="/"
          onClick={onLogoClick}
          className={`flex min-w-0 ${isCollapsed ? "w-fit justify-center mx-auto" : "w-full items-center"}`}
        >
          <div className={`relative h-24 ${isCollapsed ? "w-20" : "w-full"} lg:h-28`}>
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
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
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
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
                    <li key={`${term}-${index}`}>
                      <div className="group flex items-center gap-1 rounded-lg px-1 py-1 transition-colors hover:bg-sidebar-accent">
                        <button
                          onClick={() => onSearchHistoryClick(term)}
                          className="min-w-0 flex-1 text-left rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground truncate"
                        >
                          {term}
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteSearchHistory(term)
                          }}
                          aria-label={`Delete search ${term}`}
                          title="Delete search"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

          {/* Auth Buttons */}
          <div className="mt-auto p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent"
            >
              <LogIn className="h-5 w-5" />
              Log in
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent"
            >
              <UserPlus className="h-5 w-5" />
              Sign up
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-auto flex justify-center px-3 pb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 border-border bg-transparent hover:bg-sidebar-accent"
            title="Sign in"
          >
            <LogIn className="h-5 w-5" />
            <span className="sr-only">Sign in</span>
          </Button>
        </div>
      )}
    </div>
  )
}
