import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { X, Upload } from 'lucide-react';
import { EditableLabel } from '../../../components/ui/editable-label';

export const BasicsForm: React.FC = () => {
    const { resumeData, updateBasics, setResumeData } = useResume();
    const { t } = useLanguage();
    const { basics, settings } = resumeData;
    const fieldLabels = settings.fieldLabels || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        updateBasics({ [name]: value });
    };

    const updateFieldLabel = (field: string, value: string) => {
        setResumeData({
            ...resumeData,
            settings: {
                ...settings,
                fieldLabels: {
                    ...fieldLabels,
                    [field]: value
                }
            }
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateBasics({ avatarBase64: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        updateBasics({ avatarBase64: '' });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="name"
                        value={fieldLabels.name || ''}
                        defaultValue={t.fullName}
                        onChange={(v) => updateFieldLabel('name', v)}
                    />
                    <Input id="name" name="name" value={basics.name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="title"
                        value={fieldLabels.title || ''}
                        defaultValue={t.jobTitle}
                        onChange={(v) => updateFieldLabel('title', v)}
                    />
                    <Input id="title" name="title" value={basics.title} onChange={handleChange} placeholder="Frontend Engineer" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="email"
                        value={fieldLabels.email || ''}
                        defaultValue={t.email}
                        onChange={(v) => updateFieldLabel('email', v)}
                    />
                    <Input id="email" name="email" value={basics.email} onChange={handleChange} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="phone"
                        value={fieldLabels.phone || ''}
                        defaultValue={t.phone}
                        onChange={(v) => updateFieldLabel('phone', v)}
                    />
                    <Input id="phone" name="phone" value={basics.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                </div>
            </div>

            <div className="space-y-2">
                <EditableLabel
                    htmlFor="city"
                    value={fieldLabels.city || ''}
                    defaultValue={t.location}
                    onChange={(v) => updateFieldLabel('city', v)}
                />
                <Input id="city" name="city" value={basics.city} onChange={handleChange} placeholder="San Francisco, CA" />
            </div>

            <div className="space-y-2">
                <Label>{t.photo}</Label>
                <div className="flex items-center gap-4">
                    {basics.avatarBase64 ? (
                        <div className="relative group">
                            <img
                                src={basics.avatarBase64}
                                alt="Profile"
                                className="w-16 h-16 rounded object-cover border"
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={t.removePhoto}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded bg-slate-100 border flex items-center justify-center text-slate-400">
                            <Upload className="w-6 h-6" />
                        </div>
                    )}
                    <div className="flex-1">
                        <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="text-sm cursor-pointer file:text-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Recommended squared image, max 2MB.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="website"
                        value={fieldLabels.website || ''}
                        defaultValue={t.website}
                        onChange={(v) => updateFieldLabel('website', v)}
                    />
                    <Input id="website" name="website" value={basics.website || ''} onChange={handleChange} placeholder="johndoe.com" />
                </div>
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="github"
                        value={fieldLabels.github || ''}
                        defaultValue="GitHub"
                        onChange={(v) => updateFieldLabel('github', v)}
                    />
                    <Input id="github" name="github" value={basics.github || ''} onChange={handleChange} placeholder="github.com/john" />
                </div>
                <div className="space-y-2">
                    <EditableLabel
                        htmlFor="linkedin"
                        value={fieldLabels.linkedin || ''}
                        defaultValue="LinkedIn"
                        onChange={(v) => updateFieldLabel('linkedin', v)}
                    />
                    <Input id="linkedin" name="linkedin" value={basics.linkedin || ''} onChange={handleChange} placeholder="linkedin.com/in/john" />
                </div>
            </div>
        </div>
    );
};
