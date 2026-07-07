"use client";

import { useState } from "react";
import UploadField from "../components/upload-field";
import { ConfirmationModal } from "../components/confirmation-modal";
import Sidebar from "../components/sidebar";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState("Memorandum of Agreement");
  const [uploadFileLink, setUploadFileLink] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleUpload = async (files: File[]) => {
    console.log("Uploading files:", files.map((file) => file.name));
  };

  const handleUploadSave = async (payload: {
    fileName: string;
    fileLink: string;
    files: File[];
  }) => {
    console.log("Saving upload payload:", payload);
  };

  const handleUploadDelete = () => {
    console.log("Upload form cleared");
  };

  const handleUploadCancel = () => {
    console.log("Upload form cancelled");
  };

  const handleEditDeleteRequest = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = () => {
    console.log("Delete project confirmed");
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#F3F4F6]">

        <main className="min-w-0 w-full px-4 py-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center text-gray-700">
            Currently in progress :(
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Project"
        message="Delete this project? This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete Project"
        onCancel={handleDeleteConfirmCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
