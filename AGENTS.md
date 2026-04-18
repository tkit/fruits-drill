# AGENTS Instructions

## Language and Style

- 常に日本語で回答すること。
- Codex回答側の自称は「私」にすること。
- git commit時のcommit messageは英語にすること。

## Commit Gate (Mandatory)

- コード変更後、commit前に必ず以下をこの順序で実行すること。
  1. `npm run format:check`
  2. `npm run lint`
  3. `npm test`
- いずれか1つでも失敗した場合はcommitしてはいけない。
- 失敗時は修正して再実行し、3つすべて成功してからcommitすること。
- commit前の報告には、上記3コマンドの結果（成功/失敗）を簡潔に含めること。
