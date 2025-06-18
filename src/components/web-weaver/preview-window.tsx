"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PreviewWindowProps {
  html: string;
  css: string;
  js: string;
  isVisible: boolean;
}

export function PreviewWindow({ html, css, js, isVisible }: PreviewWindowProps) {
  const [srcDoc, setSrcDoc] = useState('');

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
    }, 250); // Debounce updates to avoid flickering

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <Card className={cn("h-full flex flex-col shadow-xl transition-all duration-300 ease-in-out", isVisible ? "opacity-100" : "opacity-0 pointer-events-none w-0 p-0 border-0 m-0")}>
      {isVisible && (
        <>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline">Live Preview</CardTitle>
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
                  Use the <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Eye</kbd> icon in Controls to toggle this panel.
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
