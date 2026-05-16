"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyUrlButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/league/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? "Copied!" : "Copy URL"}
    </Button>
  );
}
