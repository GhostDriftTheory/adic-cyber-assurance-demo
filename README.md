# ADIC Cyber Assurance for Financial AI Execution

This demo shows that AI-generated instructions are not executable authority.

The point is not log monitoring after damage.
The point is an execution gate: ADIC Cyber Assurance verifies the evidence chain before an AI-generated instruction can become a real banking operation.

Core scenario:

```text
Compromised AI Instruction
-> ADIC Execution Gate
-> NOT EXECUTABLE
```

Initial scenario:

```text
Attacker manipulates AI agent
-> AI attempts external account addition
-> AI attempts transfer-limit escalation
-> AI attempts immediate wire transfer
-> ADIC Cyber Assurance blocks execution before any banking-system change occurs
```

Open `index.html` in a browser.

## Main Message

```text
AI-generated instructions are not executable authority.
```

Japanese:

```text
AIが出した指示は、それだけでは実行権限ではない。
証拠チェーンが揃わない限り、銀行操作として実行できない。
```

## Log Monitoring vs ADIC

普通のログ監視・SIEM:

- 実行された後にログを見る
- 異常検知はできても、銀行システム変更を必ず止めるとは限らない
- 「なぜ通ったか」は後から調査になる

ADIC Cyber Assurance:

- 実行前に証拠チェーンを検証する
- 権限・承認・由来・再実行証跡が欠けたら実行不可
- AIの提案を、そのまま銀行操作に変換させない

## Lean Relation

The replay-verification core behind this execution gate is supported by a Lean formal proof.
