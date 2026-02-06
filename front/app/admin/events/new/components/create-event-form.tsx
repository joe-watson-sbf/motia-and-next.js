"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEvent } from "@/query/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

// Define the schema for FORM INPUTS (what the user types)
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  // Slug is required but generated from title. We validate it as a string.
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  // User enters Dollars (e.g. 50.00), we validate it as a number
  price: z.number({ error: "Price is required" }).min(0, "Price must be positive"),
  totalSeats: z.number({ error: "Seats required" }).min(1, "At least 1 seat required"),
  thumbnail: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const CreateEventForm: React.FC & { Skeleton: React.FC } = () => {
  const router = useRouter();
  const createMutation = useCreateEvent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: 0,
      totalSeats: 100,
      thumbnail: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Transform logic happens here:
      // 1. Price: Dollars -> Cents (multiply by 100)
      // 2. Slug: Ensure it exists (though schema enforces min(1))
      await createMutation.mutateAsync({
        ...values,
        price: Math.round(values.price * 100),
        thumbnail: values.thumbnail || undefined,
        description: values.description || undefined,
      });
      router.push("/admin");
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Summer Concert 2025"
                  onChange={(e) => {
                    field.onChange(e);
                    // Auto-generate slug if user hasn't manually edited it significantly
                    // Or just simplified: always suggest one if slug is empty or we want to sync
                    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(e.target.value.slice(0, -1))) {
                      form.setValue("slug", generateSlug(e.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="summer-concert-2025" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className='max-h-96' placeholder="Event description..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Seats</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/image.jpg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {createMutation.error && (
          <p className="text-sm text-destructive">
            {(createMutation.error as Error).message}
          </p>
        )}
      </form>
    </Form>
  );
};

CreateEventForm.displayName = "CreateEventForm";

CreateEventForm.Skeleton = function CreateEventFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
};

CreateEventForm.Skeleton.displayName = "CreateEventForm.Skeleton";

export default CreateEventForm;
