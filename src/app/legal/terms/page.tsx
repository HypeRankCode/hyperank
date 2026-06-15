import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Terms of Service");

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="June 14, 2025">
      <h2>1. Eligibility</h2>
      <p>
        HypeRank is available to users aged 13 and older. Users under 18 have
        restricted features. Users under 13 may not create an account.
      </p>

      <h2>2. Virtual Credits</h2>
      <p>
        Credits are virtual points with no monetary value. They cannot be
        purchased, redeemed for cash, or transferred outside the platform except
        through in-app trades. HypeRank may modify or discontinue the credit
        system at any time.
      </p>

      <h2>3. User Content</h2>
      <p>
        By posting content on HypeRank, you grant us a non-exclusive license to
        display and distribute that content in connection with the service.
      </p>

      <h2>4. Prohibited Conduct</h2>
      <ul>
        <li>Harassment, hate speech, or targeted attacks</li>
        <li>Spam, scams, or marketplace manipulation</li>
        <li>Impersonation of others</li>
        <li>Cheating or exploiting the platform</li>
      </ul>

      <h2>5. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms or our
        Community Guidelines.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        HypeRank is provided as-is. We are not liable for indirect or
        consequential damages arising from use of the service.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These terms are governed by the laws of the Province of Alberta, Canada.
      </p>
    </LegalPage>
  );
}
