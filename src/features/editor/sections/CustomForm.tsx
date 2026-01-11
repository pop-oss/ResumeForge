import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import type { CustomSection, CustomSectionItem } from '../../resume/types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const CustomForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

    const handleAddSection = () => {
        const newSection: CustomSection = {
            id: uuidv4(),
            title: t.newSection || 'New Section',
            items: [],
        };
        setResumeData({
            ...resumeData,
            custom: [...resumeData.custom, newSection],
        });
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    const handleRemoveSection = (sectionId: string) => {
        setResumeData({
            ...resumeData,
            custom: resumeData.custom.filter(s => s.id !== sectionId),
        });
    };

    const updateSectionTitle = (sectionId: string, title: string) => {
        setResumeData({
            ...resumeData,
            custom: resumeData.custom.map(s =>
                s.id === sectionId ? { ...s, title } : s
            ),
        });
    };

    const handleAddItem = (sectionId: string) => {
        const newItem: CustomSectionItem = {
            id: uuidv4(),
            title: '',
            subtitle: '',
            date: '',
            link: '',
            items: [],
        };
        setResumeData({
            ...resumeData,
            custom: resumeData.custom.map(s =>
                s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
            ),
        });
    };

    const handleRemoveItem = (sectionId: string, itemId: string) => {
        setResumeData({
            ...resumeData,
            custom: resumeData.custom.map(s =>
                s.id === sectionId
                    ? { ...s, items: s.items.filter(i => i.id !== itemId) }
                    : s
            ),
        });
    };

    const updateItem = (sectionId: string, itemId: string, field: keyof CustomSectionItem, value: any) => {
        setResumeData({
            ...resumeData,
            custom: resumeData.custom.map(s =>
                s.id === sectionId
                    ? {
                        ...s,
                        items: s.items.map(i =>
                            i.id === itemId ? { ...i, [field]: value } : i
                        ),
                    }
                    : s
            ),
        });
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    return (
        <div className="space-y-4">
            {resumeData.custom.map((section) => (
                <Card key={section.id} className="relative">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleSection(section.id)}
                            >
                                {expandedSections[section.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                            <Input
                                value={section.title}
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                placeholder={t.sectionTitle || 'Section Title'}
                                className="font-medium"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-8 w-8"
                                onClick={() => handleRemoveSection(section.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {expandedSections[section.id] && (
                            <div className="space-y-3 pl-4 border-l-2 border-muted">
                                {section.items.map((item) => (
                                    <Card key={item.id} className="relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive h-6 w-6"
                                            onClick={() => handleRemoveItem(section.id, item.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <CardContent className="p-3 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">{t.itemTitle || 'Title'}</Label>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)}
                                                        placeholder={t.itemTitlePlaceholder || 'e.g. Award Name'}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">{t.itemSubtitle || 'Subtitle'} ({t.optional})</Label>
                                                    <Input
                                                        value={item.subtitle || ''}
                                                        onChange={(e) => updateItem(section.id, item.id, 'subtitle', e.target.value)}
                                                        placeholder={t.itemSubtitlePlaceholder || 'e.g. Organization'}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">{t.date || 'Date'} ({t.optional})</Label>
                                                    <Input
                                                        value={item.date || ''}
                                                        onChange={(e) => updateItem(section.id, item.id, 'date', e.target.value)}
                                                        placeholder="2023"
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">{t.link || 'Link'} ({t.optional})</Label>
                                                    <Input
                                                        value={item.link || ''}
                                                        onChange={(e) => updateItem(section.id, item.id, 'link', e.target.value)}
                                                        placeholder="https://..."
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">{t.details || 'Details'} ({t.onePerLine})</Label>
                                                <Textarea
                                                    value={item.items.join('\n')}
                                                    onChange={(e) => updateItem(section.id, item.id, 'items', e.target.value.split('\n').filter(s => s.trim()))}
                                                    placeholder={t.detailsPlaceholder || '• Detail 1\n• Detail 2'}
                                                    className="min-h-[60px] text-sm"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleAddItem(section.id)}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> {t.addItem || 'Add Item'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddSection}>
                <Plus className="w-4 h-4 mr-2" /> {t.addCustomSection || 'Add Custom Section'}
            </Button>
        </div>
    );
};
