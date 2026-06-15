import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Community Guidelines");

export default function CommunityPage() {
  return (
    <LegalPage title="Community Guidelines" lastUpdated="June 14, 2025">
      <h2>Be Respectful</h2>
      <p>No harassment, hate speech, or targeted attacks.</p>

      <h2>No Spam</h2>
      <p>
        Don&apos;t use hot takes or profiles for self-promotion, links, or
        contact info.
      </p>

      <h2>Play Fair</h2>
      <p>
        No market manipulation, fake accounts, or exploiting bugs for credits or
        items.
      </p>

      <h2>No Impersonation</h2>
      <p>Don&apos;t pretend to be someone else, including public figures.</p>

      <h2>Consequences</h2>
      <p>Warning → mute → ban. Serious violations may skip straight to a ban.</p>

      <h2>Report</h2>
      <p>
        Use the report button on any content. Reports are reviewed by our team.
      </p>
    </LegalPage>
  );
}
