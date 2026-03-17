import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Feedback = () => {
  const { t } = useTranslation()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    email: ''
  })

  const feedbackTypes = [
    { value: 'general', label: t('feedback.typeGeneral', 'General Feedback') },
    { value: 'bug', label: t('feedback.typeBug', 'Bug Report') },
    { value: 'feature', label: t('feedback.typeFeature', 'Feature Request') },
    { value: 'content', label: t('feedback.typeContent', 'Content Issue') },
    { value: 'other', label: t('feedback.typeOther', 'Other') }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsLoading(false)
    setIsSubmitted(true)
    toast.success(t('feedback.success', 'Thank you for your feedback!'))
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('feedback.thankYou', 'Thank You!')}
        </h2>
        <p className="text-3play-text-secondary mb-8">
          {t('feedback.successMessage', 'Your feedback has been submitted successfully. We appreciate your input and will review it shortly.')}
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({ type: 'general', subject: '', message: '', email: '' })
          }}
          className="px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          {t('feedback.sendAnother', 'Send Another Feedback')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-3play-accent/20 rounded-full flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8 text-3play-accent" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {t('feedback.title', 'Send Feedback')}
        </h1>
        <p className="text-3play-text-secondary">
          {t('feedback.subtitle', 'Help us improve 3Play by sharing your thoughts, reporting bugs, or suggesting features.')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-3play-card rounded-xl p-6 space-y-6">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-3play-text-secondary mb-2">
            {t('feedback.typeLabel', 'Feedback Type')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
            required
          >
            {feedbackTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-3play-text-secondary mb-2">
            {t('feedback.emailLabel', 'Email (optional)')}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('feedback.emailPlaceholder', 'your@email.com')}
            className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
          />
          <p className="text-3play-text-muted text-sm mt-1">
            {t('feedback.emailHelp', 'We may contact you for additional information.')}
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-3play-text-secondary mb-2">
            {t('feedback.subjectLabel', 'Subject')}
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder={t('feedback.subjectPlaceholder', 'Brief summary of your feedback')}
            className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-3play-text-secondary mb-2">
            {t('feedback.messageLabel', 'Message')}
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder={t('feedback.messagePlaceholder', 'Please describe your feedback in detail...')}
            rows={6}
            className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('feedback.sending', 'Sending...')}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t('feedback.submit', 'Submit Feedback')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default Feedback
