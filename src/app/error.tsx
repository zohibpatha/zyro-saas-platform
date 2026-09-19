"use client"; 
import { Button } from "@/components/ui/button"; 
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) { 
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Something went wrong!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-center">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  ); 
}
