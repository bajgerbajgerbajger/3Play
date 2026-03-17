import { useTranslation } from 'react-i18next'
import { Shield, Lock, Eye, Trash2 } from 'lucide-react'

const Privacy = () => {
  const { t } = useTranslation()

  const sections = [
    {
      icon: Shield,
      title: t('privacy.dataCollectionTitle', 'Data Collection'),
      content: t('privacy.dataCollectionText', 'We collect information you provide directly to us, such as when you create an account, upload videos, or contact us. This may include your name, email address, and any content you upload to the platform.')
    },
    {
      icon: Lock,
      title: t('privacy.dataSecurityTitle', 'Data Security'),
      content: t('privacy.dataSecurityText', 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your password is encrypted and stored securely.')
    },
    {
      icon: Eye,
      title: t('privacy.dataUsageTitle', 'How We Use Your Data'),
      content: t('privacy.dataUsageText', 'We use your data to provide and improve our services, personalize your experience, communicate with you, and ensure the security of our platform. We do not sell your personal information to third parties.')
    },
    {
      icon: Trash2,
      title: t('privacy.dataRetentionTitle', 'Data Retention'),
      content: t('privacy.dataRetentionText', 'We retain your data for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time through your settings.')
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Shield className="w-16 h-16 text-3play-accent mx-auto" />
        <h1 className="text-3xl font-bold text-white">
          {t('privacy.title', 'Privacy Policy')}
        </h1>
        <p className="text-3play-text-secondary">
          {t('privacy.lastUpdated', 'Last updated: {{date}}', { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      {/* Introduction */}
      <div className="bg-3play-card rounded-xl p-6">
        <p className="text-3play-text-secondary leading-relaxed">
          {t('privacy.introduction', 'At 3Play, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. By using 3Play, you agree to the collection and use of information in accordance with this policy.')}
        </p>
      </div>

      {/* Privacy Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <div key={index} className="bg-3play-card rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-3play-accent/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-3play-accent" />
                </div>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>
              <p className="text-3play-text-secondary leading-relaxed">{section.content}</p>
            </div>
          )
        })}
      </div>

      {/* Cookies Section */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('privacy.cookiesTitle', 'Cookies')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('privacy.cookiesText', 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.')}
        </p>
      </div>

      {/* Your Rights Section */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('privacy.rightsTitle', 'Your Rights')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('privacy.rightsText', 'You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us. You also have the right to object to processing of your personal data and to data portability.')}
        </p>
      </div>

      {/* Contact Section */}
      <div className="bg-3play-card rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-white">{t('privacy.contactTitle', 'Contact Us')}</h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('privacy.contactText', 'If you have any questions about this Privacy Policy, please contact us at:')}
        </p>
        <a
          href="mailto:privacy@3play.com"
          className="text-3play-accent hover:underline"
        >
          privacy@3play.com
        </a>
      </div>
    </div>
  )
}

export default Privacy
