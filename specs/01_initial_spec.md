# Streamer Link Portal - 初期仕様書

## 1. プロジェクト概要
- **システム名**: Streamer Link Portal
- **目的**: YouTube, Twitch など複数のプラットフォームにまたがる配信者の活動（アーカイブ、スケジュール）を一元管理するポータルサイト。
- **基本方針**:
    - **動画ホスティングなし**: 管理するのは「リンク」と「メタデータ」のみ。サムネイルクリックでネイティブアプリを直接起動（Deep Link）。
    - **完全サーバーレス**: ユーザーはPCを起動し続ける必要がない。全てクラウド上で完結。
    - **超低コスト & 高スケーラビリティ**: DB読み取りとAPIコールを極小化。CDN/Edgeキャッシュを積極的に活用。

## 2. アーキテクチャ (完全サーバーレス & コスト最適化)

```mermaid
graph TD
    %% ユーザー
    subgraph "Users"
        Streamer[配信者 (管理者)]
        Fan[ファン (視聴者)]
    end

    %% クラウドインフラ (Vercel / Supabase)
    subgraph "Cloud Infrastructure"
        Frontend[Next.js App (Vercel Edge)]
        DB[(Supabase: PostgreSQL)]
        Auth[Supabase Auth]
        Cron[GitHub Actions / Vercel Cron]
        Edge_OGP[Edge Function: OGP取得]
    end

    %% 外部サービス
    subgraph "External"
        YT[YouTube Data API]
        CDN[CDN Cache (Vercel Blob / Edge)]
    end

    %% フロー
    Streamer -->|ログイン/管理| Frontend
    Frontend -->|書き込み| DB
    Fan -->|閲覧 (キャッシュ)| Frontend
    Frontend -.->|読み取り (ISR/Cache)| DB
    
    %% 自動化 (PC不要)
    Cron -->|スケジュール実行| Edge_OGP
    Edge_OGP -->|データ更新| DB
```

### 主要コンポーネント
- **ホスティング**: Vercel (Next.js App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (Google/Discord ソーシャルログイン)
- **自動化**: GitHub Actions または Vercel Cron (PCを起動せずに定期実行するため)

## 3. コスト最適化戦略
1.  **読み取り負荷の最適化**:
    - Next.js の **ISR (Incremental Static Regeneration)** または **Static Export** を使用。
    - ファンがアクセスするページは CDN から静的 HTML/JSON を配信。**読み取り時のDBアクセスは実質ゼロ**。
    - DBクエリはビルド/再検証時（例: 5-10分に1回）および配信者（管理者）の操作時のみ発生。
2.  **API クォータ管理**:
    - YouTube API 呼び出しは Cron ジョブによって制御され、ユーザーのページアクセスでは発生させない。
    - 無料枠内に収まるよう、バッチ処理の頻度を厳密に制限。
3.  **メディア処理**:
    - YouTube/Twitch CDN のサムネイルへ直接リンク（Hotlinking）。自前の画像ストレージコストを回避。

## 4. Phase 1: MVP 機能要件
- [ ] **管理者認証**: Googleログイン (Supabase Auth)。
- [ ] **チャンネル連携**: YouTube チャンネル ID の保存。
- [ ] **手動登録**: URL入力 -> OGP取得 (タイトル/画像) -> DB保存。
- [ ] **公開ページ**: 保存されたリンク/動画の一覧表示。日付順。
    - 並び順: `Upcoming` (予定), `Live` (配信中), `Archive` (過去)。
- [ ] **ディープリンク**: カードクリックで YouTube/Twitch アプリまたはサイトを直接起動。

## 5. データスキーマ (簡易版)
- **profiles** (配信者)
    - id, display_name, youtube_channel_id, theme_color
- **items** (動画/配信/スケジュール)
    - id, streamer_id, title, url, thumbnail_url, start_at, type, status

## 6. 将来のフェーズ (ロードマップ)
- **Phase 2**: YouTube PubSubHubbub による自動同期 (リアルタイム, サーバーレス)。
- **Phase 3**: マネタイズ (Stripe), カスタムドメイン, 広告表示ロジック。
