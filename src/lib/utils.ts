import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (node: Element, params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (style: Record<string, number | string | undefined>): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t
            });
        },
        easing: cubicOut
    };
};

export const getDay = (day: number): string => {
    let day_string = "";

    switch (day) {
        case 0:
            day_string = "Mon";
            break;
        case 1:
            day_string = "Tue";
            break;
        case 2:
            day_string = "Wed";
            break;
        case 3:
            day_string = "Thu";
            break;
        case 4:
            day_string = "Fri";
            break;
        case 5:
            day_string = "Sat";
            break;
        case 6:
            day_string = "Sun";
            break;
    }

    return day_string;
};

export const setDay = (day: string): number => {
    let day_num = 0;

    switch (day) {
        case "Mon":
            day_num = 0;
            break;
        case "Tue":
            day_num = 1;
            break;
        case "Wed":
            day_num = 2;
            break;
        case "Thu":
            day_num = 3;
            break;
        case "Fri":
            day_num = 4;
            break;
        case "Sat":
            day_num = 5;
            break;
        case "Sun":
            day_num = 6;
            break;
    }

    return day_num;
};
