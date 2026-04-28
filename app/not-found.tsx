import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-16">
      <div className="text-6xl">⚽</div>
      <h1 className="text-2xl font-bold text-green-800">Page not found</h1>
      <p className="text-gray-600">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild className="bg-green-700 hover:bg-green-800">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
