import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { ExperienceItem } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EditableLabel } from '../../../components/ui/editable-label';

export const ExperienceForm: React.FC = () => {
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
        const newItem: ExperienceItem = {
            id: uuidv4(),
            company: '',
            role: '',
            city: '',
            start: '',
            end: '',
            current: false,
            highlights: [],
        };
        setResumeData({
            ...resumeData,
            experience: [newItem, ...resumeData.experience],
        });
    };

    const handleRemove = (id: string) => {
        setResumeData({
            ...resumeData,
            experience: resumeData.experience.filter(item => item.id !== id),
        });
    };

    const updateItem = (id: string, field: keyof ExperienceItem, value: any) => {
        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        });
    };

    return (
        <div className="space-y-4">
            {resumeData.experience.map((item) => (
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
                                <EditableLabel
                                    htmlFor={`company-${item.id}`}
                                    value={fieldLabels.company || ''}
                                    defaultValue={t.company}
                                    onChange={(v) => updateFieldLabel('company', v)}
                                />
                                <Input id={`company-${item.id}`} value={item.company} onChange={(e) => updateItem(item.id, 'company', e.target.value)} placeholder="Company Name" />
                            </div>
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`role-${item.id}`}
                                    value={fieldLabels.role || ''}
                                    defaultValue={t.role}
                                    onChange={(v) => updateFieldLabel('role', v)}
                                />
                                <Input id={`role-${item.id}`} value={item.role} onChange={(e) => updateItem(item.id, 'role', e.target.value)} placeholder="Role Title" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <EditableLabel
                                htmlFor={`city-${item.id}`}
                                value={fieldLabels.expCity || ''}
                                defaultValue={t.city || '城市/地点'}
                                onChange={(v) => updateFieldLabel('expCity', v)}
                            />
                            <Input id={`city-${item.id}`} value={item.city} onChange={(e) => updateItem(item.id, 'city', e.target.value)} placeholder="San Francisco, CA" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`exp-start-${item.id}`}
                                    value={fieldLabels.expStart || ''}
                                    defaultValue={t.startDate}
                                    onChange={(v) => updateFieldLabel('expStart', v)}
                                />
                                <Input id={`exp-start-${item.id}`} type="month" value={item.start} onChange={(e) => updateItem(item.id, 'start', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <EditableLabel
                                    htmlFor={`exp-end-${item.id}`}
                                    value={fieldLabels.expEnd || ''}
                                    defaultValue={t.endDate}
                                    onChange={(v) => updateFieldLabel('expEnd', v)}
                                />
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id={`exp-end-${item.id}`}
                                        type="month"
                                        value={item.end}
                                        disabled={item.current}
                                        onChange={(e) => updateItem(item.id, 'end', e.target.value)}
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            id={`current-${item.id}`}
                                            checked={item.current}
                                            onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor={`current-${item.id}`} className="text-xs nowrap">{t.present}</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <EditableLabel
                                htmlFor={`exp-highlights-${item.id}`}
                                value={fieldLabels.expHighlights || ''}
                                defaultValue={`${t.highlights} (${t.onePerLine})`}
                                onChange={(v) => updateFieldLabel('expHighlights', v)}
                            />
                            <Textarea
                                id={`exp-highlights-${item.id}`}
                                value={item.highlights.join('\n')}
                                onChange={(e) => updateItem(item.id, 'highlights', e.target.value.split('\n'))}
                                placeholder="• Achieved X..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> {t.addExperience}
            </Button>
        </div>
    );
};
