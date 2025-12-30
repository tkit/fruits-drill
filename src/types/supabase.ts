export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            drills: {
                Row: {
                    id: string
                    title: string
                    thumbnail_url: string
                    pdf_url: string
                    description: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    thumbnail_url: string
                    pdf_url: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    thumbnail_url?: string
                    pdf_url?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            tags: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
                Relationships: []
            }
            drill_tags: {
                Row: {
                    drill_id: string
                    tag_id: string
                }
                Insert: {
                    drill_id: string
                    tag_id: string
                }
                Update: {
                    drill_id?: string
                    tag_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "drill_tags_drill_id_fkey"
                        columns: ["drill_id"]
                        referencedRelation: "drills"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "drill_tags_tag_id_fkey"
                        columns: ["tag_id"]
                        referencedRelation: "tags"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}