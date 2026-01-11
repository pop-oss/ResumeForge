import React from 'react';

interface LinkifyProps {
    text: string;
    className?: string;
    linkClassName?: string;
}

// 匹配URL的正则表达式
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

export const Linkify: React.FC<LinkifyProps> = ({ text, className, linkClassName = 'text-blue-600 hover:underline' }) => {
    if (!text) return null;

    const parts = text.split(URL_REGEX);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (URL_REGEX.test(part)) {
                    // Reset regex lastIndex
                    URL_REGEX.lastIndex = 0;
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClassName}
                        >
                            {part.replace(/^https?:\/\//, '')}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
};

// 简单的链接渲染，用于已知是URL的字段
export const ExternalLink: React.FC<{
    href?: string;
    children?: React.ReactNode;
    className?: string;
}> = ({ href, children, className = 'text-blue-600 hover:underline' }) => {
    if (!href) return null;

    const displayText = children || href.replace(/^https?:\/\//, '');

    return (
        <a
            href={href.startsWith('http') ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {displayText}
        </a>
    );
};
