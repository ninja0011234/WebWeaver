
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ControlPanel } from '@/components/web-weaver/control-panel';
import { CodeView } from '@/components/web-weaver/code-view';
import { PreviewWindow } from '@/components/web-weaver/preview-window';
import { useToast } from "@/hooks/use-toast";
import { generateCodeFromPrompt } from '@/ai/flows/generate-code-from-prompt';
import { editCodeWithPrompt } from '@/ai/flows/edit-code-with-prompt';
import { downloadFile } from '@/lib/download';

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
    setCurrentProjectId(null); // New generation means it's a new potential project
    try {
      const result = await generateCodeFromPrompt({ prompt });
      setHtmlCode(result.html);
      setCssCode(result.css);
      setJsCode(result.javascript);
      toast({ title: "Code Generated", description: "AI has woven your web!" });
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
        toast({ title: "Code Edited", description: "AI has rewoven your web!" });
      }

    } catch (error) {
      console.error("Error editing code:", error);
      toast({ title: "Error Editing Code", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleDownloadHtml = () => downloadFile('index.html', htmlCode, 'text/html');
  const handleDownloadCss = () => downloadFile('style.css', cssCode, 'text/css');
  const handleDownloadJs = () => downloadFile('script.js', jsCode, 'text/javascript');

  const handleClearCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setPrompt('');
    setCurrentProjectId(null);
    toast({ title: "Code Cleared", description: "All code has been cleared." });
  };
  
  const togglePreview = () => setIsPreviewVisible(prev => !prev);

  const handleSaveProject = () => {
    const projectName = window.prompt("Enter a name for your project:");
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
        // Update existing project if currentProjectId matches an existing one
         updatedProjects = projects.map(p => p.id === currentProjectId ? newProject : p);
      } else {
        // Add as new project or update if ID collision (though unlikely with Date.now())
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
    } else if (projectName !== null) { // User clicked OK but entered empty name
        toast({ title: "Invalid Name", description: "Project name cannot be empty.", variant: "destructive" });
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
      toast({ title: "Project Loaded", description: `"${projectToLoad.name}" has been loaded.` });
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProjects));
        toast({ title: "Project Deleted" });
        if (currentProjectId === projectId) {
          setCurrentProjectId(null); // If current project deleted, clear it
        }
      } catch (error) {
        console.error("Error deleting project from localStorage:", error);
        toast({ title: "Error Deleting Project", variant: "destructive" });
      }
    }
  };


  return (
    <div className="h-screen w-screen flex flex-col p-2 sm:p-4 bg-muted/30">
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border shadow-sm bg-background">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="p-1 sm:p-2">
          <div className="h-full flex flex-col gap-2">
            <div className="h-[40%] min-h-[200px]">
              <ControlPanel
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerateCode}
                onEdit={handleEditCode}
                onDownloadHtml={handleDownloadHtml}
                onDownloadCss={handleDownloadCss}
                onDownloadJs={handleDownloadJs}
                onClearCode={handleClearCode}
                isLoading={isLoading}
                hasCode={hasCode}
                isPreviewVisible={isPreviewVisible}
                togglePreview={togglePreview}
                projects={projects}
                onSaveProject={handleSaveProject}
                onLoadProject={handleLoadProject}
                onDeleteProject={handleDeleteProject}
                currentProjectId={currentProjectId}
              />
            </div>
            <div className="flex-grow h-[60%] min-h-[250px]">
              <CodeView
                html={htmlCode}
                setHtml={setHtmlCode}
                css={cssCode}
                setCss={setCssCode}
                js={jsCode}
                setJs={setJsCode}
                isLoading={isLoading}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className={!isPreviewVisible ? "hidden" : ""} />
        {isPreviewVisible && (
          <ResizablePanel defaultSize={65} minSize={30} className="p-1 sm:p-2">
            <PreviewWindow html={htmlCode} css={cssCode} js={jsCode} isVisible={isPreviewVisible} />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
