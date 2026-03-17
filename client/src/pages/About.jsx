import { useTranslation } from 'react-i18next'
import { Play, Users, Shield, Zap } from 'lucide-react'

const About = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: Play,
      title: t('about.feature1Title', 'Unlimited Streaming'),
      description: t('about.feature1Desc', 'Watch your favorite videos anytime, anywhere without limits.')
    },
    {
      icon: Users,
      title: t('about.feature2Title', 'Community Driven'),
      description: t('about.feature2Desc', 'Connect with creators and viewers from around the world.')
    },
    {
      icon: Shield,
      title: t('about.feature3Title', 'Safe & Secure'),
      description: t('about.feature3Desc', 'Your data is protected with industry-leading security measures.')
    },
    {
      icon: Zap,
      title: t('about.feature4Title', 'Lightning Fast'),
      description: t('about.feature4Desc', 'Enjoy high-quality video streaming with minimal buffering.')
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          {t('about.title', 'About 3Play')}
        </h1>
        <p className="text-xl text-3play-text-secondary max-w-2xl mx-auto">
          {t('about.subtitle', 'Your ultimate destination for video content. Share, discover, and enjoy videos from creators worldwide.')}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="bg-3play-card rounded-xl p-6 space-y-3 hover:bg-3play-border transition-colors"
            >
              <div className="w-12 h-12 bg-3play-accent/20 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-3play-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-3play-text-secondary">{feature.description}</p>
            </div>
          )
        })}
      </div>

      {/* Mission Section */}
      <div className="bg-3play-card rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {t('about.missionTitle', 'Our Mission')}
        </h2>
        <p className="text-3play-text-secondary leading-relaxed">
          {t('about.missionText', 'At 3Play, we believe everyone has a story worth sharing. Our platform empowers creators to reach global audiences and provides viewers with endless entertainment and educational content. We are committed to building a community where creativity thrives and connections are made.')}
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '1M+', label: t('about.users', 'Users') },
          { value: '10M+', label: t('about.videos', 'Videos') },
          { value: '50+', label: t('about.countries', 'Countries') },
          { value: '24/7', label: t('about.support', 'Support') },
        ].map((stat, index) => (
          <div key={index} className="text-center p-6 bg-3play-card rounded-xl">
            <div className="text-3xl font-bold text-3play-accent">{stat.value}</div>
            <div className="text-3play-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {t('about.contactTitle', 'Get in Touch')}
        </h2>
        <p className="text-3play-text-secondary">
          {t('about.contactText', 'Have questions or feedback? We would love to hear from you.')}
        </p>
        <a
          href="mailto:support@3play.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          {t('about.contactButton', 'Contact Us')}
        </a>
      </div>
    </div>
  )
}

export default About
