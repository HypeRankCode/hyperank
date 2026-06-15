import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Children's Privacy");

export default function CoppaPage() {
  return (
    <LegalPage title="Children's Privacy (COPPA)" lastUpdated="June 14, 2025">
      <p>
        HypeRank is not directed at children under 13. We do not knowingly
        collect personal information from children under 13.
      </p>

      <h2>Under 13</h2>
      <p>
        If you are under 13, you may not create an account or use HypeRank.
      </p>

      <h2>Ages 13–17</h2>
      <p>
        Users aged 13–17 have restricted features: private profiles by default,
        no social media linking, no freeform bio, and parental consent required
        for account activation.
      </p>

      <h2>Parents</h2>
      <p>
        If you believe your child under 13 has registered, contact us at
        legal@hyperank.ca and we will delete the account.
      </p>
    </LegalPage>
  );
}
