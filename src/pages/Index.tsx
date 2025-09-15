import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FileUpload } from "@/components/FileUpload";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section id="upload-section" className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upload Your File</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a file, choose your security settings, and get a secure share link. 
              All encryption happens in your browser for maximum security.
            </p>
          </div>
          
          <FileUpload />
        </div>
      </section>
    </div>
  );
};

export default Index;
