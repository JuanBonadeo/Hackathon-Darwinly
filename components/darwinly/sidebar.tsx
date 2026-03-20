"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Clock, 
  LogIn, 
  UserPlus, 
  Menu,
  Layers,
  Lightbulb,
  Users,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

interface SidebarProps {
  searchHistory: string[]
  onSearchHistoryClick: (term: string) => void
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
  isDesktopExpanded,
  onDesktopExpandedChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

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
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300"
        style={{ width: isDesktopExpanded ? "260px" : "72px" }}
        onMouseEnter={() => onDesktopExpandedChange(true)}
        onMouseLeave={() => onDesktopExpandedChange(false)}
        onFocusCapture={() => onDesktopExpandedChange(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            onDesktopExpandedChange(false)
          }
        }}
      >
        <SidebarContent 
          searchHistory={searchHistory} 
          onSearchHistoryClick={onSearchHistoryClick}
          isCollapsed={!isDesktopExpanded}
        />
      </aside>
    </>
  )
}

function SidebarContent({ 
  searchHistory, 
  onSearchHistoryClick,
  isCollapsed = false,
}: { 
  searchHistory: string[]
  onSearchHistoryClick: (term: string) => void 
  isCollapsed?: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-4 pb-3">
        <Link href="/" className="flex items-center min-w-0">
          {isCollapsed ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-lg font-semibold text-foreground">
              D
            </span>
          ) : (
            <>
            <span className="text-2xl font-semibold text-foreground">Darwin</span>
            <span className="text-2xl font-semibold text-muted-foreground">ly</span>
            </>
          )}
        </Link>
      </div>

      {!isCollapsed ? (
        <>
          {/* Navigation */}
          <nav className="px-4 pb-6">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search History */}
          <div className="flex-1 px-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3 w-3" />
              Recent searches
            </div>
            <ScrollArea className="h-[200px]">
              {searchHistory.length > 0 ? (
                <ul className="space-y-1">
                  {searchHistory.map((term, index) => (
                    <li key={`${term}-${index}`}>
                      <button
                        onClick={() => onSearchHistoryClick(term)}
                        className="w-full text-left rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground truncate"
                      >
                        {term}
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

          {/* Auth Buttons */}
          <div className="mt-auto p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent"
            >
              <UserPlus className="h-4 w-4" />
              Sign up
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-auto px-3 pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            title="Log in"
          >
            <LogIn className="h-4 w-4" />
            <span className="sr-only">Log in</span>
          </Button>
        </div>
      )}
    </div>
  )
}
