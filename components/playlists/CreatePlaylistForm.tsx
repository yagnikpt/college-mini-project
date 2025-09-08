"use client";

import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useState } from "react";
import { createPlaylist } from "@/lib/data/user";

interface CreatePlaylistFormProps {
  onSuccess: () => void;
}

export function CreatePlaylistForm({ onSuccess }: CreatePlaylistFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
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
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("isPublic", isPublic.toString());

      await createPlaylist(formData);

      // Reset form
      setName("");
      setDescription("");
      setIsPublic(false);

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create playlist",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Playlist Name"
        placeholder="Enter playlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        isRequired
        maxLength={255}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          placeholder="Enter playlist description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
        <Button
          type="submit"
          color="primary"
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Create Playlist"
          )}
        </Button>
      </div>
    </form>
  );
}
