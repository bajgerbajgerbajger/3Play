import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Reports = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('all')

  // Mock data - in a real app, this would come from an API
  const reports = [
    {
      id: 1,
      videoTitle: 'Sample Video Title',
      videoId: '123',
      reason: 'inappropriate',
      status: 'pending',
      date: new Date().toISOString(),
      description: 'This video contains inappropriate content.'
    },
    {
      id: 2,
      videoTitle: 'Another Video',
      videoId: '456',
      reason: 'copyright',
      status: 'resolved',
      date: new Date(Date.now() - 86400000).toISOString(),
      description: 'Copyright infringement claim.'
    }
  ]

  const filteredReports = activeTab === 'all'
    ? reports
    : reports.filter(report => report.status === activeTab)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return t('reports.statusPending', 'Pending')
      case 'resolved':
        return t('reports.statusResolved', 'Resolved')
      case 'rejected':
        return t('reports.statusRejected', 'Rejected')
      default:
        return status
    }
  }

  const getReasonText = (reason) => {
    const reasons = {
      inappropriate: t('reports.reasonInappropriate', 'Inappropriate Content'),
      copyright: t('reports.reasonCopyright', 'Copyright Infringement'),
      spam: t('reports.reasonSpam', 'Spam'),
      violence: t('reports.reasonViolence', 'Violence'),
      harassment: t('reports.reasonHarassment', 'Harassment'),
      other: t('reports.reasonOther', 'Other')
    }
    return reasons[reason] || reason
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <Flag className="w-16 h-16 text-3play-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('reports.emptyTitle', 'No Reports')}
        </h2>
        <p className="text-3play-text-secondary mb-6">
          {t('reports.emptyDescription', 'You have not reported any videos yet.')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-3play-accent text-white rounded-lg hover:bg-3play-accent/90 transition-colors"
        >
          {t('reports.browseVideos', 'Browse Videos')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('navigation.reportHistory', 'Report History')}
          </h1>
          <p className="text-3play-text-secondary mt-1">
            {t('reports.reportCount', '{{count}} reports', { count: reports.length })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-3play-border">
        {['all', 'pending', 'resolved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-3play-accent'
                : 'text-3play-text-secondary hover:text-white'
            }`}
          >
            {t(`reports.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`, tab)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-3play-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-3play-card rounded-xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/watch/${report.videoId}`}
                  className="text-lg font-semibold text-white hover:text-3play-accent transition-colors"
                >
                  {report.videoTitle}
                </Link>
                <p className="text-3play-text-secondary text-sm mt-1">
                  {t('reports.reportedOn', 'Reported on {{date}}', {
                    date: new Date(report.date).toLocaleDateString()
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                <span className={`text-sm font-medium ${
                  report.status === 'pending' ? 'text-yellow-400' :
                  report.status === 'resolved' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {getStatusText(report.status)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-3play-text-secondary text-sm">{t('reports.reason', 'Reason')}: </span>
                <span className="text-white">{getReasonText(report.reason)}</span>
              </div>
              <div>
                <span className="text-3play-text-secondary text-sm">{t('reports.description', 'Description')}: </span>
                <span className="text-white">{report.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reports
