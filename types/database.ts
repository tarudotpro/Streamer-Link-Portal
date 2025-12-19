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
            profiles: {
                Row: {
                    id: string
                    display_name: string
                    youtube_channel_id: string | null
                    theme_color: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    display_name: string
                    youtube_channel_id?: string | null
                    theme_color?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string
                    youtube_channel_id?: string | null
                    theme_color?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            items: {
                Row: {
                    id: string
                    streamer_id: string
                    title: string
                    url: string
                    thumbnail_url: string | null
                    start_at: string
                    type: 'VIDEO' | 'LIVE_STREAM' | 'LIVE_ARCHIVE' | 'OTHER'
                    status: 'UPCOMING' | 'LIVE' | 'ENDED'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    streamer_id: string
                    title: string
                    url: string
                    thumbnail_url?: string | null
                    start_at: string
                    type: 'VIDEO' | 'LIVE_STREAM' | 'LIVE_ARCHIVE' | 'OTHER'
                    status: 'UPCOMING' | 'LIVE' | 'ENDED'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    streamer_id?: string
                    title?: string
                    url?: string
                    thumbnail_url?: string | null
                    start_at?: string
                    type?: 'VIDEO' | 'LIVE_STREAM' | 'LIVE_ARCHIVE' | 'OTHER'
                    status?: 'UPCOMING' | 'LIVE' | 'ENDED'
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
