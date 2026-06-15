import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("Cookie Policy");

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="June 14, 2025">
      <h2>Essential Cookies</h2>
      <p>
        Required for authentication and core functionality. These cannot be
        disabled.
      </p>

      <h2>Analytics Cookies</h2>
      <p>
        Google Analytics helps us understand how the site is used. These only
        load if you accept all cookies in the banner.
      </p>

      <h2>Advertising Cookies</h2>
      <p>
        If Google AdSense is enabled, advertising cookies may be used. You can
        opt out via your browser settings or by choosing &quot;Essential
        Only&quot; in our cookie banner.
      </p>

      <h2>Managing Cookies</h2>
      <p>
        Clear cookies in your browser settings or use the cookie banner on your
        next visit to change your preference.
      </p>
    </LegalPage>
  );
}
