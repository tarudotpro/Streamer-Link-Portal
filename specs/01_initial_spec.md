# Streamer Link Portal - 初期仕様書

## 1. プロジェクト概要
- **システム名**: Streamer Link Portal
- **目的**: YouTube, Twitch など複数のプラットフォームにまたがる配信者の活動（アーカイブ、スケジュール）を一元管理するポータルサイト。
- **基本方針**:
    - **動画ホスティングなし**: 管理するのは「リンク」と「メタデータ」のみ。サムネイルクリックでネイティブアプリを直接起動（Deep Link）。
    - **完全サーバーレス**: ユーザーはPCを起動し続ける必要がない。全てクラウド上で完結。
    - **超低コスト & 高スケーラビリティ**: DB読み取りとAPIコールを極小化。CDN/Edgeキャッシュを積極的に活用。

## 2. アーキテクチャ (完全サーバーレス & コスト最適化)
詳細は [ADR 001: 初期アーキテクチャの選定](file:///c:/Users/tarut/project/Streamer%20Link%20Portal/specs/adr/001_initial_architecture.md) を参照。

## 3. ディレクトリ構造 (設計管理)
仕様駆動開発に基づき、`specs/` フォルダ内で以下のように管理する。

- `specs/01_initial_spec.md`: 全体方針（このファイル）
- `specs/features/`: 機能ごとの詳細仕様
- `specs/adr/`: アーキテクチャ決定記録

## 4. 主要機能の仕様
- [ライブ配信自動判別](file:///c:/Users/tarut/project/Streamer%20Link%20Portal/specs/features/live_detection.md)
- [YouTube アカウント連携とデータ取得](file:///c:/Users/tarut/project/Streamer%20Link%20Portal/specs/features/youtube_integration.md)
- [認証・プロフィールフロー](file:///c:/Users/tarut/project/Streamer%20Link%20Portal/specs/features/auth_flow.md)

## 5. ロードマップ
- **Phase 2**: YouTube PubSubHubbub による自動同期 (リアルタイム, サーバーレス)。
- **Phase 3**: マネタイズ (Stripe), カスタムドメイン, 広告表示ロジック。
