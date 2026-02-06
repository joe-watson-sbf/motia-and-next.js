import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getEventImage(url: string | undefined | null) {
  return url || "https://images.unsplash.com/photo-1464047736614-af63643285bf?q=80&w=1048&auto=format&fit=crop";
}