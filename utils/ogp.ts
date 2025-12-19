import * as cheerio from 'cheerio'

export interface OGPData {
    title: string
    image: string | null
    url: string
}

/**
 * 指定されたURLからOGPデータを取得
 */
export async function fetchOGP(url: string): Promise<OGPData> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; StreamerLinkPortal/1.0)',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // OGPタグから情報を取得
        const title =
            $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            'タイトルなし'

        const image =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            null

        return {
            title: title.trim(),
            image,
            url,
        }
    } catch (error) {
        console.error('OGP取得エラー:', error)
        throw new Error('OGPデータの取得に失敗しました')
    }
}
