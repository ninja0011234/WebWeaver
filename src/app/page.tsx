
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ControlPanel } from '@/components/web-weaver/control-panel';
import { PreviewWindow } from '@/components/web-weaver/preview-window';
import { useToast } from "@/hooks/use-toast";
import { generateCodeFromPrompt } from '@/ai/flows/generate-code-from-prompt';
import { editCodeWithPrompt } from '@/ai/flows/edit-code-with-prompt';
import { downloadProjectAsZip } from '@/lib/download';
import { useProjects } from '@/hooks/useProjects';

export default function WebWeaverPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [reactCode, setReactCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCode, setHasCode] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);

  const { toast } = useToast();
  const {
    projects,
    currentProjectId,
    currentProject,
    canCreateCheckpoint,
    lastSuccessfulPrompt,
    loadProject,
    saveOrUpdateProject,
    saveProjectAsCopy,
    saveCheckpoint,
    deleteProject,
    renameProject,
    setCanCreateCheckpoint,
    setLastSuccessfulPrompt,
    clearCurrentProjectSelection,
    setCurrentProjectId,
  } = useProjects();

  useEffect(() => {
    setHasCode(reactCode.trim() !== '' || cssCode.trim() !== '');
  }, [reactCode, cssCode]);

  useEffect(() => {
    if (canCreateCheckpoint) {
      const currentCodeMatchesLastCheckpointBasis = 
        currentProject?.prompt === lastSuccessfulPrompt || 
        prompt === lastSuccessfulPrompt; 

      if (!currentCodeMatchesLastCheckpointBasis) {
         // setCanCreateCheckpoint(false); // This was causing premature disabling.
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, lastSuccessfulPrompt, currentProject]);

  const handleSetCodeStates = (react: string, css: string, prompt: string) => {
    setReactCode(react);
    setCssCode(css);
    setPrompt(prompt);
  };

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a prompt to generate code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    clearCurrentProjectSelection(); 
    setCanCreateCheckpoint(false);
    try {
      const result = await generateCodeFromPrompt({ prompt });
      setReactCode(result.reactComponent);
      setCssCode(result.css);
      setLastSuccessfulPrompt(prompt);
      setCanCreateCheckpoint(true);
      toast({ title: "Code Generated", description: "AI has woven your web! You can now save this as a checkpoint." });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({ title: "Error Generating Code", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleEditCode = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a prompt to edit the code.", variant: "destructive" });
      return;
    }
    if (!hasCode) {
      toast({ title: "No Code to Edit", description: "Generate some code first before editing.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setCanCreateCheckpoint(false);
    
    try {
      const result = await editCodeWithPrompt({ 
        existingComponent: reactCode, 
        existingCss: cssCode, 
        prompt 
      });
      
      setReactCode(result.modifiedComponent);
      setCssCode(result.modifiedCss);
      setLastSuccessfulPrompt(prompt);
      setCanCreateCheckpoint(true);
      toast({ title: "Code Edited", description: "AI has rewoven your web! You can now save this as a checkpoint." });

    } catch (error) {
      console.error("Error editing code:", error);
      toast({ title: "Error Editing Code", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleDownloadProjectZip = () => {
    const projectToDownload = projects.find(p => p.id === currentProjectId);
    const projectName = projectToDownload?.name || 'web-weaver-export';
    downloadProjectAsZip(reactCode, cssCode, projectName);
  };

  const handleClearCode = () => {
    setReactCode('');
    setCssCode('');
    setPrompt('');
    clearCurrentProjectSelection();
    setCanCreateCheckpoint(false);
    setLastSuccessfulPrompt('');
    toast({ title: "Code Cleared", description: "All code has been cleared." });
  };
  
  const togglePreview = () => setIsPreviewVisible(prev => !prev);

  const onSaveOrUpdateProjectHandler = () => {
    saveOrUpdateProject({ react: reactCode, css: cssCode, prompt: prompt });
  };

  const onSaveProjectAsCopyHandler = () => {
    saveProjectAsCopy({ react: reactCode, css: cssCode, prompt: prompt });
  };
  
  const onSaveCheckpointHandler = () => {
    saveCheckpoint({ react: reactCode, css: cssCode }, lastSuccessfulPrompt);
  };

  const onDeleteProjectHandler = (projectId: string) => {
    deleteProject(projectId, handleClearCode);
  };

  const onRenameProjectHandler = (projectId: string, newName: string) => {
    renameProject(projectId, newName);
  };

  const handleFileUpload = (content: string, type: 'react' | 'css') => {
    if (type === 'react') setReactCode(content);
    if (type === 'css') setCssCode(content);

    setPrompt(''); 
    clearCurrentProjectSelection();
    setCanCreateCheckpoint(false);
    setLastSuccessfulPrompt('');
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 sm:p-4 bg-muted/30">
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border shadow-sm bg-background">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45} className="p-1 sm:p-2">
          <ControlPanel
            prompt={prompt}
            setPrompt={(newPrompt) => {
              setPrompt(newPrompt);
              if (newPrompt !== lastSuccessfulPrompt) {
                setCanCreateCheckpoint(false);
              }
            }}
            onGenerate={handleGenerateCode}
            onEdit={handleEditCode}
            onDownloadProjectZip={handleDownloadProjectZip}
            onClearCode={handleClearCode}
            isLoading={isLoading}
            hasCode={hasCode}
            isPreviewVisible={isPreviewVisible}
            togglePreview={togglePreview}
            projects={projects}
            onSaveOrUpdateProject={onSaveOrUpdateProjectHandler}
            onSaveProjectAsCopy={onSaveProjectAsCopyHandler}
            onLoadProject={(id) => loadProject(id, handleSetCodeStates)}
            onDeleteProject={onDeleteProjectHandler}
            onRenameProject={onRenameProjectHandler}
            currentProjectId={currentProjectId}
            currentProjectName={currentProject?.name}
            canCreateCheckpoint={canCreateCheckpoint}
            onSaveAsCheckpoint={onSaveCheckpointHandler}
            onReactFileUpload={(content) => handleFileUpload(content, 'react')}
            onCssFileUpload={(content) => handleFileUpload(content, 'css')}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className={!isPreviewVisible ? "hidden" : ""} />
        {isPreviewVisible && (
          <ResizablePanel defaultSize={70} minSize={30} className="p-1 sm:p-2">
            <PreviewWindow
              reactCode={reactCode}
              setReactCode={setReactCode}
              cssCode={cssCode}
              setCssCode={setCssCode}
              isLoading={isLoading}
              isVisible={isPreviewVisible}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
