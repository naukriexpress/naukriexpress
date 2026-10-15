import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how NaukriExpress handles contact messages, browser storage, site visits and Google advertising technologies.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>Last updated: 15 October 2026</p>
        <p>
          This Privacy Policy explains how NaukriExpress, operated by BGI
          Cybercafe, handles information when you use this website. We provide
          job and recruitment information and link to official notifications
          and application websites. We are an independent information portal,
          not a government recruitment authority.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Information We Handle
        </h2>
        <p>
          If you contact us, the information you enter in the contact form,
          including your name, email address and message, is sent to our form
          service provider so it can process your submission. Please do not
          send passwords, payment details or other sensitive personal
          information through the contact form.
        </p>
        <p>
          Our website maintains an aggregate visitor counter. The browser uses
          session storage to avoid counting repeated page visits more than once
          in the same browser session. The theme preference is saved in local
          storage so the website can remember your light or dark mode choice.
          These features are not a user account system.
        </p>
        <p>
          Like most websites, requests to our hosting, security and service
          providers may involve technical information such as the requested
          page URL, IP address, browser or device information, and request
          time. Providers handle such information under their own terms and
          privacy notices.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Google Advertising Cookies and Similar Technologies
        </h2>
        <p>
          This website uses Google advertising code for AdSense. If ads are
          served, Google and other third-party vendors or advertising partners
          may use cookies, web beacons, IP addresses, browser storage or similar
          identifiers to deliver ads, measure ad performance, limit fraud and
          abuse, and, where available and permitted by your settings and
          applicable law, personalize advertising.
        </p>
        <p>
          Third-party vendors, including Google, may use cookies to serve ads
          based on a user's prior visits to this website or other websites.
          Google's advertising cookies can allow Google and its partners to
          serve ads based on visits to this site and/or other sites on the
          Internet. The specific vendors and technologies used may depend on
          the advertising settings configured in the relevant Google account.
        </p>
        <p>
          You can manage personalized advertising through{" "}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
          >
            Google Ads Settings
          </a>
          . You can also find information and opt-out choices for participating
          advertising companies at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
          >
            YourAdChoices
          </a>
          . These controls do not necessarily opt you out of all advertising;
          they manage personalized advertising where the relevant provider
          supports that choice.
        </p>
        <p>
          For further details, read{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
          >
            How Google uses information from sites or apps that use its services
          </a>
          . Google and other third parties may set or read cookies or use
          similar technologies as a result of ad serving. You can manage
          browser cookies through your browser settings, though blocking
          certain storage technologies may affect some website features or
          advertising.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Contact Form Provider
        </h2>
        <p>
          Our contact form is submitted through{" "}
          <a
            href="https://formspree.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 underline"
          >
            Formspree
          </a>
          . Information entered into that form is processed by the provider to
          deliver the message. Please review the provider's privacy information
          before submitting a message.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          External Websites
        </h2>
        <p>
          Job listings may link to government departments, recruitment boards,
          employers, scholarship providers and other external websites. Once
          you leave NaukriExpress, the external website's own terms, security
          and privacy practices apply.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Your Choices and Questions
        </h2>
        <p>
          You can change your browser's cookie and storage settings, manage
          advertising preferences using the controls linked above, or contact
          us with a privacy question. Where consent choices are required by
          applicable law or Google publisher requirements, they must also be
          managed through the appropriate consent controls and account
          settings.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">Contact</h2>
        <p>
          For privacy-related questions, use the{" "}
          <a href="/contact" className="text-brand-700 underline">
            Contact Us
          </a>{" "}
          page or email naukriexpress.co.ai@gmail.com.
        </p>
      </div>
    </div>
  );
}
