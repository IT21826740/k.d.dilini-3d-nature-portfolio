import JSZip from 'jszip';

export async function generateProjectZip(onProgress?: (percent: number) => void): Promise<Blob> {
  const zip = new JSZip();
  zip.file('README.md', '# K.D. Dilini — 3D Walkable Nature Portfolio\n');
  if (onProgress) onProgress(100);
  return await zip.generateAsync({ type: 'blob' });
}