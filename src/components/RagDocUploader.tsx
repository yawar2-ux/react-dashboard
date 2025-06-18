import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { uploadDocuments, processUrl, queryRagSystem } from '../services/api';

export interface RagDocUploaderProps {
  onQueryResult?: (result: any) => void;
}

export default function RagDocUploader({ onQueryResult }: RagDocUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
      'application/csv': ['.csv'],
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      await uploadDocuments(files);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async () => {
    try {
      setIsLoading(true);
      const response = await queryRagSystem(query);
      setResult(response.data);
      if (onQueryResult) {
        onQueryResult(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        RAG Document Uploader
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          p: 3,
          textAlign: 'center',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <Typography>
          Drag and drop files here or click to select
        </Typography>
      </Box>

      {files.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">
            Selected files:
          </Typography>
          <ul>
            {files.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={isLoading}
          >
            Upload Files
          </Button>
        </Box>
      )}

      <TextField
        fullWidth
        label="Enter your query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleQuery}
        disabled={isLoading}
      >
        Query Documents
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Query Result:</Typography>
          <Typography>{result}</Typography>
        </Box>
      )}
    </Box>
  );
}
