import Link from "next/link"

const productLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" }
]

const resourceLinks = [
  { href: "#", label: "API Docs" },
  { href: "#", label: "GitHub" }
]

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Contact" }
]

const builtWith = [
  "Next.js",
  "Claude AI",
  "Open Library",
  "CORE",
  "NYT",
  "TMDB",
  "Wikipedia"
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-3">
              <span className="text-xl font-semibold text-foreground">Darwin</span>
              <span className="text-xl font-semibold text-muted-foreground">ly</span>
            </Link>
            <p className="text-sm text-muted-foreground font-light">
              The Google Trends of human knowledge.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Built With & Copyright */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs text-muted-foreground/60 font-light">
              © 2026 Darwinly. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/50 font-light">
              Made by{" "}
              <a
                href="https://github.com/JuanBonadeo"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Juan Bonadeo
              </a>
              {" & "}
              <a
                href="https://github.com/Gonzacaser"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Gonzalo Casermeiro
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs text-muted-foreground/60 font-light">Built with</span>
            {builtWith.map((tech, index) => (
              <span key={tech} className="text-xs text-muted-foreground/60 font-light">
                {tech}{index < builtWith.length - 1 && " ·"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
