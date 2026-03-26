# SPAM Detection Rules

Threshold: 3

## Indicators

| Name | Pattern | Weight |
|------|---------|--------|
| Advertising link | https?://bit\.ly\|https?://t\.co\|buy now\|click here\|limited offer | 3 |
| Cryptocurrency spam | crypto\|bitcoin\|ethereum\|airdrop\|token sale\|web3 wallet | 2 |
| SEO spam | backlink\|seo service\|rank your\|google ranking\|traffic boost | 3 |
| Gambling | casino\|poker\|betting\|slot machine\|jackpot | 3 |
| Unrelated content | No code references and no technical terms | 1 |
| Excessive links | More than 3 URLs in issue body | 2 |
| Empty or gibberish | Body length less than 10 characters or random characters | 2 |
| Known spam phrases | make money\|work from home\|earn \$\|free gift\|congratulations you won | 3 |
