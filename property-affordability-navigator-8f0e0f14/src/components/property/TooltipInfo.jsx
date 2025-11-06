import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export default function TooltipInfo({ content }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="text-blue-500 hover:text-blue-700 transition-colors">
          <Info className="w-4 h-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-3 text-sm">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}