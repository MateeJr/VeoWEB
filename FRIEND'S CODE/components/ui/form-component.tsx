/* eslint-disable @next/next/no-img-element */
// /components/ui/form-component.tsx
import React, { useState, useRef, useCallback, useEffect, SVGProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import useWindowSize from '@/hooks/use-window-size';
import { TelescopeIcon, X, BookIcon, AlertCircle, PlusIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, SearchGroup, SearchGroupId, searchGroups } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { Globe } from 'lucide-react';
import { BrainCircuit, EyeIcon } from 'lucide-react';
import { track } from '@vercel/analytics';
import {
    TooltipProvider,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from '@/app/page';

// Use Message type for UIMessage to avoid import issues
type UIMessage = Message;

interface ModelSwitcherProps {
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    className?: string;
    showExperimentalModels: boolean;
    attachments: Array<Attachment>;
    messages: Array<Message>;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    onModelSelect?: (model: typeof models[0]) => void;
}

const XAIIcon = ({ className }: { className?: string }) => (
    <svg
        width="440"
        height="483"
        viewBox="0 0 440 483"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M356.09 155.99L364.4 482.36H430.96L439.28 37.18L356.09 155.99Z" fill="currentColor" />
        <path d="M439.28 0.910004H337.72L178.35 228.53L229.13 301.05L439.28 0.910004Z" fill="currentColor" />
        <path d="M0.609985 482.36H102.17L152.96 409.84L102.17 337.31L0.609985 482.36Z" fill="currentColor" />
        <path d="M0.609985 155.99L229.13 482.36H330.69L102.17 155.99H0.609985Z" fill="currentColor" />
    </svg>
);

const GeminiIcon = ({ className }: { className?: string }) => (
    <svg height="1em" style={{ flex: "none", lineHeight: "1" }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
        <title>Gemini</title>
        <defs>
            <linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
                <stop offset="0%" stop-color="#1C7DFF"></stop>
                <stop offset="52.021%" stop-color="#1C69FF"></stop>
                <stop offset="100%" stop-color="#F0DCD6"></stop>
            </linearGradient>
        </defs>
        <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#lobe-icons-gemini-fill)" fill-rule="nonzero"></path>
    </svg>
);

const CircleIcon = ({ className }: { className?: string }) => (
    <svg height="1em" width="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
        <title>VNYL</title>
        <circle cx="12" cy="12" r="10" fill="white" />
    </svg>
);

const OpenAIIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256"
        height="260"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 256 260"
        className={className}
    >
        <path fill="currentColor" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
    </svg>
)

const QwenIcon = (props: SVGProps<SVGSVGElement>) => <svg fill="currentColor" fillRule="evenodd" height="1em" style={{
  flex: "none",
  lineHeight: 1
}} viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><title>{"Qwen"}</title><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" /></svg>;


const AnthropicIcon = (props: SVGProps<SVGSVGElement>) => <svg fill="currentColor" fillRule="evenodd" style={{
  flex: "none",
  lineHeight: 1
}} viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" height="1em" {...props}><title>{"Anthropic"}</title><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" /></svg>;

const models = [
    { value: "scira-google", label: "VNYL 1.0", icon: CircleIcon, iconClass: "text-current", description: "VNYL's latest model", color: "black", vision: true, reasoning: true, experimental: false, category: "VNYL's" },
];

const getColorClasses = (color: string, isSelected: boolean = false) => {
    const baseClasses = "transition-colors duration-200";
    const selectedClasses = isSelected ? "bg-opacity-100! dark:bg-opacity-100!" : "";

    switch (color) {
        case 'black':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#0F0F0F]! dark:bg-[#0F0F0F]! text-white! hover:bg-[#0F0F0F]! dark:hover:bg-[#0F0F0F]! border-[#0F0F0F]! dark:border-[#0F0F0F]!`
                : `${baseClasses} text-[#0F0F0F]! dark:text-[#E5E5E5]! hover:bg-[#0F0F0F]! hover:text-white! dark:hover:bg-[#0F0F0F]! dark:hover:text-white!`;
        case 'gray':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#4E4E4E]! dark:bg-[#4E4E4E]! text-white! hover:bg-[#3D3D3D]! dark:hover:bg-[#3D3D3D]! border-[#4E4E4E]! dark:border-[#4E4E4E]!`
                : `${baseClasses} text-[#4E4E4E]! dark:text-[#E5E5E5]! hover:bg-[#4E4E4E]! hover:text-white! dark:hover:bg-[#4E4E4E]! dark:hover:text-white!`;
        case 'indigo':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#4F46E5]! dark:bg-[#4F46E5]! text-white! hover:bg-[#4338CA]! dark:hover:bg-[#4338CA]! border-[#4F46E5]! dark:border-[#4F46E5]!`
                : `${baseClasses} text-[#4F46E5]! dark:text-[#6366F1]! hover:bg-[#4F46E5]! hover:text-white! dark:hover:bg-[#4F46E5]! dark:hover:text-white!`;
        case 'violet':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#8B5CF6]! dark:bg-[#8B5CF6]! text-white! hover:bg-[#7C3AED]! dark:hover:bg-[#7C3AED]! border-[#8B5CF6]! dark:border-[#8B5CF6]!`
                : `${baseClasses} text-[#8B5CF6]! dark:text-[#A78BFA]! hover:bg-[#8B5CF6]! hover:text-white! dark:hover:bg-[#8B5CF6]! dark:hover:text-white!`;
        case 'purple':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#5E5ADB]! dark:bg-[#5E5ADB]! text-white! hover:bg-[#4D49C9]! dark:hover:bg-[#4D49C9]! border-[#5E5ADB]! dark:border-[#5E5ADB]!`
                : `${baseClasses} text-[#5E5ADB]! dark:text-[#5E5ADB]! hover:bg-[#5E5ADB]! hover:text-white! dark:hover:bg-[#5E5ADB]! dark:hover:text-white!`;
        case 'alpha':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-linear-to-r! from-[#0b3d91]! to-[#d01012]! dark:bg-linear-to-r! dark:from-[#0b3d91]! dark:to-[#d01012]! text-white! hover:opacity-90! border-[#0b3d91]! dark:border-[#0b3d91]!`
                : `${baseClasses} text-[#d01012]! dark:text-[#3f83f8]! hover:bg-linear-to-r! hover:from-[#0b3d91]! hover:to-[#d01012]! hover:text-white! dark:hover:text-white!`;
        case 'blue':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#1C7DFF]! dark:bg-[#1C7DFF]! text-white! hover:bg-[#0A6AE9]! dark:hover:bg-[#0A6AE9]! border-[#1C7DFF]! dark:border-[#1C7DFF]!`
                : `${baseClasses} text-[#1C7DFF]! dark:text-[#4C96FF]! hover:bg-[#1C7DFF]! hover:text-white! dark:hover:bg-[#1C7DFF]! dark:hover:text-white!`;
        case 'gemini':
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-[#1EA896]! dark:bg-[#1EA896]! text-white! hover:bg-[#19967F]! dark:hover:bg-[#19967F]! border-[#1EA896]! dark:border-[#1EA896]!`
                : `${baseClasses} text-[#1EA896]! dark:text-[#34C0AE]! hover:bg-[#1EA896]! hover:text-white! dark:hover:bg-[#1EA896]! dark:hover:text-white!`;
        default:
            return isSelected
                ? `${baseClasses} ${selectedClasses} bg-neutral-500! dark:bg-neutral-700! text-white! hover:bg-neutral-600! dark:hover:bg-neutral-800! border-neutral-500! dark:border-neutral-700!`
                : `${baseClasses} text-neutral-600! dark:text-neutral-300! hover:bg-neutral-500! hover:text-white! dark:hover:bg-neutral-700! dark:hover:text-white!`;
    }
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ selectedModel, setSelectedModel, className, showExperimentalModels, attachments, messages, status, onModelSelect }) => {
    const selectedModelData = models.find(model => model.value === selectedModel);
    // Always keep dropdown closed
    const [isOpen, setIsOpen] = useState(false);
    const isProcessing = status === 'submitted' || status === 'streaming';

    // Check for attachments in current and previous messages
    const hasAttachments = attachments.length > 0 || messages.some(msg =>
        msg.experimental_attachments && msg.experimental_attachments.length > 0
    );

    // Filter models based on attachments first, then experimental status
    const filteredModels = hasAttachments
        ? models.filter(model => model.vision)
        : models.filter(model => showExperimentalModels ? true : !model.experimental);

    // Group filtered models by category
    const groupedModels = filteredModels.reduce((acc, model) => {
        const category = model.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    // Get hover color classes based on model color
    const getHoverColorClasses = (modelColor: string) => {
        switch(modelColor) {
            case 'black': return 'hover:bg-black/20! dark:hover:bg-black/20!';
            case 'gray': return 'hover:bg-gray-500/20! dark:hover:bg-gray-400/20!';
            case 'indigo': return 'hover:bg-indigo-500/20! dark:hover:bg-indigo-400/20!';
            case 'violet': return 'hover:bg-violet-500/20! dark:hover:bg-violet-400/20!';
            case 'purple': return 'hover:bg-purple-500/20! dark:hover:bg-purple-400/20!';
            case 'gemini': return 'hover:bg-teal-500/20! dark:hover:bg-teal-400/20!';
            case 'blue': return 'hover:bg-blue-500/20! dark:hover:bg-blue-400/20!';
            default: return 'hover:bg-neutral-500/20! dark:hover:bg-neutral-400/20!';
        }
    };

    // Get capability icon colors
    const getCapabilityColors = (capability: string) => {
        if (capability === 'reasoning') {
            return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700";
        } else if (capability === 'vision') {
            return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700";
        }
        return "";
    };

    return (
        <DropdownMenu
            onOpenChange={() => {}} // Prevent dropdown from opening
            modal={false}
            open={false} // Always keep dropdown closed
        >
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                    "rounded-full transition-all duration-200",
                    "border border-neutral-200 dark:border-neutral-800",
                    "hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700",
                    getColorClasses(selectedModelData?.color || "neutral", true),
                    "opacity-80", // Removed cursor-not-allowed
                    "ring-0 outline-hidden",
                    "group",
                    className
                )}
                disabled={true} // Dropdown trigger still disabled
            >
                <div className="relative flex items-center gap-2">
                    {selectedModelData && (
                        typeof selectedModelData.icon === 'string' ? (
                            <img
                                src={selectedModelData.icon}
                                alt={selectedModelData.label}
                                className={cn(
                                    "w-3.5 h-3.5 object-contain transition-all duration-300",
                                    "group-hover:scale-110 group-hover:rotate-6",
                                    selectedModelData.iconClass
                                )}
                            />
                        ) : (
                            <selectedModelData.icon
                                className={cn(
                                    "w-3.5 h-3.5 transition-all duration-300",
                                    "group-hover:scale-110 group-hover:rotate-6",
                                    selectedModelData.iconClass
                                )}
                            />
                        )
                    )}
                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium overflow-hidden">
                        <motion.div
                            variants={{
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 }
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                mass: 0.5
                            }}
                            className="whitespace-nowrap"
                        >
                            {selectedModelData?.label || ""}
                        </motion.div>
                        {/* Removed dropdown arrow motion.div here */}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[260px]! p-1! font-sans! rounded-lg bg-white dark:bg-neutral-900 mt-2! z-52! shadow-lg border border-neutral-200 dark:border-neutral-800 max-h-[300px]! overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                align="start"
                side="bottom"
                avoidCollisions={['submitted', 'streaming', 'ready', 'error'].includes(status)}
                sideOffset={6}
                forceMount
            >
                {Object.entries(groupedModels).map(([category, categoryModels], categoryIndex) => (
                    <div key={category} className={cn("pt-0.5 pb-0.5", categoryIndex > 0 ? "mt-0.5 border-t border-neutral-200 dark:border-neutral-800" : "")}>
                        <div className="px-1.5 py-0.5 text-xs! sm:text-[9px] font-medium text-neutral-500 dark:text-neutral-400">
                            {category} Models
                        </div>
                        <div className="space-y-0.5">
                            {categoryModels.map((model) => (
                                <DropdownMenuItem
                                    key={model.value}
                                    onSelect={() => {
                                        console.log("Selected model:", model.value);
                                        setSelectedModel(model.value.trim());

                                        // Call onModelSelect if provided
                                        if (onModelSelect) {
                                            onModelSelect(model);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-1.5 py-1.5 rounded-md text-xs",
                                        "transition-all duration-200",
                                        "group/item",
                                        selectedModel === model.value 
                                            ? getColorClasses(model.color, true)
                                            : getHoverColorClasses(model.color)
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center justify-center size-7 rounded-md",
                                        "transition-all duration-300",
                                        "group-hover/item:scale-110 group-hover/item:rotate-6",
                                        selectedModel === model.value
                                            ? "bg-white/20 dark:bg-white/10"
                                            : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                    )}>
                                        {typeof model.icon === 'string' ? (
                                            <img
                                                src={model.icon}
                                                alt={model.label}
                                                className={cn(
                                                    "w-4 h-4 object-contain",
                                                    "transition-all duration-300",
                                                    "group-hover/item:scale-110 group-hover/item:rotate-12",
                                                    model.iconClass,
                                                    model.value === "scira-optimus" && "invert"
                                                )}
                                            />
                                        ) : (
                                            <model.icon
                                                className={cn(
                                                    "size-4",
                                                    "transition-all duration-300",
                                                    "group-hover/item:scale-110 group-hover/item:rotate-12",
                                                    model.iconClass
                                                )}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0 min-w-0 flex-1">
                                        <div className="font-medium truncate text-[11px] flex items-center">
                                            {model.label}
                                            {selectedModel === model.value && (
                                                <span className="ml-1 inline-flex relative top-[-1px]">
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="h-1 w-1 rounded-full bg-current"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[9px] opacity-70 truncate leading-tight">
                                            {model.description}
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {(model.vision || model.reasoning) && (
                                                <div className="flex gap-1">
                                                    {model.vision && (
                                                        <div className={cn(
                                                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium",
                                                            getCapabilityColors("vision")
                                                        )}>
                                                            <EyeIcon className="size-2.5" />
                                                            <span>Vision</span>
                                                        </div>
                                                    )}
                                                    {model.reasoning && (
                                                        <div className={cn(
                                                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium",
                                                            getCapabilityColors("reasoning")
                                                        )}>
                                                            <BrainCircuit className="size-2.5" />
                                                            <span>Thinking</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}

const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "currentcolor" }}
        >
            <path
                d="M21.7304 2.27029C21.6114 2.15241 21.4617 2.0673 21.2993 2.02387C21.1368 1.98044 20.9664 1.98023 20.8038 2.02326L2.6538 7.02326C2.48438 7.06973 2.33217 7.16456 2.21445 7.2959C2.09672 7.42724 2.01914 7.59 1.9917 7.76369C1.96426 7.93738 1.98815 8.1152 2.05996 8.27424C2.13177 8.43329 2.2482 8.5669 2.3938 8.65576L10.5778 13.4473L15.3698 21.6308C15.4485 21.7657 15.566 21.8757 15.7081 21.9473C15.8502 22.0189 16.0108 22.0487 16.1708 22.0328C16.3308 22.0221 16.4843 21.9658 16.6146 21.87C16.7448 21.7742 16.8464 21.6425 16.9088 21.4908L21.9088 3.19076C21.9536 3.03022 21.9553 2.85996 21.9138 2.69853C21.8722 2.5371 21.7888 2.38926 21.6728 2.27029H21.7304Z"
                fill="currentColor"
            />
            <path
                d="M10.8984 13.8109L10.5782 13.6175L10.3844 13.2978L9.32342 19.2263L10.8984 13.8109Z"
                fill="currentColor"
            />
        </svg>
    );
};

const StopIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 3H13V13H3V3Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};

const PaperclipIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "currentcolor" }}
        >
            <path
                d="M21.4383 11.6622L12.2483 20.8522C11.1225 21.9781 9.59552 22.6106 8.00334 22.6106C6.41115 22.6106 4.88418 21.9781 3.75834 20.8522C2.63249 19.7264 2 18.1994 2 16.6072C2 15.015 2.63249 13.488 3.75834 12.3622L12.9483 3.17222C13.7079 2.41271 14.7262 1.98926 15.7883 1.98926C16.8505 1.98926 17.8688 2.41271 18.6283 3.17222C19.3878 3.93173 19.8113 4.95003 19.8113 6.01222C19.8113 7.07441 19.3878 8.09271 18.6283 8.85222L9.4483 18.0222C9.06855 18.402 8.55939 18.6137 8.0283 18.6137C7.4972 18.6137 6.98805 18.402 6.6083 18.0222C6.22855 17.6425 6.01682 17.1333 6.01682 16.6022C6.01682 16.0711 6.22855 15.562 6.6083 15.1822L14.0683 7.74222"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};


const MAX_IMAGES = 4;
const MAX_INPUT_CHARS = 10000;

const hasVisionSupport = (modelValue: string): boolean => {
    const selectedModel = models.find(model => model.value === modelValue);
    return selectedModel?.vision === true
};

const truncateFilename = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const name = filename.substring(0, maxLength - 4);
    return `${name}...${extension}`;
};

const AttachmentPreview: React.FC<{ attachment: Attachment | UploadingAttachment, onRemove: () => void, isUploading: boolean }> = ({ attachment, onRemove, isUploading }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const isUploadingAttachment = (attachment: Attachment | UploadingAttachment): attachment is UploadingAttachment => {
        return 'progress' in attachment;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "relative flex items-center",
                "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                "border border-neutral-200/80 dark:border-neutral-700/80",
                "rounded-2xl p-2 pr-8 gap-2.5",
                "shadow-xs hover:shadow-md",
                "shrink-0 z-0",
                "hover:bg-white dark:hover:bg-neutral-800",
                "transition-all duration-200",
                "group"
            )}
        >
            {isUploading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-neutral-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : isUploadingAttachment(attachment) ? (
                <div className="w-8 h-8 flex items-center justify-center">
                    <div className="relative w-6 h-6">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-neutral-200 dark:text-neutral-700 stroke-current"
                                strokeWidth="8"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                            ></circle>
                            <circle
                                className="text-primary stroke-current"
                                strokeWidth="8"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeDasharray={`${attachment.progress * 251.2}, 251.2`}
                                transform="rotate(-90 50 50)"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200">{Math.round(attachment.progress * 100)}%</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
                    <img
                        src={(attachment as Attachment).url}
                        alt={`Preview of ${attachment.name}`}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <div className="grow min-w-0">
                {!isUploadingAttachment(attachment) && (
                    <p className="text-xs font-medium truncate text-neutral-800 dark:text-neutral-200">
                        {truncateFilename(attachment.name)}
                    </p>
                )}
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {isUploadingAttachment(attachment)
                        ? 'Uploading...'
                        : formatFileSize((attachment as Attachment).size)}
                </p>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className={cn(
                    "absolute -top-1.5 -right-1.5 p-0.5 m-0 rounded-full",
                    "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                    "border border-neutral-200/80 dark:border-neutral-700/80",
                    "shadow-xs hover:shadow-md",
                    "transition-all duration-200 z-20",
                    "opacity-0 group-hover:opacity-100",
                    "scale-75 group-hover:scale-100",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
            >
                <X className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
            </motion.button>
        </motion.div>
    );
};

interface UploadingAttachment {
    file: File;
    progress: number;
}

interface FormComponentProps {
    input: string;
    setInput: (input: string) => void;
    attachments: Array<Attachment>;
    setAttachments: React.Dispatch<React.SetStateAction<Array<Attachment>>>;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions,
    ) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    stop: () => void;
    messages: Array<UIMessage>;
    append: (
        message: Message | CreateMessage,
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    resetSuggestedQuestions: () => void;
    lastSubmittedQueryRef: React.MutableRefObject<string>;
    selectedGroup: SearchGroupId;
    setSelectedGroup: React.Dispatch<React.SetStateAction<SearchGroupId>>;
    showExperimentalModels: boolean;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GroupSelectorProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ToolbarButtonProps {
    group: SearchGroup;
    isSelected: boolean;
    onClick: () => void;
}

const ToolbarButton = ({ group, isSelected, onClick }: ToolbarButtonProps) => {
    const Icon = group.icon;
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    const commonClassNames = cn(
        "relative flex items-center justify-center",
        "size-8",
        "rounded-full",
        "transition-colors duration-300",
        isSelected
            ? "bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-300"
            : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
    );

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };

    // Use regular button for mobile without tooltip
    if (isMobile) {
        return (
            <button
                onClick={handleClick}
                className={commonClassNames}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <Icon className="size-4" />
            </button>
        );
    }

    // With tooltip for desktop
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClick}
                    className={commonClassNames}
                >
                    <Icon className="size-4" />
                </motion.button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                sideOffset={6}
                className="max-w-[200px]"
            >
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-xs">{group.name}</span>
                    {group.description && (
                        <span className="text-xs text-muted-foreground leading-tight">{group.description}</span>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

interface SelectionContentProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectionContent = ({ selectedGroup, onGroupSelect, status, onExpandChange }: SelectionContentProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isProcessing = status === 'submitted' || status === 'streaming';
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    // Notify parent component when expansion state changes
    useEffect(() => {
        if (onExpandChange) {
            // Only notify about expansion on mobile devices
            onExpandChange(isMobile ? isExpanded : false);
        }
    }, [isExpanded, onExpandChange, isMobile]);

    return (
        <motion.div
            layout={false}
            initial={false}
            animate={{
                width: isExpanded && !isProcessing ? "auto" : "30px",
                gap: isExpanded && !isProcessing ? "0.5rem" : 0,
                paddingRight: isExpanded && !isProcessing ? "0.4rem" : 0,
            }}
            transition={{
                duration: 0.2,
                ease: "easeInOut",
            }}
            className={cn(
                "inline-flex items-center min-w-[38px] p-0.5",
                "rounded-full border border-neutral-200 dark:border-neutral-800",
                "bg-white dark:bg-neutral-900 shadow-xs overflow-visible",
                "relative z-10",
                isProcessing && "opacity-50 pointer-events-none"
            )}
            onMouseEnter={() => !isProcessing && setIsExpanded(true)}
            onMouseLeave={() => !isProcessing && setIsExpanded(false)}
        >
            <TooltipProvider>
                <AnimatePresence initial={false}>
                    {searchGroups.filter(group => group.show).map((group, index, filteredGroups) => {
                        const showItem = (isExpanded && !isProcessing) || selectedGroup === group.id;
                        const isLastItem = index === filteredGroups.length - 1;
                        return (
                            <motion.div
                                key={group.id}
                                layout={false}
                                animate={{
                                    width: showItem ? "28px" : 0,
                                    opacity: showItem ? 1 : 0,
                                    marginRight: (showItem && isLastItem && isExpanded) ? "2px" : 0
                                }}
                                transition={{
                                    duration: 0.15,
                                    ease: "easeInOut"
                                }}
                                className={cn(
                                    "m-0!",
                                    isLastItem && isExpanded && showItem ? "pr-0.5" : ""
                                )}
                            >
                                <ToolbarButton
                                    group={group}
                                    isSelected={selectedGroup === group.id}
                                    onClick={() => !isProcessing && onGroupSelect(group)}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </TooltipProvider>
        </motion.div>
    );
};

const GroupSelector = ({ selectedGroup, onGroupSelect, status, onExpandChange }: GroupSelectorProps) => {
    return (
        <SelectionContent
            selectedGroup={selectedGroup}
            onGroupSelect={onGroupSelect}
            status={status}
            onExpandChange={onExpandChange}
        />
    );
};

// Custom error message component that displays in the center
const showCenterError = (message: string) => {
    // Create a new div element for the error
    const errorContainer = document.createElement('div');
    errorContainer.className = 'fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none';
    
    // Setup the inner content
    errorContainer.innerHTML = `
        <div class="animate-in fade-in zoom-in duration-300 flex items-center gap-2 bg-black/90 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="text-sm">${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(errorContainer);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorContainer.classList.add('animate-out', 'fade-out', 'zoom-out');
        setTimeout(() => {
            document.body.removeChild(errorContainer);
        }, 300);
    }, 3000);
};

// Custom success message component that displays in the center
const showCenterSuccess = (message: string) => {
    // Create a new div element for the success
    const successContainer = document.createElement('div');
    successContainer.className = 'fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none';
    
    // Setup the inner content
    successContainer.innerHTML = `
        <div class="animate-in fade-in zoom-in duration-300 flex items-center gap-2 bg-black/90 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span class="text-sm">${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(successContainer);
    
    // Remove after 3 seconds
    setTimeout(() => {
        successContainer.classList.add('animate-out', 'fade-out', 'zoom-out');
        setTimeout(() => {
            document.body.removeChild(successContainer);
        }, 300);
    }, 3000);
};

const FormComponent: React.FC<FormComponentProps> = ({
    input,
    setInput,
    attachments,
    setAttachments,
    handleSubmit,
    fileInputRef,
    inputRef,
    stop,
    selectedModel,
    setSelectedModel,
    resetSuggestedQuestions,
    lastSubmittedQueryRef,
    selectedGroup,
    setSelectedGroup,
    showExperimentalModels,
    messages,
    status,
    setHasSubmitted,
}) => {
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
    const isMounted = useRef(true);
    const isCompositionActive = useRef(false)
    const { width } = useWindowSize();
    const postSubmitFileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const newValue = event.target.value;

        // Check if input exceeds character limit
        if (newValue.length > MAX_INPUT_CHARS) {
            setInput(newValue);
            showCenterError(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters.`);
        } else {
            setInput(newValue);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleGroupSelect = useCallback((group: SearchGroup) => {
        setSelectedGroup(group.id);
        inputRef.current?.focus();
    }, [setSelectedGroup, inputRef]);

    const uploadFile = async (file: File): Promise<Attachment> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            showCenterError("Failed to upload file, please try again!");
            throw error;
        }
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const totalAttachments = attachments.length + files.length;

        if (totalAttachments > MAX_IMAGES) {
            showCenterError(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        setUploadQueue(files.map((file) => file.name));

        try {
            const uploadPromises = files.map((file) => uploadFile(file));
            const uploadedAttachments = await Promise.all(uploadPromises);
            setAttachments((currentAttachments) => [
                ...currentAttachments,
                ...uploadedAttachments,
            ]);
        } catch (error) {
            console.error("Error uploading files!", error);
            showCenterError("Failed to upload one or more files. Please try again.");
        } finally {
            setUploadQueue([]);
            event.target.value = '';
        }
    }, [attachments, setAttachments]);

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (attachments.length >= MAX_IMAGES) return;

        if (e.dataTransfer.items && e.dataTransfer.items[0].kind === "file") {
            setIsDragging(true);
        }
    }, [attachments.length]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const getFirstVisionModel = useCallback(() => {
        return models.find(model => model.vision)?.value || selectedModel;
    }, [selectedModel]);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            showCenterError("Only image files are supported");
            return;
        }

        const totalAttachments = attachments.length + files.length;
        if (totalAttachments > MAX_IMAGES) {
            showCenterError(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        // Switch to vision model if current model doesn't support vision
        const currentModel = models.find(m => m.value === selectedModel);
        if (!currentModel?.vision) {
            const visionModel = getFirstVisionModel();
            setSelectedModel(visionModel);
        }

        setUploadQueue(files.map((file) => file.name));

        try {
            const uploadPromises = files.map((file) => uploadFile(file));
            const uploadedAttachments = await Promise.all(uploadPromises);
            setAttachments((currentAttachments) => [
                ...currentAttachments,
                ...uploadedAttachments,
            ]);
        } catch (error) {
            console.error("Error uploading files!", error);
            showCenterError("Failed to upload one or more files. Please try again.");
        } finally {
            setUploadQueue([]);
        }
    }, [attachments.length, setAttachments, uploadFile, selectedModel, setSelectedModel, getFirstVisionModel]);

    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter(item => item.type.startsWith('image/'));

        if (imageItems.length === 0) return;

        // Prevent default paste behavior if there are images
        e.preventDefault();

        const totalAttachments = attachments.length + imageItems.length;
        if (totalAttachments > MAX_IMAGES) {
            showCenterError(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        // Switch to vision model if needed
        const currentModel = models.find(m => m.value === selectedModel);
        if (!currentModel?.vision) {
            const visionModel = getFirstVisionModel();
            setSelectedModel(visionModel);
        }

        setUploadQueue(imageItems.map((_, i) => `Pasted Image ${i + 1}`));

        try {
            const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
            const uploadPromises = files.map(file => uploadFile(file));
            const uploadedAttachments = await Promise.all(uploadPromises);

            setAttachments(currentAttachments => [
                ...currentAttachments,
                ...uploadedAttachments,
            ]);

            showCenterSuccess('Image pasted successfully');
        } catch (error) {
            console.error("Error uploading pasted files!", error);
            showCenterError("Failed to upload pasted image. Please try again.");
        } finally {
            setUploadQueue([]);
        }
    }, [attachments.length, setAttachments, uploadFile, selectedModel, setSelectedModel, getFirstVisionModel]);

    useEffect(() => {
        if (status !== 'ready' && inputRef.current) {
            const focusTimeout = setTimeout(() => {
                if (isMounted.current && inputRef.current) {
                    inputRef.current.focus({
                        preventScroll: true
                    });
                }
            }, 300);

            return () => clearTimeout(focusTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (status !== 'ready') {
            showCenterError("Please wait for the current response to complete!");
            return;
        }

        // Check if input exceeds character limit
        if (input.length > MAX_INPUT_CHARS) {
            showCenterError(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters. Please shorten your message.`);
            return;
        }

        if (input.trim() || attachments.length > 0) {
            track('model_selected', {
                model: selectedModel,
            });
            setHasSubmitted(true);
            lastSubmittedQueryRef.current = input.trim();

            handleSubmit(event, {
                experimental_attachments: attachments,
            });

            setAttachments([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            showCenterError("Please enter a search query or attach an image.");
        }
    }, [input, attachments, handleSubmit, setAttachments, fileInputRef, lastSubmittedQueryRef, status, selectedModel, setHasSubmitted]);

    const submitForm = useCallback(() => {
        onSubmit({ preventDefault: () => { }, stopPropagation: () => { } } as React.FormEvent<HTMLFormElement>);
        resetSuggestedQuestions();

        if (width && width > 768) {
            inputRef.current?.focus();
        }
    }, [onSubmit, resetSuggestedQuestions, width, inputRef]);

    const triggerFileInput = useCallback(() => {
        if (attachments.length >= MAX_IMAGES) {
            showCenterError(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        if (status === 'ready') {
            postSubmitFileInputRef.current?.click();
        } else {
            fileInputRef.current?.click();
        }
    }, [attachments.length, status, fileInputRef]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !isCompositionActive.current) {
            event.preventDefault();
            if (status === 'submitted' || status === 'streaming') {
                showCenterError("Please wait for the response to complete!");
            } else {
                submitForm();
                if (width && width > 768) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            }
        }
    };

    const isProcessing = status === 'submitted' || status === 'streaming';
    const hasInteracted = messages.length > 0;
    const isMobile = width ? width < 768 : false;

    return (
        <div className="flex flex-col w-full">
            <TooltipProvider>
                <div
                    className={cn(
                        "relative w-full flex flex-col gap-1 rounded-lg transition-all duration-300 font-sans!",
                        hasInteracted ? "z-51" : "",
                        isDragging && "ring-1 ring-neutral-300 dark:ring-neutral-700",
                        attachments.length > 0 || uploadQueue.length > 0
                            ? "bg-gray-100/70 dark:bg-neutral-800 p-1"
                            : "bg-transparent"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <AnimatePresence>
                        {isDragging && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 backdrop-blur-[2px] bg-background/80 dark:bg-neutral-900/80 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center z-50 m-2"
                            >
                                <div className="flex items-center gap-4 px-6 py-8">
                                    <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-xs">
                                        <Upload className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Drop images here
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                            Max {MAX_IMAGES} images
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input type="file" className="hidden" ref={fileInputRef} multiple onChange={handleFileChange} accept="image/*" tabIndex={-1} />
                    <input type="file" className="hidden" ref={postSubmitFileInputRef} multiple onChange={handleFileChange} accept="image/*" tabIndex={-1} />

                    {(attachments.length > 0 || uploadQueue.length > 0) && (
                        <div className="flex flex-row gap-2 overflow-x-auto py-2 max-h-28 z-10 px-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                            {attachments.map((attachment, index) => (
                                <AttachmentPreview
                                    key={attachment.url}
                                    attachment={attachment}
                                    onRemove={() => removeAttachment(index)}
                                    isUploading={false}
                                />
                            ))}
                            {uploadQueue.map((filename) => (
                                <AttachmentPreview
                                    key={filename}
                                    attachment={{
                                        url: "",
                                        name: filename,
                                        contentType: "",
                                        size: 0,
                                    } as Attachment}
                                    onRemove={() => { }}
                                    isUploading={true}
                                />
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <div className="relative rounded-lg bg-neutral-100 dark:bg-neutral-900">
                            <Textarea
                                ref={inputRef}
                                placeholder={hasInteracted ? "Ask anything..." : "Ask anything..."}
                                value={input}
                                onChange={handleInput}
                                disabled={isProcessing}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                className={cn(
                                    "w-full rounded-lg resize-none md:text-base!",
                                    "text-base leading-relaxed",
                                    "bg-neutral-100 dark:bg-neutral-900",
                                    "border border-neutral-200! dark:border-neutral-700!",
                                    "focus:border-neutral-300! dark:!focus:!border-neutral-500",
                                    isFocused ? "border-neutral-300! dark:border-neutral-500!" : "",
                                    "text-neutral-900 dark:text-neutral-100",
                                    "focus:ring-0!",
                                    "px-4 py-4 pb-16",
                                    "touch-manipulation",
                                    "whatsize",
                                    "placeholder:cal-sans-regular" // Apply Cal Sans only to placeholder
                                )}
                                style={{
                                    WebkitUserSelect: 'text',
                                    WebkitTouchCallout: 'none',
                                }}
                                rows={1}
                                autoFocus={width ? width > 768 : true}
                                onCompositionStart={() => isCompositionActive.current = true}
                                onCompositionEnd={() => isCompositionActive.current = false}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                            />

                            <div
                                className={cn(
                                    "absolute bottom-0 inset-x-0 flex justify-between items-center p-2 rounded-b-lg",
                                    "bg-neutral-100 dark:bg-neutral-900",
                                    "border-t-0 border-x border-b border-neutral-200! dark:border-neutral-700!",
                                    isFocused ? "border-neutral-300! dark:border-neutral-500!" : "",
                                    isProcessing ? "opacity-20! cursor-not-allowed!" : ""
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-2",
                                        isMobile && "overflow-hidden"
                                    )}
                                    // Use pointer-events-auto to enable interactions without affecting the textarea
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Blur the textarea on toolbar click to hide keyboard
                                        if (isMobile && document.activeElement === inputRef.current) {
                                            inputRef.current?.blur();
                                        }
                                    }}
                                >
                                    {/* New Chat "+" button added here */}
                                    <div className={cn(
                                        "transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                    )}>
                                        {!isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="rounded-full p-1.5 h-8 w-8 bg-transparent border-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            window.location.href = "/";
                                                        }}
                                                        variant="outline"
                                                    >
                                                        <PlusIcon size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">New Chat</span>
                                                        <span className="text-xs text-muted-foreground leading-tight">Start a new conversation</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                className="rounded-full p-1.5 h-8 w-8 bg-transparent border-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    window.location.href = "/";
                                                }}
                                                variant="outline"
                                            >
                                                <PlusIcon size={14} />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Paperclip button moved to the left */}
                                    {hasVisionSupport(selectedModel) && !(isMobile && isGroupSelectorExpanded) && (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="rounded-full p-1.5 h-8 w-8 bg-transparent border-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            triggerFileInput();
                                                        }}
                                                        variant="outline"
                                                        disabled={isProcessing}
                                                    >
                                                        <PaperclipIcon size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">Attach Image</span>
                                                        <span className="text-xs text-muted-foreground leading-tight">Upload an image</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                className="rounded-full p-1.5 h-8 w-8 bg-transparent border-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    triggerFileInput();
                                                }}
                                                variant="outline"
                                                disabled={isProcessing}
                                            >
                                                <PaperclipIcon size={14} />
                                            </Button>
                                        )
                                    )}
                                    
                                    {/* Model Switcher */}
                                    <div className={cn(
                                        "transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                    )}>
                                        <ModelSwitcher
                                            selectedModel={selectedModel}
                                            setSelectedModel={setSelectedModel}
                                            showExperimentalModels={showExperimentalModels}
                                            attachments={attachments}
                                            messages={messages}
                                            status={status}
                                            onModelSelect={(model) => {
                                                // Only change the model, no notification needed
                                            }}
                                        />
                                    </div>

                                    {/* Search button that toggles between web and chat modes */}
                                    <div className={cn(
                                        "transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                    )}>
                                        {!isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            // Toggle search on/off without affecting deep research
                                                            const newMode = selectedGroup === 'web' ? 'chat' : 'web';
                                                            // If turning on web search, turn off deep research
                                                            if (newMode === 'web' && selectedGroup === 'extreme') {
                                                                setSelectedGroup('web');
                                                            } else {
                                                                setSelectedGroup(newMode);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 sm:px-3 h-8",
                                                            "rounded-full transition-all duration-300",
                                                            "border border-neutral-200 dark:border-neutral-800",
                                                            "hover:shadow-md cursor-pointer",
                                                            selectedGroup === 'web'
                                                                ? "bg-blue-500 dark:bg-blue-600 text-white dark:text-white"
                                                                : "bg-white dark:bg-neutral-900 text-neutral-500",
                                                        )}
                                                    >
                                                        <Globe className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:block text-xs font-medium">Search</span>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">Web Search</span>
                                                        <span className="text-xs text-muted-foreground leading-tight">
                                                            {selectedGroup === 'web' ? 'Searching the web' : 'Toggle to search the web'}
                                                        </span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Toggle search on/off without affecting deep research
                                                    const newMode = selectedGroup === 'web' ? 'chat' : 'web';
                                                    // If turning on web search, turn off deep research
                                                    if (newMode === 'web' && selectedGroup === 'extreme') {
                                                        setSelectedGroup('web');
                                                    } else {
                                                        setSelectedGroup(newMode);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                                                    "rounded-full transition-all duration-300",
                                                    "border border-neutral-200 dark:border-neutral-800",
                                                    "hover:shadow-md cursor-pointer",
                                                    selectedGroup === 'web'
                                                        ? "bg-blue-500 dark:bg-blue-600 text-white dark:text-white"
                                                        : "bg-white dark:bg-neutral-900 text-neutral-500",
                                                )}
                                            >
                                                <Globe className="h-3.5 w-3.5" />
                                                <span className="hidden sm:block text-xs font-medium">Search</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Deep Research button */}
                                    <div className={cn(
                                        "transition-all duration-300",
                                        (isMobile && isGroupSelectorExpanded)
                                            ? "opacity-0 invisible w-0"
                                            : "opacity-100 visible w-auto"
                                    )}>
                                        {!isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            // Toggle deep research on/off without affecting web search
                                                            const newMode = selectedGroup === 'extreme' ? 'chat' : 'extreme';
                                                            // If turning on deep research, turn off web search
                                                            if (newMode === 'extreme' && selectedGroup === 'web') {
                                                                setSelectedGroup('extreme');
                                                            } else {
                                                                setSelectedGroup(newMode);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 sm:px-3 h-8",
                                                            "rounded-full transition-all duration-300",
                                                            "border border-neutral-200 dark:border-neutral-800",
                                                            "hover:shadow-md cursor-pointer",
                                                            selectedGroup === 'extreme'
                                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                                : "bg-white dark:bg-neutral-900 text-neutral-500",
                                                        )}
                                                    >
                                                        <BookIcon className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:block text-xs font-medium">Deep Research</span>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">Deep Research Mode</span>
                                                        <span className="text-xs text-muted-foreground leading-tight">Deep research with multiple sources and analysis</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Toggle deep research on/off without affecting web search
                                                    const newMode = selectedGroup === 'extreme' ? 'chat' : 'extreme';
                                                    // If turning on deep research, turn off web search
                                                    if (newMode === 'extreme' && selectedGroup === 'web') {
                                                        setSelectedGroup('extreme');
                                                    } else {
                                                        setSelectedGroup(newMode);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                                                    "rounded-full transition-all duration-300",
                                                    "border border-neutral-200 dark:border-neutral-800",
                                                    "hover:shadow-md cursor-pointer",
                                                    selectedGroup === 'extreme'
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                        : "bg-white dark:bg-neutral-900 text-neutral-500",
                                                )}
                                            >
                                                <BookIcon className="h-3.5 w-3.5" />
                                                <span className="hidden sm:block text-xs font-medium">Deep Research</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Blur the textarea on button container click
                                        if (isMobile && document.activeElement === inputRef.current) {
                                            inputRef.current?.blur();
                                        }
                                    }}
                                >
                                    {/* Add ThemeToggle with round background */}
                                    <ThemeToggle className="rounded-full h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300" />
                                    
                                    {isProcessing ? (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="rounded-full p-1.5 h-8 w-8 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            stop();
                                                        }}
                                                        variant="destructive"
                                                    >
                                                        <StopIcon size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">Stop Generation</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                className="rounded-full p-1.5 h-8 w-8 cursor-pointer"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    stop();
                                                }}
                                                variant="destructive"
                                            >
                                                <StopIcon size={14} />
                                            </Button>
                                        )
                                    ) : (
                                        !isMobile ? (
                                            <Tooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="rounded-full p-1.5 h-8 w-8 cursor-pointer bg-black dark:bg-black text-white dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-800"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            submitForm();
                                                        }}
                                                        disabled={input.length === 0 && attachments.length === 0 || uploadQueue.length > 0 || status !== 'ready'}
                                                    >
                                                        <ArrowUpIcon size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="bottom"
                                                    sideOffset={6}
                                                    className="max-w-[200px]"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-xs">Send</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Button
                                                className="rounded-full p-1.5 h-8 w-8 cursor-pointer bg-black dark:bg-black text-white dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-800"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    submitForm();
                                                }}
                                                disabled={input.length === 0 && attachments.length === 0 || uploadQueue.length > 0 || status !== 'ready'}
                                            >
                                                <ArrowUpIcon size={14} />
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </div>
    );
};

export default FormComponent;
