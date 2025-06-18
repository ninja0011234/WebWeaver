
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
import { useProjects, type Project } from '@/hooks/useProjects';

export default function WebWeaverPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
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
    saveProject,
    saveCheckpoint,
    deleteProject,
    renameProject,
    setCanCreateCheckpoint,
    setLastSuccessfulPrompt,
    clearCurrentProjectSelection,
    setCurrentProjectId,
  } = useProjects();

  useEffect(() => {
    setHasCode(htmlCode.trim() !== '' || cssCode.trim() !== '' || jsCode.trim() !== '');
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    if (canCreateCheckpoint) {
      // If prompt changes after a checkpoint was made available, invalidate checkpoint creation
      // unless a new successful AI op happens.
      const currentCodeMatchesLastCheckpointBasis = 
        currentProject?.prompt === lastSuccessfulPrompt || // Loaded project matches
        prompt === lastSuccessfulPrompt; // Current input prompt matches what generated the code

      if (!currentCodeMatchesLastCheckpointBasis) {
         // setCanCreateCheckpoint(false); // This was causing premature disabling.
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, lastSuccessfulPrompt, currentProject]);


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

  const handleSetCodeStates = (html: string, css: string, js: string, newPrompt: string) => {
    setHtmlCode(html);
    setCssCode(css);
    setJsCode(js);
    setPrompt(newPrompt);
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
    const editPromptContent = `${prompt}

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
      const result = await editCodeWithPrompt({ existingCode, prompt: editPromptContent });
      const { html: newHtml, css: newCss, js: newJs } = parseModifiedCode(result.modifiedCode);
      
      if (!newHtml && !newCss && !newJs && result.modifiedCode.trim() !== '') {
         toast({ title: "Parsing Error", description: "AI response format was not as expected. Please try rephrasing your edit.", variant: "destructive" });
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
    const projectToDownload = projects.find(p => p.id === currentProjectId);
    const projectName = projectToDownload?.name || 'web-weaver-export';
    downloadProjectAsZip(htmlCode, cssCode, jsCode, projectName);
  };

  const handleClearCode = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setPrompt('');
    clearCurrentProjectSelection();
    setCanCreateCheckpoint(false);
    setLastSuccessfulPrompt('');
    toast({ title: "Code Cleared", description: "All code has been cleared." });
  };
  
  const togglePreview = () => setIsPreviewVisible(prev => !prev);

  const onSaveProjectHandler = () => {
    saveProject({ html: htmlCode, css: cssCode, js: jsCode, prompt: prompt });
  };
  
  const onSaveCheckpointHandler = () => {
    saveCheckpoint({ html: htmlCode, css: cssCode, js: jsCode }, lastSuccessfulPrompt);
  };

  const onDeleteProjectHandler = (projectId: string) => {
    deleteProject(projectId, handleClearCode);
  };


  return (
    <div className="h-screen w-screen flex flex-col p-2 sm:p-4 bg-muted/30">
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border shadow-sm bg-background">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45} className="p-1 sm:p-2">
          <ControlPanel
            prompt={prompt}
            setPrompt={(newPrompt) => {
              setPrompt(newPrompt);
              // If prompt is manually changed after AI op, can't make checkpoint on old AI op
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
            onSaveProject={onSaveProjectHandler}
            onLoadProject={(id) => loadProject(id, handleSetCodeStates)}
            onDeleteProject={onDeleteProjectHandler}
            onRenameProject={renameProject}
            currentProjectId={currentProjectId}
            currentProjectName={currentProject?.name}
            canCreateCheckpoint={canCreateCheckpoint}
            onSaveAsCheckpoint={onSaveCheckpointHandler}
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
