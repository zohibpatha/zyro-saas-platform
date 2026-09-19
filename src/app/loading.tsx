import { Loader2 } from "lucide-react"; 
export default function Loading() { 
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
    </div>
  ); 
}
