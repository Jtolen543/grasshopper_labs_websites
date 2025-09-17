import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Questionnaire } from './Questionnaire';
import type { QuestionnaireData } from '../types/questions';

function FileForm() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file); // Changed from 'resume' to 'file' to match FastAPI parameter name

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
            setShowQuestionnaire(true); // Show questionnaire after successful upload
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
            <form onSubmit={handleSubmit}>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="block w-full mb-4"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload'}
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

export default FileForm;