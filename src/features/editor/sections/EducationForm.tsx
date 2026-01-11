import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { EducationItem } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const EducationForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();

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
                            <Label>{t.school}</Label>
                            <Input value={item.school} onChange={(e) => updateItem(item.id, 'school', e.target.value)} placeholder="School Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.degree}</Label>
                                <Input value={item.degree} onChange={(e) => updateItem(item.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.major}</Label>
                                <Input value={item.major} onChange={(e) => updateItem(item.id, 'major', e.target.value)} placeholder="Computer Science" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.startDate}</Label>
                                <Input type="month" value={item.start} onChange={(e) => updateItem(item.id, 'start', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.endDate}</Label>
                                <Input type="month" value={item.end} onChange={(e) => updateItem(item.id, 'end', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t.highlightsDistinctions}</Label>
                            <Textarea
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
