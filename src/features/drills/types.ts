export type Drill = {
    id: string;
    title: string;
    thumbnail: {
        url: string;
        height?: number;
        width?: number;
    };
    pdf: string; // URL string
    tags?: string[];
    description?: string;
    publishedAt?: string;
    revisedAt?: string;
};

export type Tag = string;

