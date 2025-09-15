import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Clock, Download, ArrowRight } from "lucide-react";

export function Hero() {
  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
    uploadSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero text-white">
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="border-white/20 text-white bg-white/10 backdrop-blur-sm"
          >
            <Shield className="h-3 w-3 mr-1" />
            AES-256 Encrypted File Sharing
          </Badge>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Share Files
              <br />
              <span className="text-accent-light">Securely</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
              End-to-end encrypted file sharing with automatic expiration. 
              Your files are encrypted in your browser before upload.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="p-2 bg-white/20 rounded-lg">
                <Lock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Client-side Encryption</h3>
                <p className="text-sm text-white/70">AES-256 encryption in browser</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Auto Expiration</h3>
                <p className="text-sm text-white/70">Time & download limits</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="p-2 bg-white/20 rounded-lg">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Simple Sharing</h3>
                <p className="text-sm text-white/70">One-click secure links</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              onClick={scrollToUpload}
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white hover:text-primary transition-bounce"
            >
              Start Sharing Securely
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-sm text-white/60">
              No registration required • Files up to 100MB • Free to use
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
    </section>
  );
}