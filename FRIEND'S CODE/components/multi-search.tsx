// /components/multi-search.tsx
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Calendar, ImageIcon, X, ChevronLeft, ChevronRight, Check, Filter, Sparkles, RotateCcw, Database, Share2, Bookmark, Eye, Loader2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchImage = {
    url: string;
    description: string;
};

type SearchResult = {
    url: string;
    title: string;
    content: string;
    raw_content: string;
    published_date?: string;
};

type SearchQueryResult = {
    query: string;
    results: SearchResult[];
    images: SearchImage[];
};

type MultiSearchResponse = {
    searches: SearchQueryResult[];
};

type MultiSearchArgs = {
    queries: string[];
    maxResults: number[];
    topics: ("general" | "news")[];
    searchDepth: ("basic" | "advanced")[];
};

type QueryCompletion = {
    type: 'query_completion';
    data: {
        query: string;
        index: number;
        total: number;
        status: 'completed';
        resultsCount: number;
        imagesCount: number;
    };
};

const PREVIEW_IMAGE_COUNT = {
    MOBILE: 3,
    DESKTOP: 6
};

// Loading state component
const SearchLoadingState = ({ 
    queries,
    annotations 
}: { 
    queries: string[];
    annotations: QueryCompletion[];
}) => {
    const totalResults = annotations.reduce((sum, a) => sum + a.data.resultsCount, 0);

    return (
        <div className="w-full rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                        <Database className="h-4 w-4 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Intelligence Engine</h2>
                        <p className="text-xs text-indigo-300">Processing search data...</p>
                    </div>
                </div>
                <Badge
                    className="bg-indigo-500/20 text-indigo-200 border-none px-2.5 py-1 rounded-lg"
                >
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse mr-1.5"></div>
                    Searching
                </Badge>
            </div>

            {/* Query badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {queries.map((query, i) => {
                    const annotation = annotations.find(a => a.data.query === query);
                    return (
                        <Badge
                            key={i}
                            className={cn(
                                "px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5",
                                annotation 
                                    ? "bg-indigo-500/40 text-indigo-100" 
                                    : "bg-slate-800/80 text-slate-300"
                            )}
                        >
                            {annotation ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            )}
                            {query}
                        </Badge>
                    );
                })}
            </div>

            {/* Loading card skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {[...Array(3)].map((_, i) => (
                    <div 
                        key={i}
                        className="p-3 rounded-lg bg-slate-800/50 backdrop-blur border border-slate-700/50"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-md bg-slate-700/70 animate-pulse" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-slate-700/70 rounded-md animate-pulse w-3/4" />
                                <div className="h-2 bg-slate-700/70 rounded-md animate-pulse w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-2">
                            <div className="h-2 bg-slate-700/70 rounded-md animate-pulse w-full" />
                            <div className="h-2 bg-slate-700/70 rounded-md animate-pulse w-5/6" />
                            <div className="h-2 bg-slate-700/70 rounded-md animate-pulse w-4/6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Image skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "aspect-video rounded-lg bg-slate-800/70 animate-pulse",
                            i === 0 && "md:row-span-2 md:col-span-2"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

const ResultCard = ({ result }: { result: SearchResult }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                        {!imageLoaded && (
                            <div className="absolute inset-0 animate-pulse bg-slate-700" />
                        )}
                        <img
                            src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(result.url).hostname}`}
                            alt=""
                            className={cn(
                                "w-6 h-6 object-contain",
                                !imageLoaded && "opacity-0"
                            )}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                setImageLoaded(true);
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='16'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E";
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white line-clamp-1">{result.title}</h3>
                        <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 truncate transition-colors"
                        >
                            {new URL(result.url).hostname}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                    </div>
                </div>

                <p className="text-sm text-slate-300 line-clamp-3 mb-3 group-hover:text-white transition-colors">
                    {result.content}
                </p>

                {result.published_date && (
                    <div className="pt-2 border-t border-slate-700/50">
                        <time className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {new Date(result.published_date).toLocaleDateString()}
                        </time>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ImageGridProps {
    images: SearchImage[];
    showAll?: boolean;
}

const ImageGrid = ({ images, showAll = false }: ImageGridProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [imageLoaded, setImageLoaded] = React.useState<Record<number, boolean>>({});

    const displayImages = showAll 
        ? images 
        : images.slice(0, isDesktop ? PREVIEW_IMAGE_COUNT.DESKTOP : PREVIEW_IMAGE_COUNT.MOBILE);
    const hasMore = images.length > (isDesktop ? PREVIEW_IMAGE_COUNT.DESKTOP : PREVIEW_IMAGE_COUNT.MOBILE);

    const handleImageLoad = (index: number) => {
        setImageLoaded(prev => ({ ...prev, [index]: true }));
    };

    return (
        <div>
            <div className={cn(
                "grid gap-3",
                // Mobile layout
                "grid-cols-2",
                displayImages.length === 1 && "grid-cols-1",
                // Tablet layout
                "md:grid-cols-3",
                // Desktop layout
                "lg:grid-cols-3",
                // Reduced height with aspect ratio
                "auto-rows-[180px]",
                // First image larger on desktop
                displayImages.length > 1 && "md:[&>*:first-child]:row-span-2 md:[&>*:first-child]:col-span-2",
                displayImages.length === 1 && "[&>*:first-child]:col-span-full"
            )}>
                {displayImages.map((image, index) => (
                    <motion.button
                        key={index}
                        className={cn(
                            "relative rounded-lg overflow-hidden group",
                            "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 focus:ring-offset-slate-900",
                            "transition-all duration-200",
                            "bg-slate-800",
                            !imageLoaded[index] && "animate-pulse"
                        )}
                        onClick={() => {
                            setSelectedImage(index);
                            setIsOpen(true);
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        {!imageLoaded[index] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-slate-500" />
                            </div>
                        )}
                        <img
                            src={image.url}
                            alt={image.description || ""}
                            className={cn(
                                "w-full h-full object-cover",
                                "transition-all duration-300",
                                "group-hover:scale-105",
                                !imageLoaded[index] && "opacity-0"
                            )}
                            onLoad={() => handleImageLoad(index)}
                            onError={() => handleImageLoad(index)}
                        />
                        {image.description && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex items-end">
                                <p className="text-sm text-white line-clamp-2 w-full">{image.description}</p>
                            </div>
                        )}
                        {!showAll && hasMore && index === displayImages.length - 1 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Badge
                                    className={cn(
                                        "px-3 py-1.5",
                                        "bg-black/80 hover:bg-black/90",
                                        "backdrop-blur-sm",
                                        "border border-white/20",
                                        "transition-colors",
                                        "text-sm font-medium text-white"
                                    )}
                                >
                                    +{images.length - displayImages.length} more
                                </Badge>
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {isDesktop ? (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-5xl w-[90vw] h-[70vh] p-0 overflow-hidden border-none shadow-2xl bg-slate-900/95 backdrop-blur-xl rounded-xl [&>button]:hidden">
                        <div className="relative w-full h-full overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
                                <Badge className="px-3 py-1.5 bg-slate-800/90 text-slate-200 border border-slate-700">
                                    <span className="text-sm font-normal">
                                        {selectedImage + 1} of {images.length}
                                    </span>
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center p-10 mt-[50px] mb-[50px]">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImage}
                                        src={images[selectedImage].url}
                                        alt={images[selectedImage].description || ""}
                                        className="max-w-full max-h-full object-contain"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </AnimatePresence>
                            </div>

                            <Button
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-slate-800/70 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700"
                                onClick={() => {
                                    setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                                }}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-slate-800/70 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700"
                                onClick={() => {
                                    setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                                }}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>

                            {images[selectedImage].description && (
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-700">
                                    <p className="text-sm text-slate-200 max-w-[90%] mx-auto text-center">
                                        {images[selectedImage].description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerContent className="p-0 max-h-[85vh] h-[85vh] border-t border-slate-700 rounded-t-xl bg-slate-900">
                        <div className="relative w-full h-full overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
                                <Badge className="px-3 py-1.5 bg-slate-800/90 text-slate-200 border border-slate-700">
                                    <span className="text-sm font-normal">
                                        {selectedImage + 1} of {images.length}
                                    </span>
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-slate-800/90 border-slate-700 text-slate-300"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center p-8 mt-[50px] mb-[50px]">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImage}
                                        src={images[selectedImage].url}
                                        alt={images[selectedImage].description || ""}
                                        className="max-w-full max-h-full object-contain"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </AnimatePresence>
                            </div>

                            <Button
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-slate-800/70 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700"
                                onClick={() => {
                                    setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
                                }}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-slate-800/70 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700"
                                onClick={() => {
                                    setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
                                }}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>

                            {images[selectedImage].description && (
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-700">
                                    <p className="text-sm text-slate-200 max-w-[90%] mx-auto text-center">
                                        {images[selectedImage].description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </div>
    );
};

const MultiSearch: React.FC<{ 
    result: MultiSearchResponse | null; 
    args: MultiSearchArgs;
    annotations?: QueryCompletion[];
    isSearching?: boolean;
}> = ({
    result,
    args,
    annotations = [],
    isSearching = false
}) => {
    // State to control visibility of search panel
    const [isVisible, setIsVisible] = useState(false);

    // Collect all images from all searches
    const allImages = result?.searches.reduce<SearchImage[]>((acc, search) => {
        return [...acc, ...search.images];
    }, []) || [];

    const totalResults = result?.searches.reduce((sum, search) => sum + search.results.length, 0) || 0;

    // Toggle search panel visibility
    const toggleVisibility = () => {
        setIsVisible(prev => !prev);
    };

    // Check if we're in any kind of loading state
    const isInSearchingState = isSearching || !result;

    // Button text based on search state
    const getButtonContent = () => {
        if (isInSearchingState) {
            return (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span>Searching the web...</span>
                </div>
            );
        } else if (isVisible) {
            return (
                <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-slate-500" />
                    <span>Hide Search Results</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-indigo-500" />
                    <span>Show Search Results</span>
                </div>
            );
        }
    };

    return (
        <div className="w-full space-y-2">
            {/* Toggle button - at the top of AI message */}
            <Button 
                onClick={isInSearchingState ? undefined : toggleVisibility}
                variant="ghost"
                size="sm"
                disabled={isInSearchingState}
                className="w-full justify-start rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
                {getButtonContent()}
            </Button>

            {/* Search panel - only show if explicitly visible, not during searching */}
            <AnimatePresence>
                {isVisible && !isInSearchingState && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full z-10"
                    >
                        <div className="w-full rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 shadow-2xl border border-indigo-500/20 overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-indigo-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-white">Search Results</h2>
                                        <p className="text-xs text-indigo-300">Advanced search results</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 border-indigo-700/30 bg-indigo-950/50 text-indigo-300 hover:text-white"
                                    onClick={() => setIsVisible(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="max-h-[70vh] overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-indigo-900">
                                {!result ? (
                                    <SearchLoadingState queries={args.queries} annotations={annotations} />
                                ) : (
                                    <div className="p-5 space-y-5">
                                        {/* Summary */}
                                        <div className="bg-indigo-950/30 border border-indigo-700/20 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border-none">
                                                    <Search className="h-3 w-3 mr-1.5" />
                                                    {totalResults} Results
                                                </Badge>
                                                <Badge className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border-none">
                                                    <ImageIcon className="h-3 w-3 mr-1.5" />
                                                    {allImages.length} Images
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.searches.map((search, i) => (
                                                    <Badge
                                                        key={i}
                                                        className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
                                                    >
                                                        <Search className="h-3 w-3 mr-1.5" />
                                                        {search.query}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <Tabs defaultValue="all" className="w-full">
                                            <TabsList className="w-full justify-start bg-slate-900 p-1 rounded-lg mb-4">
                                                <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">
                                                    All Results
                                                </TabsTrigger>
                                                <TabsTrigger value="web" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">
                                                    Web
                                                </TabsTrigger>
                                                <TabsTrigger value="images" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">
                                                    Images
                                                </TabsTrigger>
                                                <TabsTrigger value="analyze" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">
                                                    Analysis
                                                </TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="all" className="space-y-5 mt-0">
                                                {/* Web results */}
                                                <div className="space-y-4">
                                                    <h3 className="font-medium text-white flex items-center gap-2">
                                                        <Search className="h-4 w-4 text-indigo-400" />
                                                        Web Results
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                        {result.searches.map(search =>
                                                            search.results.slice(0, 4).map((result, resultIndex) => (
                                                                <motion.div
                                                                    key={`${search.query}-${resultIndex}`}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ duration: 0.3, delay: resultIndex * 0.05 }}
                                                                >
                                                                    <ResultCard result={result} />
                                                                </motion.div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Images section */}
                                                {allImages.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h3 className="font-medium text-white flex items-center gap-2">
                                                            <ImageIcon className="h-4 w-4 text-indigo-400" />
                                                            Images
                                                        </h3>
                                                        <ImageGrid images={allImages} />
                                                    </div>
                                                )}
                                            </TabsContent>
                                            
                                            <TabsContent value="web" className="space-y-4 mt-0">
                                                <h3 className="font-medium text-white">All Web Results</h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {result.searches.map(search =>
                                                        search.results.map((result, resultIndex) => (
                                                            <motion.div
                                                                key={`${search.query}-${resultIndex}`}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3, delay: resultIndex * 0.05 }}
                                                            >
                                                                <ResultCard result={result} />
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="images" className="mt-0">
                                                <h3 className="font-medium text-white mb-4">All Images</h3>
                                                {allImages.length > 0 && <ImageGrid images={allImages} showAll={true} />}
                                            </TabsContent>
                                            
                                            <TabsContent value="analyze" className="mt-0">
                                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5">
                                                    <h3 className="font-medium text-white text-center mb-4">Analysis</h3>
                                                    <p className="text-slate-300 text-sm mb-4">
                                                        Key insights generated from your search queries related to presidential information.
                                                    </p>
                                                    <div className="space-y-4">
                                                        {result.searches.map((search, index) => (
                                                            <div key={index} className="p-3 bg-slate-900/70 rounded-lg border border-slate-700/30">
                                                                <h4 className="text-indigo-300 font-medium mb-2">{search.query}</h4>
                                                                <p className="text-sm text-slate-300">
                                                                    Found {search.results.length} relevant web results and {search.images.length} related images.
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MultiSearch;
