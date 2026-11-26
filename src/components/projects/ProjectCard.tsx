'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { DocumentTextIcon, StarIcon } from '@heroicons/react/24/outline';
import { Github } from 'lucide-react';
import { CardItem } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent font-medium hover:underline" />
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

interface ProjectCardProps {
    project: CardItem;
    embedded?: boolean;
    index?: number;
}

export default function ProjectCard({ project, embedded = false, index = 0 }: ProjectCardProps) {
    const messages = useMessages();
    const [expandedDetails, setExpandedDetails] = useState(false);
    const [githubStars, setGitHubStars] = useState<{ link: string; count: number }>();
    const { link, stars: savedStars } = project;
    const stars = githubStars?.link === link ? githubStars?.count ?? savedStars : savedStars;

    useEffect(() => {
        if (!link || savedStars === undefined) return;
        const repo = /^https:\/\/github\.com\/([a-z\d-]+\/[a-z\d_][a-z\d_.-]*)\/?$/i.exec(link)?.[1];
        if (!repo) return;

        const controller = new AbortController();
        // Keep the published count visible if GitHub cannot respond.
        fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) return;
                const { stargazers_count: count } = await response.json();
                if (!controller.signal.aborted && Number.isSafeInteger(count) && count >= 0) {
                    setGitHubStars({ link, count });
                }
            })
            .catch(() => {});

        return () => controller.abort();
    }, [link, savedStars]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
        >
            {/* Match the publication preview size and keep project text in one column. */}
            <div className="flex flex-col gap-6 md:flex-row">
                {project.image && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-contain p-1"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                        <h3 className={`${embedded ? "text-lg" : "text-xl"} min-w-0 break-words font-semibold text-primary leading-tight`}>
                            {project.link ? (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                    {project.title}
                                </a>
                            ) : project.title}
                        </h3>
                        {project.date && (
                            <span className="text-sm text-neutral-500 font-medium whitespace-nowrap">
                                {project.date}
                            </span>
                        )}
                    </div>

                    {project.subtitle && (
                        <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-2`}>
                            {project.subtitle}
                        </p>
                    )}

                    {project.content && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 leading-relaxed">
                            <ReactMarkdown components={markdownComponents}>{project.content}</ReactMarkdown>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <Github className="h-3 w-3 mr-1.5" />
                                {messages.projects.repository}
                            </a>
                        )}
                        {typeof stars === 'number' && (
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                title={messages.projects.stars}
                            >
                                <StarIcon className="h-3 w-3 mr-1.5" />
                                {stars.toLocaleString()}
                            </span>
                        )}
                        {project.details && (
                            <button
                                onClick={() => setExpandedDetails(!expandedDetails)}
                                className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                    expandedDetails
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                {messages.projects.details}
                            </button>
                        )}
                        {project.tags?.map((tag) => (
                            <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* The long description expands across the full card, like a paper's abstract. */}
            <AnimatePresence>
                {expandedDetails && project.details ? (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                    >
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                            <ReactMarkdown components={markdownComponents}>{project.details}</ReactMarkdown>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    );
}
