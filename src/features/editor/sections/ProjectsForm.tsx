import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { ProjectItem } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ProjectsForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();

    const handleAdd = () => {
        const newItem: ProjectItem = {
            id: uuidv4(),
            name: '',
            link: '',
            techStack: [],
            highlights: [],
        };
        setResumeData({
            ...resumeData,
            projects: [newItem, ...resumeData.projects],
        });
    };

    const handleRemove = (id: string) => {
        setResumeData({
            ...resumeData,
            projects: resumeData.projects.filter(item => item.id !== id),
        });
    };

    const updateItem = (id: string, field: keyof ProjectItem, value: any) => {
        setResumeData({
            ...resumeData,
            projects: resumeData.projects.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    return (
        <div className="space-y-4">
            {resumeData.projects.map((item) => (
                <Card key={item.id} className="relative group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => handleRemove(item.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.projectName}</Label>
                                <Input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Project Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.link} ({t.optional})</Label>
                                <Input value={item.link} onChange={(e) => updateItem(item.id, 'link', e.target.value)} placeholder="https://..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.techStack}</Label>
                            <Input
                                value={item.techStack.join(', ')}
                                onChange={(e) => updateItem(item.id, 'techStack', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="React, Node.js, MongoDB"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.highlights}</Label>
                            <Textarea
                                value={item.highlights.join('\n')}
                                onChange={(e) => updateItem(item.id, 'highlights', e.target.value.split('\n'))}
                                placeholder="• Built feature X..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> {t.addProject}
            </Button>
        </div>
    );
};
