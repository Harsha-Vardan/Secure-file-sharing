import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileIcon, 
  Lock,
  Eye,
  XCircle 
} from "lucide-react";

interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  uploadDate: string;
  expiresAt: string;
  maxDownloads: number;
  remainingDownloads: number;
  isValid: boolean;
  isExpired: boolean;
}

export function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [fileData, setFileData] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate fetching file metadata
  useEffect(() => {
    const fetchFileData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate file metadata (in real app, this would come from your backend)
      if (token) {
        const mockData: FileMetadata = {
          id: token,
          filename: "SecureDocument.pdf",
          size: 2500000, // 2.5MB
          uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
          maxDownloads: 5,
          remainingDownloads: 3,
          isValid: true,
          isExpired: false,
        };
        
        setFileData(mockData);
      } else {
        setError("Invalid download link");
      }
      
      setIsLoading(false);
    };

    fetchFileData();
  }, [token]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleDownload = async () => {
    if (!fileData) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(i);
      }

      // Simulate file download (in real app, this would trigger actual file download)
      const blob = new Blob(["This is a simulated encrypted file content"], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update remaining downloads
      setFileData(prev => prev ? { ...prev, remainingDownloads: prev.remainingDownloads - 1 } : null);

      toast({
        title: "Download started",
        description: "Your encrypted file is being downloaded.",
      });

    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Verifying download link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !fileData || !fileData.isValid) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive-light rounded-full w-fit">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              {error || "This download link is invalid or has been revoked"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fileData.isExpired || fileData.remainingDownloads <= 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md border-warning">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-warning-light rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-warning">Link Expired</CardTitle>
            <CardDescription>
              {fileData.isExpired 
                ? "This download link has expired" 
                : "This download link has reached its maximum number of downloads"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-success-light rounded-full w-fit">
            <Shield className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Secure File Download</CardTitle>
          <CardDescription>
            This file is encrypted and ready for secure download
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="p-2 bg-primary-light rounded-lg">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{fileData.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(fileData.size)}
                </p>
              </div>
              <Badge variant="outline" className="border-success text-success">
                <Lock className="h-3 w-3 mr-1" />
                Encrypted
              </Badge>
            </div>

            {/* Download Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time remaining</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeRemaining(fileData.expiresAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Downloads left</p>
                  <p className="text-sm text-muted-foreground">
                    {fileData.remainingDownloads} of {fileData.maxDownloads}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Information */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Uploaded {new Date(fileData.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Download Progress */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Downloading...</span>
                <span className="text-sm text-muted-foreground">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download File
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-accent-light rounded-lg">
            <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent">Security Verified</p>
              <p className="text-accent/80">
                This file has been verified as secure and encrypted. Your download will be logged for security purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}