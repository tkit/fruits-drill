---
trigger: always_on
---

# 行動ルール
- typescriptのコードを変更する作業の最後には、必ず以下の手順を実行し、エラーがない状態にしてください。
  1. `npm test`
  2. `npm run lint`
- 全ての問題が解消されたら、最後に `npm run format` を実行してください。
