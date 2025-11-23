"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreatePlaylistForm } from "./CreatePlaylistForm";
import { PlaylistsList } from "./PlaylistsList";

export function PlaylistsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const handlePlaylistCreated = () => {
    onClose();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Playlists
            </h1>
            <p className="text-muted-foreground">
              Create and manage your music playlists
            </p>
          </div>

          <Button
            color="primary"
            startContent={<Plus className="size-5" />}
            onPress={onOpen}
            className="font-medium"
          >
            New Playlist
          </Button>
        </div>

        {/* Playlists List */}
        <PlaylistsList />

        {/* Create Playlist Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">New Playlist</h3>
            </ModalHeader>
            <ModalBody>
              <CreatePlaylistForm onSuccess={handlePlaylistCreated} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
