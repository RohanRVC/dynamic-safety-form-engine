import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Video, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VideoUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      return;
    }

    setUploading(true);
    try {
      // In production, this would upload to Supabase storage
      // For now, create a local object URL as placeholder
      const url = URL.createObjectURL(file);
      onChange(url);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleRemove = () => {
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
    onChange(null);
  };

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border bg-card">
        <video
          src={value}
          className="w-full h-40 object-cover"
          controls
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={handleRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="p-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Video uploaded</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Video className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Drop video here or click to upload</p>
          <p className="text-xs text-muted-foreground">MP4, WebM up to 100MB</p>
        </div>
      )}
    </div>
  );
}
