"use client";

import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePlaylist } from "@/lib/data/playlists";
import type { Playlist } from "@/lib/db/schema";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
}

export function EditPlaylistModal({
  isOpen,
  onClose,
  playlist,
}: EditPlaylistModalProps) {
  const router = useRouter();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("playlistId", playlist.id);
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("isPublic", isPublic.toString());

      await updatePlaylist(formData);
      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update playlist",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Edit Playlist</h3>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            <Input
              label="Playlist Name"
              placeholder="Enter playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
              maxLength={255}
            />

            <div>
              <label
                htmlFor="edit-description"
                className="block text-sm font-medium mb-2"
              >
                Description (optional)
              </label>
              <Textarea
                id="edit-description"
                placeholder="Enter playlist description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
              />
            </div>

            <Checkbox isSelected={isPublic} onValueChange={setIsPublic}>
              Make playlist public
            </Checkbox>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color={isSubmitting ? "default" : "primary"}
                disabled={isSubmitting}
                className="min-w-[100px] font-medium"
              >
                {isSubmitting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
