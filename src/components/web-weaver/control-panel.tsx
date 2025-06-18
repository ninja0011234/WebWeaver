
"use client";

import type * as React from 'react';
import { Wand2, Edit3, Download, Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WebWeaverLogo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onEdit: () => void;
  onDownloadHtml: () => void;
  onDownloadCss: () => void;
  onDownloadJs: () => void;
  onClearCode: () => void;
  isLoading: boolean;
  hasCode: boolean;
  isPreviewVisible: boolean;
  togglePreview: () => void;
}

export function ControlPanel({
  prompt,
  setPrompt,
  onGenerate,
  onEdit,
  onDownloadHtml,
  onDownloadCss,
  onDownloadJs,
  onClearCode,
  isLoading,
  hasCode,
  isPreviewVisible,
  togglePreview,
}: ControlPanelProps) {
  const handlePrimaryAction = () => {
    if (hasCode) {
      onEdit();
    } else {
      onGenerate();
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <WebWeaverLogo />
          <Button variant="ghost" size="icon" onClick={togglePreview} aria-label={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
            {isPreviewVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <Separator className="my-2" />
        <CardTitle className="text-lg font-headline">Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-y-auto p-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor="prompt-input" className="text-sm font-medium">
            Describe your web application or desired changes:
          </Label>
          <Textarea
            id="prompt-input"
            placeholder="e.g., A simple to-do list app with a text input and an add button."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="resize-none bg-background focus:ring-primary"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-2"> {/* Changed to 1 column for the primary action button */}
          <Button onClick={handlePrimaryAction} disabled={isLoading || !prompt} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : (hasCode ? <Edit3 /> : <Wand2 />)}
            {hasCode ? 'Edit Code' : 'Generate Code'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!hasCode || isLoading} className="w-full">
                <Download />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onDownloadHtml} disabled={!hasCode}>
                HTML File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadCss} disabled={!hasCode}>
                CSS File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDownloadJs} disabled={!hasCode}>
                JavaScript File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onClearCode} variant="destructive" disabled={!hasCode || isLoading} className="w-full">
             <Trash2 /> Clear All
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI is weaving its magic...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
