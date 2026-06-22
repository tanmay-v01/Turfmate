import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[TurfMate] Render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0FDF4]">
          <div className="max-w-md w-full rounded-2xl bg-white border border-red-200 shadow-lg p-6 text-center">
            <h1 className="text-lg font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-600 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-brand-grassFresh text-slate-900 font-bold text-sm"
              onClick={() => {
                try {
                  localStorage.removeItem('tm_profile');
                  localStorage.removeItem('tm_onboarding_progress');
                  localStorage.removeItem('tm_bookings');
                  localStorage.removeItem('tm_turfs');
                  localStorage.removeItem('tm_owners');
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }}
            >
              Clear saved data &amp; reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
