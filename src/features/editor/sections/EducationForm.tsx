import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { EducationItem } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EditableLabel } from '../../../components/ui/editable-label';

export const EducationForm: React.FC = () => {
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
        const newItem: EducationItem = {
            id: uuidv4(),
            school: '',
            major: '',
            degree: '',
            start: '',
            end: '',
            highlights: [],
        };
        setResumeData({
            ...resumeData,
            education: [newItem, ...resumeData.education],
        });
    };

    const handleRemove = (id: string) => {
        setResumeData({
            ...resumeData,
            education: resumeData.education.filter(item => item.id !== id),
        });
    };

    const updateItem = (id: string, field: keyof EducationItem, value: any) => {
        setResumeData({
            ...resumeData,
            education: resumeData.education.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    return (
        <div className="space-y-4">
            {resumeData.education.map((item) => (
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
                                htmlFor={`school-${item.id}`}
                                value={fieldLabels.school || ''}
                                defaultValue={t.school}
                                onChange={(v) => updateFieldLabel('school', v)}
                            />
                            <Input id={`school-${item.id}`} value={item.school} onChange={(e) => updateItem(item.id, 'school', e.target.value)} placeholder="School Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`degree-${item.id}`}
                                    value={fieldLabels.degree || ''}
                                    defaultValue={t.degree}
                                    onChange={(v) => updateFieldLabel('degree', v)}
                                />
                                <Input id={`degree-${item.id}`} value={item.degree} onChange={(e) => updateItem(item.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                            </div>
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`major-${item.id}`}
                                    value={fieldLabels.major || ''}
                                    defaultValue={t.major}
                                    onChange={(v) => updateFieldLabel('major', v)}
                                />
                                <Input id={`major-${item.id}`} value={item.major} onChange={(e) => updateItem(item.id, 'major', e.target.value)} placeholder="Computer Science" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`start-${item.id}`}
                                    value={fieldLabels.eduStart || ''}
                                    defaultValue={t.startDate}
                                    onChange={(v) => updateFieldLabel('eduStart', v)}
                                />
                                <Input id={`start-${item.id}`} type="month" value={item.start} onChange={(e) => updateItem(item.id, 'start', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`end-${item.id}`}
                                    value={fieldLabels.eduEnd || ''}
                                    defaultValue={t.endDate}
                                    onChange={(v) => updateFieldLabel('eduEnd', v)}
                                />
                                <Input id={`end-${item.id}`} type="month" value={item.end} onChange={(e) => updateItem(item.id, 'end', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <EditableLabel
                                htmlFor={`highlights-${item.id}`}
                                value={fieldLabels.eduHighlights || ''}
                                defaultValue={t.highlightsDistinctions}
                                onChange={(v) => updateFieldLabel('eduHighlights', v)}
                            />
                            <Textarea
                                id={`highlights-${item.id}`}
                                value={item.highlights.join('\n')}
                                onChange={(e) => updateItem(item.id, 'highlights', e.target.value.split('\n'))}
                                placeholder="• GPA 4.0..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> {t.addEducation}
            </Button>
        </div>
    );
};
