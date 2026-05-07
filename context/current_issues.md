when i click the logout buttton the following error appears :
[browser] Failed to fetch RSC payload for http://localhost:3000/. Falling back to browser navigation. TypeError: Failed to fetch
    at new Promise (<anonymous>)
    at navigate (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:18:188900)
    at L (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/ui@1.7.0/dist/ui-common_ui_ad69ce_1.7.0.js:14:208005)
    at navigate (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/ui@1.7.0/dist/ui-common_ui_ad69ce_1.7.0.js:14:210024)
    at navigateAfterSignOut (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/ui@1.7.0/dist/746_ui_ad69ce_1.7.0.js:1:9309)
    at <unknown> (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:18:168503)
    at Object.track (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:16:12664)
    at o (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:18:168479)
    at signOut (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/clerk-js@6/dist/clerk.browser.js:18:168762)
    at async _ (https://fast-horse-83.clerk.accounts.dev/npm/@clerk/ui@1.7.0/dist/ui-common_ui_ad69ce_1.7.0.js:5:68145)

## Resolution

Set Clerk's post-sign-out redirects to `/sign-in` in `app/layout.tsx`.
The previous default sign-out destination was `/`, but `/` is protected by
`proxy.ts` and redirects to `/editor`, which is also protected. After logout,
the signed-out user should land on the public auth route instead.
