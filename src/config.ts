// Central contact & booking links.
//
// These are referenced from src/data/resume.json as {{TOKEN}} placeholders and
// expanded at build time by resolve() in src/render.ts, so each value lives in
// exactly one place. The booking link and the techwork mailbox run through
// techwork data GmbH; the direct address is Fabian's own.

export const LINKS: Record<string, string> = {
  BOOKING_URL:
    "https://outlook.office.com/bookwithme/user/deba24cc076b480db02907a33127b272@techwork.at?anonymous&ismsaljsauthenabled&ep=plink",
  EMAIL_DIRECT: "fabian@stei-ner.net",
  EMAIL_TECHWORK: "f.steiner@techwork.at",
  PHONE: "+43 681 10892683",
};
