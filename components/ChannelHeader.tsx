import Image from 'next/image'

interface ChannelHeaderProps {
    profile: {
        display_name: string | null
        youtube_title: string | null
        youtube_handle: string | null
        youtube_thumbnails: any
        youtube_description: string | null
    }
}

export default function ChannelHeader({ profile }: ChannelHeaderProps) {
    const title = profile.youtube_title || profile.display_name
    const handle = profile.youtube_handle
    const thumbnail = profile.youtube_thumbnails?.high?.url || profile.youtube_thumbnails?.default?.url

    return (
        <header className="flex flex-col items-center text-center py-10 px-4 mb-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
            {thumbnail && (
                <div className="relative w-24 h-24 mb-6 ring-4 ring-purple-500/50 rounded-full overflow-hidden shadow-xl">
                    <Image
                        src={thumbnail}
                        alt={title || 'Channel Thumbnail'}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {title}
            </h1>
            {handle && (
                <p className="text-purple-400 font-medium text-lg mb-4">
                    {handle}
                </p>
            )}
            {profile.youtube_description && (
                <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                    {profile.youtube_description}
                </p>
            )}
        </header>
    )
}
