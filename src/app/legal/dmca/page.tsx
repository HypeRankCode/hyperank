import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("DMCA Policy");

export default function DmcaPage() {
  return (
    <LegalPage title="DMCA / Copyright Policy" lastUpdated="June 14, 2025">
      <p>
        HypeRank respects intellectual property rights. If you believe content
        on our platform infringes your copyright, send a notice to:
      </p>
      <p>
        <strong>legal@hyperank.ca</strong>
      </p>

      <h2>Your notice must include:</h2>
      <ul>
        <li>Identification of the copyrighted work</li>
        <li>Identification of the infringing material and its location</li>
        <li>Your contact information</li>
        <li>
          A statement of good faith belief that use is not authorized
        </li>
        <li>
          A statement that the information is accurate and you are authorized to
          act
        </li>
        <li>Your physical or electronic signature</li>
      </ul>

      <p>
        We will review and remove infringing content where appropriate. Repeat
        infringers may have their accounts terminated.
      </p>
    </LegalPage>
  );
}
