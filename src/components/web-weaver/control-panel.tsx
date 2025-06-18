
"use client";

import type * as React from 'react';
import { Wand2, Edit3, Download, Loader2, Trash2, Eye, EyeOff, Save, FolderOpen, FolderArchive, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { WebWeaverLogo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';

interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  prompt: string;
}

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
  projects: Project[];
  onSaveProject: () => void; // Simplified: page.tsx handles prompt for name
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  currentProjectId: string | null;
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
  projects,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  currentProjectId,
}: ControlPanelProps) {
  const handlePrimaryAction = () => {
    if (hasCode) {
      onEdit();
    } else {
      onGenerate();
    }
  };

  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name;

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <WebWeaverLogo />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={togglePreview} aria-label={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
              {isPreviewVisible ? <EyeOff /> : <Eye />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Project Actions">
                  <FolderArchive className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Project</DropdownMenuLabel>
                <DropdownMenuItem onSelect={onSaveProject} disabled={!hasCode && !prompt}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Project {currentProjectName ? `(${currentProjectName})` : ''}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Load Project
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {projects.length === 0 && <DropdownMenuItem disabled>No saved projects</DropdownMenuItem>}
                    {projects.map((p) => (
                      <DropdownMenuItem key={p.id} className="flex justify-between items-center" onSelect={(e) => { e.preventDefault(); onLoadProject(p.id); }}>
                        <span>{p.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-2 opacity-50 hover:opacity-100" 
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id);}}
                          aria-label={`Delete project ${p.name}`}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={onClearCode} disabled={!hasCode && !prompt}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Current Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator className="my-2" />
        <CardTitle className="text-lg font-headline">Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-3 overflow-y-auto p-4 pt-0">
        <div className="space-y-1.5">
          <Label htmlFor="prompt-input" className="text-sm font-medium">
            Describe your web application or desired changes:
          </Label>
          <Textarea
            id="prompt-input"
            placeholder="e.g., A simple to-do list app..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none bg-background focus:ring-primary"
            disabled={isLoading}
          />
        </div>

        <Button onClick={handlePrimaryAction} disabled={isLoading || !prompt} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : (hasCode ? <Edit3 /> : <Wand2 />)}
          {hasCode ? 'Edit Code' : 'Generate Code'}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={!hasCode || isLoading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Files
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width)]">
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
        
        {isLoading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground pt-1">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI is weaving its magic...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
