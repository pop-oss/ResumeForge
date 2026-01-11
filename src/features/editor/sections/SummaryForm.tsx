import React from 'react';
import { useResume } from '../../resume/ResumeContext';
import { useLanguage } from '../../../i18n';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

export const SummaryForm: React.FC = () => {
    const { resumeData, setResumeData } = useResume();
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeData({ ...resumeData, summary: e.target.value });
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="summary">{t.professionalSummary}</Label>
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
