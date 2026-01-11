import { ResumeData } from './types';

export const initialResumeData: ResumeData = {
    basics: {
        name: 'John Doe',
        title: 'Senior Frontend Engineer',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        city: 'San Francisco, CA',
        website: 'johndoe.dev',
        github: 'github.com/johndoe',
        linkedin: 'linkedin.com/in/johndoe',
    },
    summary: 'Passionate and experienced Frontend Engineer offering 5+ years of experience in building high-performance web applications using React and TypeScript. Dedicated to writing clean, maintainable code and optimizing user experiences.',
    experience: [
        {
            id: 'exp-1',
            company: 'Tech Solutions Inc.',
            role: 'Senior Frontend Developer',
            city: 'San Francisco, CA',
            start: '2021-03',
            end: '',
            current: true,
            highlights: [
                'Led the migration of a legacy monolithic application to a modern micro-frontend architecture using React and Webpack Module Federation.',
                'Improved application performance by 40% through code splitting, lazy loading, and image optimization techniques.',
                'Mentored junior developers and established coding standards and best practices for the team.',
            ],
        },
        {
            id: 'exp-2',
            company: 'Creative Web Agency',
            role: 'Frontend Developer',
            city: 'New York, NY',
            start: '2018-06',
            end: '2021-02',
            current: false,
            highlights: [
                'Developed responsive websites and web applications for various clients using React, Redux, and SCSS.',
                'Collaborated with designers and backend developers to deliver high-quality products on time and within budget.',
                'Implemented accessibility features to ensure compliance with WCAG 2.1 standards.',
            ],
        },
    ],
    education: [
        {
            id: 'edu-1',
            school: 'University of Technology',
            major: 'Computer Science',
            degree: 'Bachelor of Science',
            start: '2014-09',
            end: '2018-05',
            highlights: [
                'Graduated with Honors (GPA 3.8/4.0)',
                'Relevant Coursework: Data Structures, Algorithms, Web Development, Database Systems',
            ],
        },
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'E-commerce Platform',
            link: 'https://ecommerce-demo.com',
            techStack: ['React', 'Node.js', 'MongoDB', 'AWS'],
            highlights: [
                'Built a full-featured e-commerce platform with product search, cart functionality, and secure checkout integration.',
                'Implemented real-time inventory management using WebSockets.',
            ],
        },
    ],
    skills: [
        {
            id: 'skill-group-1',
            name: 'Frontend',
            items: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Redux', 'HTML5/CSS3'],
        },
        {
            id: 'skill-group-2',
            name: 'Tools & Methods',
            items: ['Git', 'Webpack', 'Jest', 'CI/CD', 'Agile/Scrum'],
        },
    ],
    custom: [],
    settings: {
        template: 'classic',
        themeColor: '#2563eb', // blue-600
        fontScale: 100,
        lineHeight: 1.5,
        sectionVisibility: {
            basics: true,
            summary: true,
            experience: true,
            education: true,
            projects: true,
            skills: true,
            custom: true,
        },
        sectionOrder: [
            'basics',
            'summary',
            'experience',
            'education',
            'projects',
            'skills',
            'custom',
        ],
    },
};
