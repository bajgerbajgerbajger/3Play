import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Lock, Trash2, Bell, User, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Settings = () => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
    toast.success(t('settings.languageChanged', 'Language changed successfully'))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch', 'Passwords do not match'))
      return
    }

    setIsLoading(true)
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      toast.success(t('settings.passwordChanged', 'Password changed successfully'))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic', 'Something went wrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('settings.deleteConfirm', 'Are you sure you want to delete your account? This action cannot be undone.'))) {
      return
    }

    setIsLoading(true)
    try {
      await api.delete('/users/me')
      toast.success(t('settings.accountDeleted', 'Account deleted successfully'))
      logout()
    } catch (error) {
      toast.error(error.response?.data?.message || t('errors.generic', 'Something went wrong'))
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: t('settings.tabs.general', 'General'), icon: User },
    { id: 'language', label: t('settings.tabs.language', 'Language'), icon: Globe },
    { id: 'password', label: t('settings.tabs.password', 'Password'), icon: Lock },
    { id: 'notifications', label: t('settings.tabs.notifications', 'Notifications'), icon: Bell },
    { id: 'danger', label: t('settings.tabs.danger', 'Danger Zone'), icon: Trash2 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t('settings.generalTitle', 'General Settings')}</h2>

            <div className="bg-3play-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-3play-accent flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{user?.name}</h3>
                  <p className="text-3play-text-secondary">{user?.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-3play-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-3play-text-secondary">{t('profile.videos', 'videos')}</span>
                    <p className="text-white font-medium">{user?.totalVideos || 0}</p>
                  </div>
                  <div>
                    <span className="text-3play-text-secondary">{t('profile.subscribers', 'subscribers')}</span>
                    <p className="text-white font-medium">{user?.subscribers || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t('settings.languageTitle', 'Language Settings')}</h2>

            <div className="bg-3play-card rounded-xl p-6 space-y-4">
              <p className="text-3play-text-secondary">{t('settings.selectLanguage', 'Select your preferred language')}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleLanguageChange('cs')}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    i18n.language === 'cs'
                      ? 'border-3play-accent bg-3play-accent/10'
                      : 'border-3play-border hover:border-3play-text-secondary'
                  }`}
                >
                  <span className="text-white font-medium">Čeština</span>
                  <p className="text-3play-text-secondary text-sm">Czech</p>
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    i18n.language === 'en'
                      ? 'border-3play-accent bg-3play-accent/10'
                      : 'border-3play-border hover:border-3play-text-secondary'
                  }`}
                >
                  <span className="text-white font-medium">English</span>
                  <p className="text-3play-text-secondary text-sm">English</p>
                </button>
              </div>
            </div>
          </div>
        )

      case 'password':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t('settings.passwordTitle', 'Change Password')}</h2>

            <form onSubmit={handlePasswordChange} className="bg-3play-card rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-3play-text-secondary mb-2">
                  {t('settings.currentPassword', 'Current Password')}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-3play-text-secondary mb-2">
                  {t('settings.newPassword', 'New Password')}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-3play-text-secondary mb-2">
                  {t('settings.confirmNewPassword', 'Confirm New Password')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-3play-dark border border-3play-border rounded-lg text-white focus:outline-none focus:border-3play-accent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? t('common.loading', 'Loading...') : t('settings.changePassword', 'Change Password')}
              </button>
            </form>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t('settings.notificationsTitle', 'Notification Settings')}</h2>

            <div className="bg-3play-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-3play-border">
                <div>
                  <h3 className="text-white font-medium">{t('settings.emailNotifications', 'Email Notifications')}</h3>
                  <p className="text-3play-text-secondary text-sm">{t('settings.emailNotificationsDesc', 'Receive updates via email')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-3play-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-3play-accent"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-3play-border">
                <div>
                  <h3 className="text-white font-medium">{t('settings.newSubscribers', 'New Subscribers')}</h3>
                  <p className="text-3play-text-secondary text-sm">{t('settings.newSubscribersDesc', 'Get notified when someone subscribes')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-3play-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-3play-accent"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-white font-medium">{t('settings.videoComments', 'Video Comments')}</h3>
                  <p className="text-3play-text-secondary text-sm">{t('settings.videoCommentsDesc', 'Get notified about new comments')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-3play-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-3play-accent"></div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'danger':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">{t('settings.dangerTitle', 'Danger Zone')}</h2>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Trash2 className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{t('settings.deleteAccount', 'Delete Account')}</h3>
                  <p className="text-3play-text-secondary text-sm mt-1">
                    {t('settings.deleteAccountDesc', 'Once you delete your account, there is no going back. Please be certain.')}
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? t('common.loading', 'Loading...') : t('settings.deleteAccountButton', 'Delete Account')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{t('navigation.settings', 'Settings')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-3play-card rounded-xl overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-3play-accent/20 text-3play-accent'
                      : 'text-3play-text-secondary hover:bg-3play-border hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{tab.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Settings
