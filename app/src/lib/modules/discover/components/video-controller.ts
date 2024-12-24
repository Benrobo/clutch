import type { Highlight } from '@/types/highlights';
import { cn } from '@/utils';

export type VideoState = {
    isInitialLoading: boolean;
    isBuffering: boolean;
    isPaused: boolean;
    isPlaying: boolean;
};

export class VideoController {
    private videoElement: HTMLVideoElement | null = null;
    private observer: IntersectionObserver | null = null;
    private containerRef: HTMLDivElement | null = null;
    private state: VideoState = {
        isInitialLoading: true,
        isBuffering: false,
        isPaused: true,
        isPlaying: false
    };

    constructor(highlight: Highlight | null) {}

    get loadingState() {
        const { isInitialLoading, isBuffering, isPaused, isPlaying } = this.state;
        
        return {
            ...this.state,
            showSpinner: isInitialLoading || isBuffering,
            hideVideo: isInitialLoading,
            showPlayButton: !isInitialLoading,
            showBufferingOverlay: isBuffering && !isInitialLoading,
            overlayClasses: cn(
                'absolute inset-0 z-[3] flex-center',
                isBuffering && !isInitialLoading && 'bg-dark-103/30 backdrop-blur-sm'
            ),
            videoClasses: cn('w-full h-auto object-cover', isInitialLoading ? 'hidden' : 'block')
        };
    }

    initialize(videoElement: HTMLVideoElement, containerRef: HTMLDivElement) {
        this.videoElement = videoElement;
        this.containerRef = containerRef;
        this.setupIntersectionObserver();
    }

    private setupIntersectionObserver() {
        this.observer = new IntersectionObserver(this.handleVisibilityChange.bind(this), {
            threshold: 0.7
        });

        if (this.containerRef) {
            this.observer.observe(this.containerRef);
        }
    }

    private handleVisibilityChange(entries: IntersectionObserverEntry[]) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (this.videoElement && this.state.isPaused) {
                    this.play();
                }
            } else {
                if (this.videoElement && !this.state.isPaused) {
                    this.pause();
                }
            }
        });
    }

    handleLoadStart = () => {
        this.state.isInitialLoading = true;
        this.state.isBuffering = false;
    };

    handleCanPlay = () => {
        this.state.isInitialLoading = false;
        this.state.isBuffering = false;
    };

    handleWaiting = () => {
        this.state.isBuffering = true;
    };

    handlePlaying = () => {
        this.state.isInitialLoading = false;
        this.state.isBuffering = false;
    };

    togglePlayPause = () => {
        if (this.state.isPaused) {
            this.play();
        } else {
            this.pause();
        }
    };

    private play() {
        if (this.videoElement) {
            this.videoElement.play();
            this.state.isPaused = false;
            this.state.isPlaying = true;
        }
    }

    private pause() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.state.isPaused = true;
            this.state.isPlaying = false;
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
