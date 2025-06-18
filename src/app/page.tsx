
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

const LOCAL_STORAGE_KEY = 'webWeaverProjects_v1';

interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  prompt: string;
}

export default function WebWeaverPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCode, setHasCode] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [canCreateCheckpoint, setCanCreateCheckpoint] = useState<boolean>(false);
  const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string>('');


  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Error loading projects from localStorage:", error);
      toast({ title: "Error loading projects", description: "Could not load saved projects from your browser.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    setHasCode(htmlCode.trim() !== '' || cssCode.trim() !== '' || jsCode.trim() !== '');
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (canCreateCheckpoint) {
      setCanCreateCheckpoint(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);


  const parseModifiedCode = (modifiedCode: string): { html: string; css: string; js: string } => {
    const htmlMatch = modifiedCode.match(/<!-- HTML_CODE_START -->([\s\S]*?)<!-- HTML_CODE_END -->/);
    const cssMatch = modifiedCode.match(/\/\* CSS_CODE_START \*\/([\s\S]*?)\/\* CSS_CODE_END \*\//);
    const jsMatch = modifiedCode.match(/\/\/ JAVASCRIPT_CODE_START([\s\S]*?)\/\/ JAVASCRIPT_CODE_END/);

    return {
      html: htmlMatch ? htmlMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
      js: jsMatch ? jsMatch[1].trim() : '',
    };
  };

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a prompt to generate code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setCurrentProjectId(null); 
    setCanCreateCheckpoint(false);
    try {
      const result = await generateCodeFromPrompt({ prompt });
      setHtmlCode(result.html);
      setCssCode(result.css);
      setJsCode(result.javascript);
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
    const existingCode = `
<!-- HTML_CODE_START -->
${htmlCode}
<!-- HTML_CODE_END -->

/* CSS_CODE_START */
${cssCode}
/* CSS_CODE_END */

// JAVASCRIPT_CODE_START
${jsCode}
// JAVASCRIPT_CODE_END
`;
    const editPrompt = `${prompt}

Your response MUST be structured with the following delimiters for each language block:
<!-- HTML_CODE_START -->
... html code ...
<!-- HTML_CODE_END -->

/* CSS_CODE_START */
... css code ...
/* CSS_CODE_END */

// JAVASCRIPT_CODE_START
... javascript code ...
// JAVASCRIPT_CODE_END

If a section is not present or not modified, include the delimiters with the original content for that section.
`;

    try {
      const result = await editCodeWithPrompt({ existingCode, prompt: editPrompt });
      const { html: newHtml, css: newCss, js: newJs } = parseModifiedCode(result.modifiedCode);
      
      if (!newHtml && !newCss && !newJs && result.modifiedCode.trim() !== '') {
         toast({ title: "Parsing Error", description: "AI response format was not as expected. Please check the raw response if needed or try rephrasing your edit.", variant: "destructive" });
      } else {
        setHtmlCode(newHtml);
        setCssCode(newCss);
        setJsCode(newJs);
        setLastSuccessfulPrompt(prompt);
        setCanCreateCheckpoint(true);
        toast({ title: "Code Edited", description: "AI has rewoven your web! You can now save this as a checkpoint." });
      }

    } catch (error) {
      console.error("Error editing code:", error);
      toast({ title: "Error Editing Code", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleDownloadProjectZip = () => {
    const currentProject = projects.find(p => p.id === currentProjectId);
    const projectName = currentProject?.name || 'web-weaver-export';
    downloadProjectAsZip(htmlCode, cssCode, jsCode, projectName);
  };

  const handleClearCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setPrompt('');
    setCurrentProjectId(null);
    setCanCreateCheckpoint(false);
    setLastSuccessfulPrompt('');
    toast({ title: "Code Cleared", description: "All code has been cleared." });
  };
  
  const togglePreview = () => setIsPreviewVisible(prev => !prev);

  const handleSaveProject = () => {
    const currentProjectObject = currentProjectId ? projects.find(p => p.id === currentProjectId) : null;
    const defaultName = currentProjectObject ? currentProjectObject.name : "";
    const projectName = window.prompt("Enter a name for your project:", defaultName);

    if (projectName && projectName.trim() !== "") {
      const newProject: Project = {
        id: currentProjectId || Date.now().toString(),
        name: projectName.trim(),
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        prompt: prompt, 
      };

      let updatedProjects;
      if (currentProjectId && projects.find(p => p.id === currentProjectId)) {
         updatedProjects = projects.map(p => p.id === currentProjectId ? newProject : p);
      } else {
        const existingProjectIndex = projects.findIndex(p => p.id === newProject.id);
        if (existingProjectIndex > -1) {
          updatedProjects = [...projects];
          updatedProjects[existingProjectIndex] = newProject;
        } else {
          updatedProjects = [...projects, newProject];
        }
      }
      
      setProjects(updatedProjects);
      setCurrentProjectId(newProject.id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
        toast({ title: "Project Saved", description: `"${newProject.name}" has been saved.` });
      } catch (error) {
        console.error("Error saving project to localStorage:", error);
        toast({ title: "Error Saving Project", description: "Could not save the project to your browser.", variant: "destructive" });
      }
      setCanCreateCheckpoint(false); 
    } else if (projectName !== null) { 
        toast({ title: "Invalid Name", description: "Project name cannot be empty.", variant: "destructive" });
    }
  };

  const handleSaveAsCheckpoint = () => {
    const currentProjectNameBase = currentProjectId ? projects.find(p => p.id === currentProjectId)?.name : 'Untitled Project';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const defaultCheckpointName = `${currentProjectNameBase} - Checkpoint ${timestamp}`;
    
    const checkpointName = window.prompt("Enter a name for this checkpoint:", defaultCheckpointName);

    if (checkpointName && checkpointName.trim() !== "") {
      const newCheckpoint: Project = {
        id: Date.now().toString(), 
        name: checkpointName.trim(),
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        prompt: lastSuccessfulPrompt, 
      };

      const updatedProjects = [...projects, newCheckpoint];
      setProjects(updatedProjects);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
        toast({ title: "Checkpoint Saved", description: `"${newCheckpoint.name}" has been saved.` });
      } catch (error) {
        console.error("Error saving checkpoint to localStorage:", error);
        toast({ title: "Error Saving Checkpoint", description: "Could not save the checkpoint.", variant: "destructive" });
      }
      setCanCreateCheckpoint(false); 
    } else if (checkpointName !== null) {
      toast({ title: "Invalid Name", description: "Checkpoint name cannot be empty.", variant: "destructive" });
    }
  };

  const handleLoadProject = (projectId: string) => {
    const projectToLoad = projects.find(p => p.id === projectId);
    if (projectToLoad) {
      setHtmlCode(projectToLoad.html);
      setCssCode(projectToLoad.css);
      setJsCode(projectToLoad.js);
      setPrompt(projectToLoad.prompt);
      setCurrentProjectId(projectToLoad.id);
      setCanCreateCheckpoint(false); 
      setLastSuccessfulPrompt(projectToLoad.prompt); 
      toast({ title: "Project Loaded", description: `"${projectToLoad.name}" has been loaded.` });
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${projectToDelete.name}"? This action cannot be undone.`)) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
        toast({ title: "Project Deleted", description: `"${projectToDelete.name}" has been deleted.` });
        if (currentProjectId === projectId) {
          handleClearCode(); 
        }
      } catch (error) {
        console.error("Error deleting project from localStorage:", error);
        toast({ title: "Error Deleting Project", variant: "destructive" });
      }
    }
  };

  const handleRenameProject = (projectId: string) => {
    const projectToRename = projects.find(p => p.id === projectId);
    if (!projectToRename) return;

    const newName = window.prompt("Enter the new name for this item:", projectToRename.name);
    if (newName && newName.trim() !== "") {
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, name: newName.trim() } : p
      );
      setProjects(updatedProjects);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
        toast({ title: "Item Renamed", description: `"${projectToRename.name}" renamed to "${newName.trim()}".` });
      } catch (error) {
        console.error("Error renaming project in localStorage:", error);
        toast({ title: "Error Renaming Item", variant: "destructive" });
      }
    } else if (newName !== null) {
      toast({ title: "Invalid Name", description: "Name cannot be empty.", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 sm:p-4 bg-muted/30">
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border shadow-sm bg-background">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45} className="p-1 sm:p-2">
          <ControlPanel
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerateCode}
            onEdit={handleEditCode}
            onDownloadProjectZip={handleDownloadProjectZip}
            onClearCode={handleClearCode}
            isLoading={isLoading}
            hasCode={hasCode}
            isPreviewVisible={isPreviewVisible}
            togglePreview={togglePreview}
            projects={projects}
            onSaveProject={handleSaveProject}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
            currentProjectId={currentProjectId}
            canCreateCheckpoint={canCreateCheckpoint}
            onSaveAsCheckpoint={handleSaveAsCheckpoint}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className={!isPreviewVisible ? "hidden" : ""} />
        {isPreviewVisible && (
          <ResizablePanel defaultSize={70} minSize={30} className="p-1 sm:p-2">
            <PreviewWindow
              html={htmlCode}
              setHtml={setHtmlCode}
              css={cssCode}
              setCss={setCssCode}
              js={jsCode}
              setJs={setJsCode}
              isLoading={isLoading}
              isVisible={isPreviewVisible}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
