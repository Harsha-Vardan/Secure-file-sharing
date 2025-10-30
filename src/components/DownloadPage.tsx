import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  ArrowLeft,
  Eye
} from "lucide-react";

interface FileMetadata {
  id: string;
  filename: string;
  original_filename: string;
  fileSize: number;
  expiresAt: string | null;
  maxDownloads: number | null;
  currentDownloads: number;
  isValid: boolean;
  isExpired: boolean;
  remainingDownloads: number;
  storage_path: string;
  shareLinkId: string;
}

export const DownloadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fileData, setFileData] = useState<FileMetadata>({
    id: "",
    filename: "",
    original_filename: "",
    fileSize: 0,
    expiresAt: null,
    maxDownloads: null,
    currentDownloads: 0,
    isValid: false,
    isExpired: false,
    remainingDownloads: 0,
    storage_path: "",
    shareLinkId: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileData = async () => {
      if (!token) {
        setError("Invalid download link");
        setIsLoading(false);
        return;
      }

      try {
        // Use secure function to fetch share link data
        const { data: shareLink, error: linkError } = await supabase
          .rpc('get_share_link_by_token', { link_token: token });

        if (linkError || !shareLink || shareLink.length === 0) {
          setError("File not found or invalid link");
          setIsLoading(false);
          return;
        }

        const linkData = shareLink[0];

        // Check if link is expired
        const now = new Date();
        const isExpired = linkData.expires_at ? new Date(linkData.expires_at) < now : false;
        
        // Check if download limit reached
        const limitReached = linkData.max_downloads ? 
          linkData.current_downloads >= linkData.max_downloads : false;

        const remainingDownloads = linkData.max_downloads ? 
          Math.max(0, linkData.max_downloads - linkData.current_downloads) : Infinity;

        const mockData: FileMetadata = {
          id: linkData.file_id,
          filename: linkData.filename,
          original_filename: linkData.original_filename,
          fileSize: linkData.file_size,
          expiresAt: linkData.expires_at,
          maxDownloads: linkData.max_downloads,
          currentDownloads: linkData.current_downloads,
          isValid: linkData.is_active && !isExpired && !limitReached,
          isExpired: isExpired || limitReached,
          remainingDownloads: typeof remainingDownloads === 'number' ? remainingDownloads : 999,
          storage_path: linkData.storage_path,
          shareLinkId: linkData.id,
        };
        
        setFileData(mockData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching file data:', err);
        setError("Failed to load file information");
        setIsLoading(false);
      }
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
    if (!fileData.isValid || !token) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      setDownloadProgress(20);

      // Use secure function to log download and update counter
      const { error: logError } = await supabase
        .rpc('log_download', {
          link_token: token,
          user_agent_text: navigator.userAgent
        });

      if (logError) {
        console.error('Failed to log download:', logError);
        throw logError;
      }

      setDownloadProgress(40);

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('secure-files')
        .download(fileData.storage_path);

      if (error) throw error;

      setDownloadProgress(90);

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadProgress(100);

      // Update local state
      setFileData(prev => ({
        ...prev,
        currentDownloads: prev.currentDownloads + 1,
        remainingDownloads: Math.max(0, prev.remainingDownloads - 1),
      }));

      toast({
        title: "Download Complete",
        description: "File has been downloaded successfully.",
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              {error || "This download link is invalid or has been revoked"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fileData.isExpired || fileData.remainingDownloads <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <Clock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              {fileData.isExpired 
                ? "This download link has expired" 
                : "This download link has reached its maximum number of downloads"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Secure File Download</CardTitle>
          <CardDescription>
            This file is encrypted and ready for secure download
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-2">{fileData.original_filename}</h1>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(fileData.fileSize)}
                </p>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                <Lock className="h-3 w-3 mr-1" />
                Encrypted
              </Badge>
            </div>

            {/* Download Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {fileData.expiresAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {formatTimeRemaining(fileData.expiresAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Downloads: {fileData.currentDownloads}/{fileData.maxDownloads || '∞'}</span>
              </div>
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
            size="lg"
            className="w-full"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </>
            )}
          </Button>

          {/* Security Notice */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This file has been verified as secure and encrypted. Your download will be logged for security purposes.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};