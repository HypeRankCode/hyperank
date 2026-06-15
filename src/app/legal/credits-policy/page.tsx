import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Virtual Credits Policy");

export default function CreditsPolicyPage() {
  return (
    <LegalPage title="Virtual Credits Policy" lastUpdated="June 14, 2025">
      <p>
        HypeRank Credits (&quot;Credits&quot;) are a virtual points system used
        solely within HypeRank.
      </p>

      <h2>Credits:</h2>
      <ul>
        <li>Have NO monetary value</li>
        <li>CANNOT be purchased with real money</li>
        <li>
          CANNOT be converted or redeemed for real money, gift cards, or any
          real-world value
        </li>
        <li>
          Are awarded for activity on the platform (voting, streaks,
          predictions)
        </li>
        <li>May be used to acquire cosmetic items within HypeRank</li>
        <li>
          Are non-transferable except through the in-platform trade system
        </li>
        <li>
          May be modified, reset, or discontinued at HypeRank&apos;s sole
          discretion
        </li>
        <li>Are not an investment and do not represent any ownership interest</li>
      </ul>

      <p>
        The Credits system is for entertainment purposes only. Cosmetic items
        acquired with Credits are virtual goods with no real-world value.
      </p>
    </LegalPage>
  );
}
