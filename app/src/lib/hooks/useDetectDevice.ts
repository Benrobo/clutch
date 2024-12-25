import { browser } from '$app/environment';
import DeviceDetector from "device-detector-js";

export default function useDetectDevice() {
    if (!browser) return { isSafari: false, isMobile: false };

    const ua = navigator.userAgent.toLowerCase();
    
    const detector = new DeviceDetector();
    const result = detector.parse(ua);
    
    return result;
}
