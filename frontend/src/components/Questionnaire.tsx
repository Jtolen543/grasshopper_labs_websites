import { useState } from 'react';
import type { QuestionnaireData, Role, Industry } from '../types/questions';

interface QuestionnaireProps {
    onSubmit: (data: QuestionnaireData) => void;
    onClose: () => void;
}

const roles: Role[] = ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'];
const industries: Industry[] = ['FinTech', 'Healthcare', 'Defense', 'Tech', 'Consulting'];

export function Questionnaire({ onSubmit, onClose }: QuestionnaireProps) {
    const [formData, setFormData] = useState<QuestionnaireData>({
        role: 'Software Engineer',
        industry: 'Tech',
        location: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="flex items-center justify-center">
            <div className="p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Additional Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Preferred Role</label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as Role})}
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Preferred Industry</label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={formData.industry}
                            onChange={e => setFormData({...formData, industry: e.target.value as Industry})}
                        >
                            {industries.map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Preferred Location</label>
                        <input 
                            type="text"
                            className="w-full p-2 border rounded"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g., New York, Remote, etc."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}