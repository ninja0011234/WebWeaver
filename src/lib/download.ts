import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function downloadFile(filename: string, content: string, mimeType: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}

export async function downloadProjectAsZip(
  reactContent: string,
  cssContent: string,
  projectName: string = 'web-weaver-export'
) {
  const zip = new JSZip();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="App.js"></script>
</body>
</html>`;

  zip.file('index.html', htmlContent);
  zip.file('style.css', cssContent);
  zip.file('App.js', reactContent);

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const safeProjectName = projectName.replace(/[^\w\s.-]/gi, '').replace(/\s+/g, '_') || 'web-weaver-export';
    saveAs(zipBlob, `${safeProjectName}.zip`);
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    // Potentially show a toast to the user
    alert("Error creating ZIP file. Please check the console for details.");
  }
}
