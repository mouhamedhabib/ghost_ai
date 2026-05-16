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


when i run   http://localhost:3000 in browser  in terminal following error appears  `404` 
GET /sw.js 404 in 313ms (next.js: 86ms, application-code: 227ms)
 GET /sw.js 404 in 29ms (next.js: 2ms, application-code: 27ms)
 GET /sw.js 404 in 96ms (next.js: 9ms, application-code: 87ms)
 GET /sw.js 404 in 32ms (next.js: 3ms, application-code: 30ms)
 GET /sw.js 404 in 34ms (next.js: 2ms, application-code: 32ms)
 GET /sw.js 404 in 34ms (next.js: 1901µs, application-code: 32ms)
 GET /sw.js 404 in 50ms (next.js: 6ms, application-code: 44ms)
 GET /sw.js 404 in 61ms (next.js: 4ms, application-code: 57ms)
 GET /sw.js 404 in 27ms (next.js: 4ms, application-code: 23ms)
 GET /sw.js 404 in 42ms (next.js: 4ms, application-code: 38ms)


i have console errror :
(node:5557) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
 2 |
  3 | export default function EditorPage() {
> 4 |   return <EditorHome />;
    |          ^
  5 | }
  6 |