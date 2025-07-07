
"use client";

import * as React from 'react';
import { Wand2, Edit3, Download, Loader2, Trash2, Eye, EyeOff, Save, FolderOpen, FolderArchive, Milestone, FileEdit, Copy, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DropdownMenuLabel,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { WebWeaverLogo } from '@/components/icons/logo';
import { Separator } from '@/components/ui/separator';
import type { Project } from '@/hooks/useProjects';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';


interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onEdit: () => void;
  onDownloadProjectZip: () => void;
  onClearCode: () => void;
  isLoading: boolean;
  hasCode: boolean;
  isPreviewVisible: boolean;
  togglePreview: () => void;
  projects: Project[];
  onSaveOrUpdateProject: () => void;
  onSaveProjectAsCopy: () => void;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  currentProjectId: string | null;
  currentProjectName?: string | null;
  canCreateCheckpoint: boolean;
  onSaveAsCheckpoint: () => void;
  onHtmlFileUpload: (content: string) => void;
  onCssFileUpload: (content: string) => void;
  onJsFileUpload: (content: string) => void;
}

export function ControlPanel({
  prompt,
  setPrompt,
  onGenerate,
  onEdit,
  onDownloadProjectZip,
  onClearCode,
  isLoading,
  hasCode,
  isPreviewVisible,
  togglePreview,
  projects,
  onSaveOrUpdateProject,
  onSaveProjectAsCopy,
  onLoadProject,
  onDeleteProject,
  onRenameProject,
  currentProjectId,
  currentProjectName,
  canCreateCheckpoint,
  onSaveAsCheckpoint,
  onHtmlFileUpload,
  onCssFileUpload,
  onJsFileUpload,
}: ControlPanelProps) {
  const { toast } = useToast();
  const [projectToRename, setProjectToRename] = React.useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [renameInputValue, setRenameInputValue] = React.useState("");

  const saveButtonText = currentProjectId && currentProjectName 
    ? `Save '${currentProjectName}'` 
    : "Save Project...";

  const canPerformSaveActions = (hasCode || prompt.trim() !== '');

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'HTML' | 'CSS' | 'JavaScript',
    callback: (content: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        callback(text);
        toast({ title: `${fileType} File Uploaded`, description: `${file.name} loaded into ${fileType} editor.` });
      };
      reader.onerror = () => {
        toast({ title: `Error Reading ${fileType} File`, description: `Could not read the selected ${fileType} file.`, variant: "destructive" });
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input to allow re-uploading the same file
    }
  };

  const handleRenameClick = (project: Project) => {
    setProjectToRename(project);
    setRenameInputValue(project.name);
  };

  const handleRenameSubmit = () => {
    if (projectToRename && renameInputValue.trim()) {
      onRenameProject(projectToRename.id, renameInputValue.trim());
      setProjectToRename(null);
    } else {
      toast({ title: "Invalid Name", description: "Name cannot be empty.", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <>
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
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>File Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => document.getElementById('html-upload-input')?.click()} disabled={isLoading}>
                      <FileUp className="mr-2 h-4 w-4" /> Upload HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => document.getElementById('css-upload-input')?.click()} disabled={isLoading}>
                      <FileUp className="mr-2 h-4 w-4" /> Upload CSS
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => document.getElementById('js-upload-input')?.click()} disabled={isLoading}>
                      <FileUp className="mr-2 h-4 w-4" /> Upload JavaScript
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Project Management</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={onSaveOrUpdateProject} disabled={!canPerformSaveActions || isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {saveButtonText}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onSaveProjectAsCopy} disabled={!canPerformSaveActions || isLoading}>
                      <Copy className="mr-2 h-4 w-4" />
                      Save As New Project...
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Manage Items
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="max-h-72 overflow-y-auto w-60">
                          <DropdownMenuLabel>Load, Rename, or Delete</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {projects.length === 0 && <DropdownMenuItem disabled>No saved items</DropdownMenuItem>}
                          {projects.sort((a,b) => b.id.localeCompare(a.id)).map((p) => (
                            <DropdownMenuSub key={p.id}>
                              <DropdownMenuSubTrigger>{p.name}</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onSelect={() => onLoadProject(p.id)} disabled={isLoading}>
                                    <FolderOpen className="mr-2 h-4 w-4" /> Load
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleRenameClick(p)} disabled={isLoading}>
                                    <FileEdit className="mr-2 h-4 w-4" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onSelect={() => setProjectToDelete(p)} disabled={isLoading} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDownloadProjectZip} disabled={!hasCode || isLoading}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Project as ZIP
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={onClearCode} disabled={(!hasCode && !prompt) || isLoading} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear Current Code
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-headline">Controls</CardTitle>
            {currentProjectName && (
              <CardDescription className="text-xs text-muted-foreground truncate max-w-[150px]">
                Editing: {currentProjectName}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-3 overflow-y-auto p-4 pt-0">
          {/* Hidden file inputs */}
          <input
            type="file"
            id="html-upload-input"
            accept=".html,.htm"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'HTML', onHtmlFileUpload)}
          />
          <input
            type="file"
            id="css-upload-input"
            accept=".css"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'CSS', onCssFileUpload)}
          />
          <input
            type="file"
            id="js-upload-input"
            accept=".js,.mjs"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'JavaScript', onJsFileUpload)}
          />

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

          <Button onClick={hasCode ? onEdit : onGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : (hasCode ? <Edit3 /> : <Wand2 />)}
            {hasCode ? 'Edit Code' : 'Generate Code'}
          </Button>

          {canCreateCheckpoint && !isLoading && (
            <Button onClick={onSaveAsCheckpoint} variant="outline" className="w-full">
              <Milestone className="mr-2 h-4 w-4" /> Save Checkpoint
            </Button>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center text-sm text-muted-foreground pt-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI is weaving its magic...
            </div>
          )}
        </CardContent>
      </Card>

      {/* RENAME DIALOG */}
      <Dialog open={!!projectToRename} onOpenChange={(isOpen) => !isOpen && setProjectToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-input" className="sr-only">Name</Label>
            <Input 
              id="rename-input"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              placeholder="Enter a new name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToRename(null)}>Cancel</Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* DELETE DIALOG */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item named "{projectToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
