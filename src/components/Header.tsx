import { Button } from "@/components/ui/button";
import { Shield, User, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 gradient-primary rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SecureShare</h1>
            <p className="text-xs text-muted-foreground">End-to-end encrypted file sharing</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="/" 
            className="text-sm font-medium hover:text-primary transition-smooth"
          >
            Upload
          </a>
          <a 
            href="/manage" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            My Files
          </a>
          <a 
            href="/help" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
          >
            Help
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}