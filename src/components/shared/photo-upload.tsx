"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  maxFiles?: number;
}

export function PhotoUpload({
  onPhotosChange,
  maxFiles = 4,
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const updated = [...selectedFiles, ...newFiles].slice(0, maxFiles);
    setSelectedFiles(updated);
    onPhotosChange(updated);

    // Create image previews
    const newPreviews = updated.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onPhotosChange(updatedFiles);

    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
  };

  return (
    <div className="space-y-4 relative z-10">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-350 ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-800 bg-[#070b14]/40 hover:border-slate-700 hover:bg-slate-900/30"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3 group/zone">
          <div className="w-12 h-12 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-emerald-400 shadow-md group-hover/zone:scale-105 transition-transform duration-300">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Click to upload photo evidence or drag & drop
            </p>
            <p className="text-xs text-slate-450 mt-1.5 font-medium">
              Supports PNG, JPG, JPEG up to 10MB each (max {maxFiles} photos)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          {previews.map((src, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-xl overflow-hidden border border-slate-850 bg-slate-900 group shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Uploaded photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-xl bg-slate-950/80 text-slate-350 hover:text-foreground hover:bg-red-650 transition-all duration-300 backdrop-blur-md cursor-pointer border border-slate-800/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


