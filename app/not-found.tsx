'use client';

import { usePathname } from 'next/navigation';

export default function PageNotFound() {
  const pathname = usePathname();
  const pageName = (pathname ?? '').replace(/^\//, '') || 'home';
  const isAdmin = typeof window !== 'undefined' && Boolean(window.localStorage.getItem('noosheh-admin-token'));

  return (
    <div className="not-found-page" dir="ltr">
      <div className="not-found-card">
        <div className="not-found-stack">
          <div className="not-found-code-block">
            <h1>404</h1>
            <div />
          </div>
          <div className="not-found-message">
            <h2>Page Not Found</h2>
            <p>The page <span>"{pageName}"</span> could not be found in this application.</p>
          </div>
          {isAdmin && (
            <div className="not-found-admin-note">
              <div className="not-found-dot" />
              <div>
                <p>Admin Note</p>
                <small>This could mean that this page has not been implemented yet. Ask the AI to implement it in chat.</small>
              </div>
            </div>
          )}
          <button type="button" onClick={() => { window.location.href = '/'; }} className="not-found-home">
            <span aria-hidden="true">⌂</span>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
