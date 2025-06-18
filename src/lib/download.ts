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
  htmlContent: string,
  cssContent: string,
  jsContent: string,
  projectName: string = 'web-weaver-export'
) {
  const zip = new JSZip();
  zip.file('index.html', htmlContent);
  zip.file('style.css', cssContent);
  zip.file('script.js', jsContent);

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
