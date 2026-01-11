import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { SkillGroup } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EditableLabel } from '../../../components/ui/editable-label';

export const SkillsForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();
    const fieldLabels = resumeData.settings.fieldLabels || {};

    const updateFieldLabel = (field: string, value: string) => {
        setResumeData({
            ...resumeData,
            settings: {
                ...resumeData.settings,
                fieldLabels: {
                    ...fieldLabels,
                    [field]: value
                }
            }
        });
    };

    const handleAdd = () => {
        const newItem: SkillGroup = {
            id: uuidv4(),
            name: 'New Group',
            items: [],
        };
        setResumeData({
            ...resumeData,
            skills: [...resumeData.skills, newItem],
        });
    };

    const handleRemove = (id: string) => {
        setResumeData({
            ...resumeData,
            skills: resumeData.skills.filter(item => item.id !== id),
        });
    };

    const updateItem = (id: string, field: keyof SkillGroup, value: any) => {
        setResumeData({
            ...resumeData,
            skills: resumeData.skills.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    return (
        <div className="space-y-4">
            {resumeData.skills.map((item) => (
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
                        <div className="space-y-2">
                            <EditableLabel
                                htmlFor={`category-${item.id}`}
                                value={fieldLabels.skillCategory || ''}
                                defaultValue={t.categoryName}
                                onChange={(v) => updateFieldLabel('skillCategory', v)}
                            />
                            <Input id={`category-${item.id}`} value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Frontend, Backend, etc." />
                        </div>
                        <div className="space-y-2">
                            <EditableLabel
                                htmlFor={`skills-${item.id}`}
                                value={fieldLabels.skillItems || ''}
                                defaultValue={t.skillsCommaSeparated}
                                onChange={(v) => updateFieldLabel('skillItems', v)}
                            />
                            <Textarea
                                id={`skills-${item.id}`}
                                value={item.items.join(', ')}
                                onChange={(e) => updateItem(item.id, 'items', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="React, TypeScript, CSS..."
                                className="min-h-[60px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> {t.addSkillGroup}
            </Button>
        </div>
    );
};
