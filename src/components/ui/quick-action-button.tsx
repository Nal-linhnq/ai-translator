"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export default function QuickActionButton({
  id,
  icon: Icon,
  title,
  description,
  isActive,
  isLoading,
  onClick,
}: QuickActionButtonProps) {
  return (
    <Button
      id={id}
      variant={isActive ? "default" : "outline"}
      className="flex items-center justify-center gap-2 h-auto py-4"
      onClick={onClick}
      disabled={isLoading}
    >
      <Icon className="h-5 w-5" />
      <div className="flex flex-col items-start">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground text-left">
          {description}
        </span>
      </div>
      <ArrowRight className="h-4 w-4 ml-auto" />
    </Button>
  );
}
