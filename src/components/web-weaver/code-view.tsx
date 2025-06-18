"use client";

import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeViewProps {
  html: string;
  setHtml: (html: string) => void;
  css: string;
  setCss: (css: string) => void;
  js: string;
  setJs: (js: string) => void;
  isLoading: boolean;
}

const CodeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  id: string;
}> = ({ value, onChange, placeholder, disabled, id }) => (
  <ScrollArea className="h-full w-full rounded-md border bg-muted/20">
    <Textarea
      id={id}
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


export function CodeView({ html, setHtml, css, setCss, js, setJs, isLoading }: CodeViewProps) {
  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">Code Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <Tabs defaultValue="html" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="html" aria-label="HTML Code Tab">HTML</TabsTrigger>
            <TabsTrigger value="css" aria-label="CSS Code Tab">CSS</TabsTrigger>
            <TabsTrigger value="js" aria-label="JavaScript Code Tab">JavaScript</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="flex-grow h-0">
            <CodeEditor
              id="html-editor"
              value={html}
              onChange={setHtml}
              placeholder="HTML code will appear here..."
              disabled={isLoading}
            />
          </TabsContent>
          <TabsContent value="css" className="flex-grow h-0">
            <CodeEditor
              id="css-editor"
              value={css}
              onChange={setCss}
              placeholder="CSS code will appear here..."
              disabled={isLoading}
            />
          </TabsContent>
          <TabsContent value="js" className="flex-grow h-0">
            <CodeEditor
              id="js-editor"
              value={js}
              onChange={setJs}
              placeholder="JavaScript code will appear here..."
              disabled={isLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
