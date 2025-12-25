/**
 * YouTube の各種形式の URL からチャンネル情報を特定・抽出する
 */
export async function getChannelIdFromUrl(url: string) {
    if (!url) return null

    // 1. すでに ID (UC...) が入力されている場合
    if (url.startsWith('UC') && url.length === 24) {
        return url
    }

    try {
        const API_KEY = process.env.YOUTUBE_API_KEY
        if (!API_KEY) return null

        // 2. ハンドル名 URL (@username) の場合
        const handleMatch = url.match(/youtube\.com\/@([^/?#]+)/)
        if (handleMatch) {
            const handle = handleMatch[1]
            // ハンドル名（forHandle）からチャンネル情報を取得する
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
            )
            const data = await response.json()
            return data.items?.[0]?.id || null
        }

        // 3. チャンネル ID URL (youtube.com/channel/UC...) の場合
        const idMatch = url.match(/youtube\.com\/channel\/(UC[^/?#]+)/)
        if (idMatch) {
            return idMatch[1]
        }

        // 4. カスタム URL (youtube.com/c/...) または旧形式
        // ※ v3 API では forHandle 以外は特定が難しいため、可能な範囲で対応
    } catch (error) {
        console.error('Error resolving YouTube URL:', error)
    }

    return null
}

/**
 * YouTube チャンネルの公開情報を取得する
 */
export async function getYouTubeChannelInfo(identifier: string) {
    if (!identifier) return null

    try {
        const API_KEY = process.env.YOUTUBE_API_KEY
        if (!API_KEY) return null

        // 入力が URL の場合は ID に変換を試みる
        let channelId = identifier
        if (identifier.includes('youtube.com')) {
            const resolvedId = await getChannelIdFromUrl(identifier)
            if (!resolvedId) return null
            channelId = resolvedId
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
        )

        if (!response.ok) return null

        const data = await response.json()
        if (!data.items || data.items.length === 0) return null

        const snippet = data.items[0].snippet
        return {
            id: channelId,
            title: snippet.title,
            description: snippet.description,
            customUrl: snippet.customUrl,
            thumbnails: snippet.thumbnails,
        }
    } catch (error) {
        console.error('Error fetching YouTube channel info:', error)
        return null
    }
}
