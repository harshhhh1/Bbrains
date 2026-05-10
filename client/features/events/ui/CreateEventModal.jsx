"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { eventApi } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startdate: z.string().min(1, "Start date is required"),
  enddate: z.string().min(1, "End date is required"),
  location: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
});

export function CreateEventModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { uploadFile, isUploading, progress } = useCloudinaryUpload();
  const [bannerUrl, setBannerUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startdate: new Date().toISOString().split("T")[0],
      enddate: new Date().toISOString().split("T")[0],
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, { folder: "events" });
      if (url) {
        setBannerUrl(url);
        toast.success("Banner uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload banner");
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await eventApi.createEvent({
        ...values,
        banner: bannerUrl || undefined,
      });

      if (response.success) {
        toast.success("Event created successfully");
        reset();
        setBannerUrl("");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to create event");
      }
    } catch (error) {
      toast.error("An error occurred while creating the event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Event Title"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Event Details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Input
                id="type"
                {...register("type")}
                placeholder="e.g. Workshop, Sports"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startdate">Start Date *</Label>
              <Input id="startdate" type="date" {...register("startdate")} />
              {errors.startdate && (
                <p className="text-xs text-red-500">
                  {errors.startdate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="enddate">End Date *</Label>
              <Input id="enddate" type="date" {...register("enddate")} />
              {errors.enddate && (
                <p className="text-xs text-red-500">{errors.enddate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Event Venue"
            />
          </div>

          <div className="space-y-2">
            <Label>Banner Image</Label>
            {bannerUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                  src={bannerUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => setBannerUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-6">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Uploading... {progress}%
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <Label
                      htmlFor="banner-upload"
                      className="cursor-pointer text-sm text-primary hover:underline"
                    >
                      Click to upload banner
                    </Label>
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
