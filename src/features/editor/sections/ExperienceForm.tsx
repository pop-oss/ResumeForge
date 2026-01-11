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

export const ExperienceForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();

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
            {resumeData.experience.map((item, index) => (
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
                                <Label>{t.company}</Label>
                                <Input value={item.company} onChange={(e) => updateItem(item.id, 'company', e.target.value)} placeholder="Company Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.role}</Label>
                                <Input value={item.role} onChange={(e) => updateItem(item.id, 'role', e.target.value)} placeholder="Role Title" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.startDate}</Label>
                                <Input type="month" value={item.start} onChange={(e) => updateItem(item.id, 'start', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.endDate}</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
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
                            <Label>{t.highlights} ({t.onePerLine})</Label>
                            <Textarea
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
