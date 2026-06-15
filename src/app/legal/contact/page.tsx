import { LegalPage, legalMetadata } from "@/components/LegalPage";
import Link from "next/link";

export const metadata = legalMetadata("Contact");

export default function ContactPage() {
  return (
    <LegalPage title="Contact" lastUpdated="June 14, 2025">
      <h2>General</h2>
      <p>
        Email:{" "}
        <a href="mailto:legal@hyperank.ca" className="text-hype">
          legal@hyperank.ca
        </a>
      </p>

      <h2>Legal & Privacy</h2>
      <p>
        For privacy requests, DMCA notices, or legal inquiries, use the same
        address with a clear subject line.
      </p>

      <h2>Brand Partnerships</h2>
      <p>
        Interested in sponsoring trends or battles? See our{" "}
        <Link href="/brand" className="text-hype">
          brand page
        </Link>
        .
      </p>
    </LegalPage>
  );
}
