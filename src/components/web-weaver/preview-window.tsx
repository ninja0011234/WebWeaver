
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

interface PreviewWindowProps {
  html: string;
  css: string;
  js: string;
  isVisible: boolean;
}

export function PreviewWindow({ html, css, js, isVisible }: PreviewWindowProps) {
  const [srcDoc, setSrcDoc] = useState('');
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

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
    <Card className={cn("h-full flex flex-col shadow-xl transition-all duration-300 ease-in-out", isVisible ? "opacity-100" : "opacity-0 pointer-events-none w-0 p-0 border-0 m-0")}>
      {isVisible && (
        <>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-headline">Live Preview</CardTitle>
            <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Show Code" disabled={!html && !css && !js}>
                  <Code2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-4 sm:p-6">
                <DialogHeader className="pb-2">
                  <DialogTitle>Current Code</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="html" className="flex-grow flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="flex-grow mt-2 h-0">
                    <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
                      <Textarea value={html} readOnly className="font-code text-sm h-full w-full resize-none border-0 focus-visible:ring-0 p-4 whitespace-pre-wrap" wrap="off"/>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="css" className="flex-grow mt-2 h-0">
                     <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
                      <Textarea value={css} readOnly className="font-code text-sm h-full w-full resize-none border-0 focus-visible:ring-0 p-4 whitespace-pre-wrap" wrap="off"/>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="js" className="flex-grow mt-2 h-0">
                     <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
                      <Textarea value={js} readOnly className="font-code text-sm h-full w-full resize-none border-0 focus-visible:ring-0 p-4 whitespace-pre-wrap" wrap="off"/>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            {html || css || js ? (
              <iframe
                srcDoc={srcDoc}
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                className="w-full h-full border border-border rounded-md bg-white"
                aria-label="Live preview of generated web application"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-border rounded-md bg-muted/30">
                <p className="text-muted-foreground text-center p-4">
                  Generate or edit code to see a live preview here.
                  <br />
                  Use the <Eye className="inline h-4 w-4 align-text-bottom" /> icon in Controls to toggle this panel.
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
