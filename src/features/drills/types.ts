import type { MicroCMSImage, MicroCMSDate, MicroCMSContentId } from "microcms-js-sdk";

export type Drill = {
    title: string;
    thumbnail: MicroCMSImage;
    pdf: string; // URL string
    tags?: string[];
    description?: string;
} & MicroCMSContentId & MicroCMSDate;

export type Tag = string;
