"use client";

import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const sections = [
    {
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect personal information you provide directly to us, such as when you create an account, make transactions, or contact us for support. This may include your name, email address, phone number, and payment information.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our platform, including your IP address, browser type, device information, and usage patterns. This helps us improve our services and ensure security.",
        },
        {
          subtitle: "Blockchain Data",
          text: "When you interact with blockchain networks through our platform, certain transaction data becomes publicly available on the blockchain. We may collect and analyze this data to provide our services.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our trading platform, process transactions, and provide customer support.",
        },
        {
          subtitle: "Security and Compliance",
          text: "We use your information to detect and prevent fraud, comply with legal obligations, and ensure the security of our platform and users.",
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you important updates about your account, security alerts, and promotional communications (which you can opt out of).",
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our platform is used and to identify areas for improvement and new features.",
        },
      ],
    },
    {
      title: "Information Sharing",
      content: [
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who help us operate our platform, such as payment processors, cloud hosting providers, and analytics services.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, regulation, or legal process, or if we believe disclosure is necessary to protect our rights or the safety of our users.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to applicable privacy laws.",
        },
        {
          subtitle: "Consent",
          text: "We may share your information with your explicit consent or at your direction, such as when you choose to connect third-party services to your account.",
        },
      ],
    },
    {
      title: "Data Security",
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement industry-standard security measures to protect your personal information, including encryption, secure data transmission, and access controls.",
        },
        {
          subtitle: "Incident Response",
          text: "In the event of a security incident, we have procedures in place to respond quickly and notify affected users as required by law.",
        },
        {
          subtitle: "Data Minimization",
          text: "We collect and retain only the information necessary to provide our services and comply with legal obligations.",
        },
      ],
    },
    {
      title: "Your Rights and Choices",
      content: [
        {
          subtitle: "Access and Correction",
          text: "You have the right to access, update, or correct your personal information. You can do this through your account settings or by contacting us.",
        },
        {
          subtitle: "Data Deletion",
          text: "You may request deletion of your personal information, subject to certain exceptions for legal compliance and security purposes.",
        },
        {
          subtitle: "Communication Preferences",
          text: "You can opt out of promotional communications at any time by following the unsubscribe instructions or updating your preferences.",
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to receive a copy of your personal information in a structured, machine-readable format.",
        },
      ],
    },
    {
      title: "International Transfers",
      content: [
        {
          subtitle: "Global Operations",
          text: "As a global platform, we may transfer your information to countries outside your jurisdiction. We ensure appropriate safeguards are in place to protect your information.",
        },
        {
          subtitle: "Adequacy Decisions",
          text: "We comply with applicable laws regarding international data transfers, including EU adequacy decisions and other approved mechanisms.",
        },
      ],
    },
    {
      title: "Retention and Deletion",
      content: [
        {
          subtitle: "Retention Periods",
          text: "We retain your personal information for as long as necessary to provide our services, comply with legal obligations, and resolve disputes.",
        },
        {
          subtitle: "Automated Deletion",
          text: "We have automated processes to delete certain information after specified retention periods, unless longer retention is required by law.",
        },
      ],
    },
    {
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Age Restrictions",
          text: "Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18.",
        },
        {
          subtitle: "Parental Notice",
          text: "If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly.",
        },
      ],
    },
    {
      title: "Changes to This Policy",
      content: [
        {
          subtitle: "Policy Updates",
          text: "We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. We will notify you of material changes.",
        },
        {
          subtitle: "Effective Date",
          text: "Any changes to this policy will be effective when posted on our website, with the updated effective date indicated at the top of the policy.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Privacy Policy"
        subtitle="How we protect and handle your personal information"
        description="Last updated: January 1, 2025"
        size="default"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At AbuBeast, we are committed to protecting your privacy and
              handling your personal information with care and respect. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform and services.
            </p>
            <p className="text-muted-foreground">
              By using our platform, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </motion.div>

          {sections.map((section, index) => (
            <motion.section key={index} variants={fadeInUp}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-muted/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {item.subtitle}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          <motion.section
            variants={fadeInUp}
            className="bg-primary/5 rounded-2xl p-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Contact Us
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <div className="bg-background rounded-lg p-4 space-y-2">
                <p>
                  <strong>Email:</strong> privacy@abubeast.com
                </p>
                <p>
                  <strong>Address:</strong> AbuBeast Privacy Team, 123
                  Blockchain Avenue, Crypto City, CC 12345
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
              <p className="text-sm">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
