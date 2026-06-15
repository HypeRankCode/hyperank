import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Privacy Policy");

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 14, 2025">
      <h2>What We Collect</h2>
      <ul>
        <li>Account information (email, username, profile data)</li>
        <li>Activity data (votes, predictions, purchases)</li>
        <li>Device and usage information</li>
        <li>Cookies for authentication and analytics</li>
      </ul>

      <h2>How We Use It</h2>
      <p>
        To operate the service, improve features, ensure safety, and send
        optional notifications you opt into.
      </p>

      <h2>Third Parties</h2>
      <ul>
        <li>Supabase — database and authentication</li>
        <li>Vercel — hosting</li>
        <li>Resend — transactional email</li>
        <li>Google Analytics — usage analytics (with consent)</li>
      </ul>

      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your data by
        contacting us at legal@hyperank.ca.
      </p>

      <h2>Children</h2>
      <p>
        We do not knowingly collect personal information from children under
        13. See our Children&apos;s Privacy Policy for details on users aged
        13–17.
      </p>

      <h2>Retention</h2>
      <p>
        Account data is kept until deletion is requested. Server logs are
        retained for 90 days.
      </p>
    </LegalPage>
  );
}
