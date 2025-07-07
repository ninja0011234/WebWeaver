
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Code2, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ResponsivePreviewControls } from './responsive-preview-controls';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  id: string;
  label: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder, disabled, id, label }) => (
  <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
    <Textarea
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-code text-sm h-full w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 whitespace-pre-wrap"
      disabled={disabled}
      rows={20} 
      wrap="off"
    />
  </ScrollArea>
);


interface PreviewWindowProps {
  html: string;
  setHtml: (html: string) => void;
  css: string;
  setCss: (css: string) => void;
  js: string;
  setJs: (js: string) => void;
  isVisible: boolean;
  isLoading: boolean;
}

export function PreviewWindow({ 
  html, setHtml, 
  css, setCss, 
  js, setJs, 
  isVisible, isLoading 
}: PreviewWindowProps) {
  const [srcDoc, setSrcDoc] = useState('');
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: '100%', height: '100%' });


  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script type="module">${js}</script>
          </body>
        </html>
      `);
    }, 250); 

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <TooltipProvider>
      <Card className={cn("h-full flex flex-col shadow-xl transition-all duration-300 ease-in-out", isVisible ? "opacity-100" : "opacity-0 pointer-events-none w-0 p-0 border-0 m-0")}>
        {isVisible && (
          <>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-headline">Live Preview</CardTitle>
              <div className="flex items-center gap-1">
                <ResponsivePreviewControls onSizeChange={setPreviewSize} />
                <Separator orientation="vertical" className="h-6" />
                <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Show and Edit Code" disabled={(!html && !css && !js) && !isLoading /* Allow opening to edit empty if not loading */}>
                      <Code2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-4 sm:p-6">
                    <DialogHeader className="pb-2">
                      <DialogTitle>Edit Code</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="html" className="flex-grow flex flex-col min-h-0">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="js">JavaScript</TabsTrigger>
                      </TabsList>
                      <TabsContent value="html" className="flex-grow mt-2 h-0">
                        <CodeEditor
                          id="html-editor-dialog"
                          label="HTML Code Editor"
                          value={html}
                          onChange={setHtml}
                          placeholder="Enter HTML code here..."
                          disabled={isLoading}
                        />
                      </TabsContent>
                      <TabsContent value="css" className="flex-grow mt-2 h-0">
                         <CodeEditor
                          id="css-editor-dialog"
                          label="CSS Code Editor"
                          value={css}
                          onChange={setCss}
                          placeholder="Enter CSS code here..."
                          disabled={isLoading}
                        />
                      </TabsContent>
                      <TabsContent value="js" className="flex-grow mt-2 h-0">
                         <CodeEditor
                          id="js-editor-dialog"
                          label="JavaScript Code Editor"
                          value={js}
                          onChange={setJs}
                          placeholder="Enter JavaScript code here..."
                          disabled={isLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
              {html || css || js ? (
                 <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-md overflow-auto p-2">
                    <iframe
                      srcDoc={srcDoc}
                      title="Live Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                      className="border border-border rounded-md bg-white shadow-lg"
                      style={{
                        width: previewSize.width,
                        height: previewSize.height,
                        transition: 'width 0.3s ease-in-out',
                      }}
                      aria-label="Live preview of generated web application"
                    />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-border rounded-md bg-muted/30">
                  <p className="text-muted-foreground text-center p-4">
                    Generate code to see a live preview here.
                    <br />
                    Use the <Code2 className="inline h-4 w-4 align-text-bottom" /> icon above to open the editor.
                    <br />
                    Use the <Eye className="inline h-4 w-4 align-text-bottom" /> icon in Controls to toggle this panel.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </TooltipProvider>
  );
}
