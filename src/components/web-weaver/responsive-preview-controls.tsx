
"use client";

import * as React from 'react';
import { Smartphone, Tablet, Monitor, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Size = { width: string; height: string };

const ControlButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" onClick={onClick} aria-label={label}>
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

export function ResponsivePreviewControls({ onSizeChange }: { onSizeChange: (size: Size) => void; }) {
  return (
    <div className="flex items-center gap-1">
      <ControlButton
        label="Mobile (375px)"
        onClick={() => onSizeChange({ width: '375px', height: '100%' })}
      >
        <Smartphone className="h-5 w-5" />
      </ControlButton>
      <ControlButton
        label="Tablet (768px)"
        onClick={() => onSizeChange({ width: '768px', height: '100%' })}
      >
        <Tablet className="h-5 w-5" />
      </ControlButton>
      <ControlButton
        label="Desktop (1280px)"
        onClick={() => onSizeChange({ width: '1280px', height: '100%' })}
      >
        <Monitor className="h-5 w-5" />
      </ControlButton>
       <ControlButton
        label="Fill Container"
        onClick={() => onSizeChange({ width: '100%', height: '100%' })}
      >
        <Expand className="h-5 w-5" />
      </ControlButton>
    </div>
  );
}
