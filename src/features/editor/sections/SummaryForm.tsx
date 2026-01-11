import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import { Textarea } from '../../../components/ui/textarea';
import { EditableLabel } from '../../../components/ui/editable-label';

export const SummaryForm: React.FC = () => {
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData({ ...resumeData, summary: e.target.value });
    };

    return (
        <div className="space-y-2">
            <EditableLabel
                htmlFor="summary"
                value={fieldLabels.summary || ''}
                defaultValue={t.professionalSummary}
                onChange={(v) => updateFieldLabel('summary', v)}
            />
            <Textarea
                id="summary"
                value={resumeData.summary}
                onChange={handleChange}
                placeholder={t.summaryPlaceholder}
                className="min-h-[120px]"
            />
        </div>
    );
};
