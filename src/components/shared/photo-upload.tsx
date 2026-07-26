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
    <div className="space-y-4">
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
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60"
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

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Click to upload photo evidence or drag & drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, JPEG up to 10MB each (max {maxFiles} photos)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {previews.map((src, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Uploaded photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-red-500 transition-colors"
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
