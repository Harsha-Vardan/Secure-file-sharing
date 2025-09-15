import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Shield, Clock, Download, Copy, Check, AlertCircle, Lock } from "lucide-react";

interface FileUploadState {
  file: File | null;
  isEncrypting: boolean;
  isUploading: boolean;
  encryptionProgress: number;
  uploadProgress: number;
  shareLink: string | null;
  expirationTime: string;
  maxDownloads: string;
  isComplete: boolean;
}

export function FileUpload() {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isEncrypting: false,
    isUploading: false,
    encryptionProgress: 0,
    uploadProgress: 0,
    shareLink: null,
    expirationTime: "24",
    maxDownloads: "5",
    isComplete: false,
  });
  
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simulate client-side AES encryption
  const simulateEncryption = async (file: File): Promise<void> => {
    setState(prev => ({ ...prev, isEncrypting: true, encryptionProgress: 0 }));
    
    // Simulate encryption progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setState(prev => ({ ...prev, encryptionProgress: i }));
    }
    
    setState(prev => ({ ...prev, isEncrypting: false }));
  };

  // Simulate file upload
  const simulateUpload = async (): Promise<void> => {
    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setState(prev => ({ ...prev, uploadProgress: i }));
    }
    
    // Generate a simulated secure share link
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const shareLink = `${window.location.origin}/download/${token}`;
    
    setState(prev => ({ 
      ...prev, 
      isUploading: false,
      shareLink,
      isComplete: true 
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setState(prev => ({ ...prev, file, isComplete: false, shareLink: null }));
    }
  };

  const handleUpload = async () => {
    if (!state.file) return;

    try {
      await simulateEncryption(state.file);
      await simulateUpload();
      
      toast({
        title: "File uploaded successfully!",
        description: "Your file has been encrypted and is ready to share.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (state.shareLink) {
      await navigator.clipboard.writeText(state.shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isProcessing = state.isEncrypting || state.isUploading;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary-light rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Secure File Upload</CardTitle>
          <CardDescription>
            Files are encrypted client-side before upload using AES-256 encryption
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-smooth"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
              
              {state.file ? (
                <div className="space-y-2">
                  <div className="p-3 bg-success-light rounded-lg w-fit mx-auto">
                    <Upload className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium">{state.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(state.file.size)}
                  </p>
                  <Badge variant="outline" className="border-success text-success">
                    <Lock className="h-3 w-3 mr-1" />
                    Ready for encryption
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">Choose a file to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 100MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Expiration Settings */}
          {state.file && !state.isComplete && (
            <Tabs defaultValue="time" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="time">Time-based</TabsTrigger>
                <TabsTrigger value="downloads">Download-based</TabsTrigger>
              </TabsList>
              
              <TabsContent value="time" className="space-y-4">
                <div className="space-y-2">
                  <Label>Link expires after</Label>
                  <Select value={state.expirationTime} onValueChange={(value) => setState(prev => ({ ...prev, expirationTime: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="downloads" className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum downloads</Label>
                  <Select value={state.maxDownloads} onValueChange={(value) => setState(prev => ({ ...prev, maxDownloads: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 download</SelectItem>
                      <SelectItem value="3">3 downloads</SelectItem>
                      <SelectItem value="5">5 downloads</SelectItem>
                      <SelectItem value="10">10 downloads</SelectItem>
                      <SelectItem value="25">25 downloads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Progress Indicators */}
          {state.isEncrypting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Encrypting file...</Label>
                <span className="text-sm text-muted-foreground">{state.encryptionProgress}%</span>
              </div>
              <Progress value={state.encryptionProgress} className="h-2" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Using AES-256 encryption
              </div>
            </div>
          )}

          {state.isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Uploading encrypted file...</Label>
                <span className="text-sm text-muted-foreground">{state.uploadProgress}%</span>
              </div>
              <Progress value={state.uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          {state.file && !state.isComplete && (
            <Button 
              onClick={handleUpload}
              disabled={isProcessing}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {state.isEncrypting ? "Encrypting..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Encrypt & Upload
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Share Link Section */}
      {state.shareLink && (
        <Card className="shadow-lg border-success">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success-light rounded-full">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">File Ready to Share</CardTitle>
                <CardDescription>Your encrypted file is ready for secure sharing</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Secure Download Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={state.shareLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={copyToClipboard}
                  variant={linkCopied ? "success" : "outline"}
                  size="icon"
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Link Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Expires in</p>
                  <p className="text-sm text-muted-foreground">{state.expirationTime} hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Max downloads</p>
                  <p className="text-sm text-muted-foreground">{state.maxDownloads} downloads</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-accent-light rounded-lg">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent">Security Notice</p>
                <p className="text-accent/80">This link provides access to your encrypted file. Share it only with intended recipients.</p>
              </div>
            </div>

            <Button 
              onClick={() => setState(prev => ({ ...prev, file: null, isComplete: false, shareLink: null }))}
              variant="outline"
              className="w-full"
            >
              Upload Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}