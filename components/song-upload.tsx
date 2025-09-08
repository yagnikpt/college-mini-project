"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Upload } from "lucide-react";
import { useState } from "react";
import { createSong } from "@/lib/data/user";
import { UploadButton } from "@/utils/uploadthing";

const GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "Reggae",
  "Blues",
  "Folk",
  "Indie",
  "Alternative",
  "Metal",
  "Punk",
  "Funk",
  "Soul",
  "Disco",
  "Techno",
  "House",
  "Ambient",
  "Other",
];

interface UploadResponse {
  ufsUrl: string;
  key: string;
  name: string;
}

interface SongUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function SongUploadModal({ isOpen, onClose, onSuccess }: SongUploadModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = async (res: UploadResponse[]) => {
    if (!res?.[0]) return;

    setIsUploading(true);
    try {
      // Get audio duration (this is a simplified approach)
      // In a real app, you'd want to extract this from the file metadata
      const audio = new Audio(res[0].ufsUrl);
      await new Promise((resolve) => {
        audio.addEventListener("loadedmetadata", resolve);
      });
      const duration = Math.floor(audio.duration);

      // Create FormData for server action
      const formData = new FormData();
      formData.append("title", title || res[0].name.replace(/\.[^/.]+$/, ""));
      formData.append("artist", artist || "Unknown Artist");
      formData.append("description", description || "");
      formData.append("genre", genre || "");
      formData.append("fileUrl", res[0].ufsUrl);
      formData.append("fileKey", res[0].key);
      formData.append("duration", duration.toString());

      await createSong(formData);

      // Reset form
      setTitle("");
      setArtist("");
      setDescription("");
      setGenre("");

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving song:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Upload Song</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Song Title"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              label="Artist"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />

            <Input
              label="Description (optional)"
              placeholder="Enter song description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Select
              label="Genre (optional)"
              placeholder="Select genre"
              selectedKeys={genre ? [genre] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setGenre(selected || "");
              }}
            >
              {GENRES.map((g) => (
                <SelectItem key={g}>{g}</SelectItem>
              ))}
            </Select>

            <div className="flex justify-center">
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Saving song...</span>
                </div>
              ) : (
                <UploadButton
                  endpoint="audioUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={(error) => {
                    console.error("Upload error:", error);
                  }}
                  appearance={{
                    button: {
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      borderRadius: "0.5rem",
                      padding: "0.5rem 1rem",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function SongUpload({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSuccess = () => {
    onSuccess?.();
  };

  return (
    <>
      <Button
        color="primary"
        startContent={<Upload className="w-4 h-4" />}
        onPress={onOpen}
      >
        Upload Song
      </Button>

      <SongUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}
