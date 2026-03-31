import React, { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import CustomVideoPlayer from "./CustomVideoPlayer";

interface FileUploadFieldProps {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  hint?: string;
  placeholder?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  showVideoProgress?: boolean;
  videoMarkers?: { time: number; label?: string; colorClassName?: string }[];
  onVideoSeek?: (time: number) => void;
  onVideoMarkerClick?: (marker: { time: number; label?: string }) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  accept,
  file,
  onFileChange,
  hint,
  placeholder,
  videoRef,
  showVideoProgress,
  videoMarkers,
  onVideoSeek,
  onVideoMarkerClick,
}) => {
  const controlId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileType = file
    ? file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "file"
    : null;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const clearFile = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor={controlId}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
        {file && (
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs text-slate-200 transition hover:border-orange-400 hover:text-white"
          >
            <X size={14} />
            Удалить
          </button>
        )}
      </div>

      {file ? (
        <div
          className={`group block rounded-3xl border-2 border-dashed bg-slate-800/80 p-4 transition ${
            dragActive
              ? "border-orange-400 bg-slate-700/90"
              : "border-slate-700 hover:border-slate-500"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id={controlId}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 text-slate-100">
              {fileType === "image" && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-full object-cover"
                />
              ) : fileType === "video" && previewUrl ? (
                <div className="w-full">
                  <CustomVideoPlayer
                    src={previewUrl}
                    title={file.name}
                    thumbnailUrl={previewUrl}
                    mimeType={file.type}
                    showProgress={showVideoProgress ?? false}
                    wrapperClassName="rounded-2xl"
                    className="rounded-2xl"
                    videoRef={videoRef}
                    markers={videoMarkers}
                    onSeek={onVideoSeek}
                    onMarkerClick={onVideoMarkerClick}
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center px-4 text-sm text-slate-400">
                  {file.name}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={controlId}
          className={`group block rounded-3xl border-2 border-dashed bg-slate-800/80 p-4 transition ${
            dragActive
              ? "border-orange-400 bg-slate-700/90"
              : "border-slate-700 hover:border-slate-500"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id={controlId}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-14 text-center text-slate-400 transition group-hover:text-slate-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-200 transition group-hover:border-orange-400 group-hover:bg-orange-500/10">
              <Upload size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-100">
                Перетащите файл сюда
              </p>
              <p className="text-xs text-slate-500">
                или нажмите, чтобы выбрать
              </p>
              {placeholder ? (
                <p className="text-xs text-slate-400">{placeholder}</p>
              ) : null}
            </div>
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
          </div>
        </label>
      )}
    </div>
  );
};

export default FileUploadField;
