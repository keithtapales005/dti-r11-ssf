'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { MdClose } from 'react-icons/md';
import { DynamicButton } from './dynamic-buttons';
import { CloudUploadIcon } from './icons';
import InputField from './input-field';

interface UploadFieldProps {
  mode?: "add" | "edit";
  title?: string;
  label?: string;
  fileName?: string;
  fileLink?: string;
  onFileNameChange?: (value: string) => void;
  onFileLinkChange?: (value: string) => void;
  onCancel?: () => void;
  onRequestDeleteProject?: () => void;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void> | void;
  onSave?: (payload: { fileName: string; fileLink: string; files: File[] }) => Promise<void> | void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  customStyle?: React.CSSProperties;
}

interface FileCardData {
  file: File;
  previewUrl?: string;
}

export default function UploadField({
  mode = 'add',
  title = 'Edit File',
  label = 'Upload Image (Optional)',
  fileName,
  fileLink,
  onFileNameChange,
  onFileLinkChange,
  onCancel,
  onRequestDeleteProject,
  files,
  onFilesChange,
  onUpload,
  onSave,
  maxFiles = 30,
  accept = '*/*',
  disabled = false,
  customStyle,
}: UploadFieldProps) {
  const [internalFileName, setInternalFileName] = useState('');
  const [internalFileLink, setInternalFileLink] = useState('');
  const [internalFiles, setInternalFiles] = useState<File[]>(files || []);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFileName = fileName ?? internalFileName;
  const activeFileLink = fileLink ?? internalFileLink;
  const activeFiles = files ?? internalFiles;

  const fileCards: FileCardData[] = useMemo(() => {
    return activeFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        file,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
  }, [activeFiles]);

  useEffect(() => {
    return () => {
      fileCards.forEach((card) => {
        if (card.previewUrl) {
          URL.revokeObjectURL(card.previewUrl);
        }
      });
    };
  }, [fileCards]);

  const updateFiles = (nextFiles: File[]) => {
    if (files === undefined) {
      setInternalFiles(nextFiles);
    }
    onFilesChange?.(nextFiles);
  };

  const updateFileName = (nextValue: string) => {
    if (fileName === undefined) {
      setInternalFileName(nextValue);
    }
    onFileNameChange?.(nextValue);
  };

  const updateFileLink = (nextValue: string) => {
    if (fileLink === undefined) {
      setInternalFileLink(nextValue);
    }
    onFileLinkChange?.(nextValue);
  };

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) {
      return;
    }

    const picked = Array.from(selectedFiles);
    const merged = [...activeFiles, ...picked];
    const limited = merged.slice(0, maxFiles);
    updateFiles(limited);
  };

  const removeFileAt = (index: number) => {
    const nextFiles = activeFiles.filter((_, i) => i !== index);
    updateFiles(nextFiles);
  };

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSave = async () => {
    if (disabled) {
      return;
    }

    try {
      setIsSaving(true);
      await onUpload?.(activeFiles);
      await onSave?.({
        fileName: activeFileName,
        fileLink: activeFileLink,
        files: activeFiles,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = mode === 'edit';
  const secondaryActionLabel = isEditMode ? 'Delete Project' : 'Cancel';
  const primaryActionLabel = isEditMode ? 'Save Changes' : 'Add Project';

  const handleSecondaryAction = () => {
    if (isEditMode) {
      onRequestDeleteProject?.();
      return;
    }

    onCancel?.();
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    width: '666px',
    padding: '40px 28px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '10px',
    background: '#FDFDFD',
    boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
    position: 'relative',
    ...customStyle,
  };

  const slotWrapStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#F3F4F6',
    maxHeight: '200px',
    overflowY: 'hidden',
    overflowX: 'auto',
    alignItems: 'flex-start',
  };

  const slotStyle: React.CSSProperties = {
    width: '160px',
    height: '160px',
    minWidth: '160px',
    borderRadius: '14px',
    border: isDragging ? '2px dashed #0F2F88' : '2px dashed #183A8B',
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '12px',
    textAlign: 'center',
  };

  const fileCardStyle: React.CSSProperties = {
    width: '160px',
    height: '160px',
    minWidth: '160px',
    borderRadius: '14px',
    border: '1px solid #7C92C8',
    background: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.6';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        aria-label="Close upload form"
      >
        <MdClose size={24} color="#002075" />
      </button>

      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#002075',
          margin: '0 0 24px 0',
          textAlign: 'center',
          fontFamily: 'inherit',
          width: '100%',
        }}
      >
        {title}
      </h1>

      <div style={{ width: '100%' }}>
        <InputField
          label="File Name"
          name="fileName"
          value={activeFileName}
          onChange={updateFileName}
          placeholder="Enter file name"
          required
          disabled={disabled}
        />
      </div>

      <h3
        style={{
          margin: '14px 0 0 0',
          color: '#002075',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1,
          fontFamily: 'Inter',
        }}
      >
        {label}
      </h3>

      <div style={slotWrapStyle}>
        <div
          style={slotStyle}
          onClick={openPicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              openPicker();
            }
          }}
          aria-label="Upload files"
        >
          <CloudUploadIcon size={32} stroke="#0F2F88" strokeWidth={2.5} />
          <p style={{ margin: '6px 0 0 0', color: '#0F2F88', fontWeight: 700, lineHeight: 1.2, fontSize: '10px' }}>
            Drag and drop
            <br />
            or click
          </p>
        </div>

        {fileCards.map((card, index) => (
          <div key={`${card.file.name}-${index}`} style={fileCardStyle}>
            <button
              type="button"
              onClick={() => removeFileAt(index)}
              className="absolute right-3 top-3 text-[#182286] hover:text-[#002075] transition-colors flex items-center justify-center"
              style={{
                border: 'none',
                background: 'transparent',
                lineHeight: 1,
                cursor: 'pointer',
              }}
              aria-label={`Remove ${card.file.name}`}
            >
              <HiX size={22} />
            </button>

            {card.previewUrl ? (
              <img
                src={card.previewUrl}
                alt={card.file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ padding: '18px', textAlign: 'center', color: '#334155' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>{card.file.name}</div>
                <div style={{ fontSize: '11px' }}>{(card.file.size / 1024).toFixed(1)} KB</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', marginTop: '14px' }}>
        <InputField
          label="File Link (Optional)"
          name="fileLink"
          value={activeFileLink}
          onChange={updateFileLink}
          placeholder="https://drive.google.com/..."
          type="url"
          disabled={disabled}
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => addFiles(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div style={{ width: '100%', display: 'flex', gap: '16px', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ flex: 1 }}>
          <DynamicButton
            label={secondaryActionLabel}
            variant={isEditMode ? 'red' : 'white'}
            size="medium"
            fullWidth
            disabled={disabled}
            onClick={handleSecondaryAction}
          />
        </div>
        <div style={{ flex: 1 }}>
          <DynamicButton
            label={primaryActionLabel}
            variant="blue"
            size="medium"
            fullWidth
            loading={isSaving}
            disabled={disabled}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
