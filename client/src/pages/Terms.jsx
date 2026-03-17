import { useTranslation } from 'react-i18next'
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const Terms = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <FileText className="w-16 h-16 text-3play-accent mx-auto" />
        <h1 className="text-3xl font-bold text-white">
          {t('terms.title', 'Terms of Service')}
        </h1>
        <p className="text-3play-text-secondary">
          {t('terms.lastUpdated', 'Last updated: {{date}}', { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      {/* Introduction */}
      <div className="bg-3play-card rounded-xl p-6">
        <p className="text-3play-text-secondary leading-relaxed">
          {t('terms.introduction', 'Welcome to 3Play. By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.')}
        </p>
      </div>

      {/* Section 1 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-3play-accent/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-3play-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t('terms.accountsTitle', '1. Accounts')}</h2>
        </div>
        <div className="text-3play-text-secondary leading-relaxed space-y-2">
          <p>{t('terms.accountsText1', 'When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.')}</p>
          <p>{t('terms.accountsText2', 'You are responsible for safeguarding the password that you use to access the platform and for any activities or actions under your password. You agree not to disclose your password to any third party.')}</p>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-3play-accent/20 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-3play-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t('terms.contentTitle', '2. Content')}</h2>
        </div>
        <div className="text-3play-text-secondary leading-relaxed space-y-2">
          <p>{t('terms.contentText1', 'You retain ownership of any content you upload to 3Play. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of operating and improving our platform.')}</p>
          <p>{t('terms.contentText2', 'You may not upload content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. We reserve the right to remove any content that violates these terms.')}</p>
        </div>
      </div>

      {/* Section 3 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-3play-accent/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-3play-accent" />
          </div>
          <h2 className="text-xl font-semibold text-white">{t('terms.prohibitedTitle', '3. Prohibited Activities')}</h2>
        </div>
        <div className="text-3play-text-secondary leading-relaxed">
          <p className="mb-3">{t('terms.prohibitedText', 'You agree not to engage in any of the following prohibited activities:')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('terms.prohibited1', 'Uploading viruses or malicious code')}</li>
            <li>{t('terms.prohibited2', 'Attempting to access accounts without authorization')}</li>
            <li>{t('terms.prohibited3', 'Interfering with the platform\'s security features')}</li>
            <li>{t('terms.prohibited4', 'Using the platform for illegal purposes')}</li>
            <li>{t('terms.prohibited5', 'Harassing or bullying other users')}</li>
            <li>{t('terms.prohibited6', 'Spamming or distributing unsolicited messages')}</li>
          </ul>
        </div>
      </div>

      {/* Section 4 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('terms.terminationTitle', '4. Termination')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('terms.terminationText', 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform will immediately cease.')}
        </p>
      </div>

      {/* Section 5 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('terms.liabilityTitle', '5. Limitation of Liability')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('terms.liabilityText', 'In no event shall 3Play be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.')}
        </p>
      </div>

      {/* Section 6 */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('terms.changesTitle', '6. Changes to Terms')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('terms.changesText', 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.')}
        </p>
      </div>

      {/* Contact */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('terms.contactTitle', 'Contact Us')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('terms.contactText', 'If you have any questions about these Terms, please contact us at:')}
        </p>
        <a
          href="mailto:terms@3play.com"
          className="text-3play-accent hover:underline"
        >
          terms@3play.com
        </a>
      </div>
    </div>
  )
}

export default Terms
