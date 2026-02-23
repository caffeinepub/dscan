// Simple PDF generator without external dependencies
// Creates a basic PDF structure with embedded JPEG images

export async function generatePDF(pages: File[]): Promise<Blob> {
  // Convert all pages to base64 JPEG data
  const imageDataList: string[] = [];
  const imageDimensions: { width: number; height: number }[] = [];

  for (const page of pages) {
    const dataUrl = await fileToDataURL(page);
    const img = await loadImage(dataUrl);
    
    // Convert to JPEG if needed and get base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // A4 aspect ratio: 210mm x 297mm (1:1.414)
    const maxWidth = 1654; // A4 width at 200 DPI
    const maxHeight = 2339; // A4 height at 200 DPI
    
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const jpegData = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = jpegData.split(',')[1];
    
    imageDataList.push(base64Data);
    imageDimensions.push({ width: canvas.width, height: canvas.height });
  }

  // Generate PDF structure
  const pdfContent = generatePDFStructure(imageDataList, imageDimensions);
  
  // Convert to Blob
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return blob;
}

function generatePDFStructure(images: string[], dimensions: { width: number; height: number }[]): string {
  const objects: string[] = [];
  let objectIndex = 1;

  // PDF Header
  let pdf = '%PDF-1.4\n';
  pdf += '%âãÏÓ\n'; // Binary marker

  // Catalog (object 1)
  objects.push(`${objectIndex} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objectIndex++;

  // Pages object (object 2)
  const pageRefs = images.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  objects.push(`${objectIndex} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${images.length} >>\nendobj\n`);
  objectIndex++;

  // For each image, create Page, XObject, and Image stream
  images.forEach((imageData, index) => {
    const { width, height } = dimensions[index];
    const pageObj = objectIndex++;
    const xObjectObj = objectIndex++;
    const imageObj = objectIndex++;

    // Page object
    objects.push(
      `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im${index} ${xObjectObj} 0 R >> >> /MediaBox [0 0 ${width} ${height}] /Contents ${imageObj} 0 R >>\nendobj\n`
    );

    // XObject (image reference)
    const imageBytes = atob(imageData);
    objects.push(
      `${xObjectObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n${imageBytes}\nendstream\nendobj\n`
    );

    // Content stream (draws the image)
    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im${index} Do\nQ\n`;
    objects.push(
      `${imageObj} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`
    );
  });

  // Build xref table
  const xrefStart = pdf.length + objects.join('').length;
  let xref = 'xref\n';
  xref += `0 ${objectIndex}\n`;
  xref += '0000000000 65535 f \n';

  let offset = pdf.length;
  objects.forEach((obj) => {
    xref += String(offset).padStart(10, '0') + ' 00000 n \n';
    offset += obj.length;
  });

  // Trailer
  const trailer = `trailer\n<< /Size ${objectIndex} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return pdf + objects.join('') + xref + trailer;
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
