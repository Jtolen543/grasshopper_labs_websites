import { useState, useCallback } from 'react'
import {useDropzone} from 'react-dropzone'
import type { FormEvent } from 'react'
import { Questionnaire } from './Questionnaire'
import type { QuestionnaireData } from '../types/questions'

export function FileForm() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        multiple: false
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resume`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            setFile(null);
            (e.target as HTMLFormElement).reset();
            setShowQuestionnaire(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload resume');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionnaireSubmit = async (data: QuestionnaireData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resume/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            setShowQuestionnaire(false);
            alert('Thank you! Your preferences have been saved.');
        } catch (err) {
            setError('Failed to save preferences');
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Upload Resume</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                    {...getRootProps()} 
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                        ${file ? 'border-green-500 bg-green-50' : ''}
                    `}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-blue-600">Drop the resume here...</p>
                    ) : (
                        <div>
                            <p className="text-gray-600 mb-2">
                                Drag & drop your resume here, or click to select
                            </p>
                            <p className="text-sm text-gray-400">
                                Supports PDF, DOC, DOCX, TXT files
                            </p>
                        </div>
                    )}
                </div>

                {file && (
                    <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm text-gray-700">
                            Selected: <span className="font-medium">{file.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className={`
                        w-full py-2 px-4 rounded font-medium transition-colors
                        ${!file || loading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    {loading ? 'Uploading...' : 'Upload Resume'}
                </button>
            </form>

            {showQuestionnaire && (
                <Questionnaire 
                    onSubmit={handleQuestionnaireSubmit}
                    onClose={() => setShowQuestionnaire(false)}
                />
            )}
        </div>
    );
}