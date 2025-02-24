import formidable from 'formidable';
import mammoth from 'mammoth';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({});

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const result = await mammoth.extractRawText({
        path: file.filepath
      });
      
      // Clean up the temporary file
      fs.unlinkSync(file.filepath);
      
      res.status(200).json({ text: result.value });
    } catch (error) {
      console.error('Error extracting text from DOC/DOCX:', error);
      res.status(500).json({ error: 'Failed to extract text from DOC/DOCX' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 