import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure uploads directory exists
const uploadDir = join(process.cwd(), 'public/uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        // Generate a unique filename to prevent overwriting
        const uniqueFilename = `image-${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        // Convert the file to an ArrayBuffer and then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Write the file to the uploads directory
        await writeFile(filePath, buffer);
        
        // Generate URL for the uploaded file
        const fileUrl = `/uploads/${uniqueFilename}`;
        
        return NextResponse.json({
            name: file.name,
            contentType: file.type,
            url: fileUrl,
            size: file.size,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
