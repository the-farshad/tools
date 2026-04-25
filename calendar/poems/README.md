# Poems

Mirror of selected Kurdish poems originally collected at
[allekok-poems](https://github.com/allekok/allekok-poems), used per its
public-domain license. Each file preserves the original author header
(`شاعیر`, `کتێب`, `سەرناو`) and a comment with the upstream URL.

The calendar tool fetches a random poem from this directory at runtime.

## Adding a new poem

1. Drop a UTF-8 text file under a poet folder (e.g. `cegerxwin/some-title.txt`).
2. Header lines first (`شاعیر`, `کتێب`, `سەرناو`), blank line, then the body.
3. Add the relative path (e.g. `cegerxwin/some-title.txt`) to `POEM_INDEX`
   in `../calendar.js`.

## Adding an English translation

Edit `translations.json` (sibling of this README). Key by the same
relative path:

```json
{
  "sherko-bekas/11-tenya.txt": "Only the lamp of Kurdishness in hand\nlights the night of my homeland..."
}
```

When a translation exists, the calendar shows it under the original.
When absent, the UI offers a one-click "Translate ↗" link to Google
Translate (Sorani → English).
