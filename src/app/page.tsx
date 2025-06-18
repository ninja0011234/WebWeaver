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

export default function WebWeaverPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCode, setHasCode] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(true);

  const { toast } = useToast();

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
      const { html, css, js } = parseModifiedCode(result.modifiedCode);
      
      if (!html && !css && !js && result.modifiedCode.trim() !== '') {
         // If parsing fails but there is content, it might be a general response or malformed.
         // For simplicity, we can try to put it all in HTML or show an error.
         // Here, we'll assume it might be an unformatted block, put it into HTML, and clear others.
         // Or better, show an error that the format was not as expected.
         toast({ title: "Parsing Error", description: "AI response format was not as expected. Please check the raw response if needed or try rephrasing your edit.", variant: "destructive" });
         // Optionally, set htmlCode to result.modifiedCode to let user see raw output.
         // setHtmlCode(result.modifiedCode); setCssCode(''); setJsCode('');
      } else {
        setHtmlCode(html);
        setCssCode(css);
        setJsCode(js);
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
    toast({ title: "Code Cleared", description: "All code has been cleared." });
  };
  
  const togglePreview = () => setIsPreviewVisible(prev => !prev);

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
