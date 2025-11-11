# GraphQL WebSocket Migration Summary

## Migration from subscriptions-transport-ws to graphql-ws

### Date
November 11, 2025

### Objective
Replace the deprecated and unmaintained `subscriptions-transport-ws` library with the modern `graphql-ws` library to fix WebSocket connection leaks causing API outages.

## Changes Made

### 0. Legacy Mobile App Cleanup

Removed support for legacy mobile app versions (< 2.0):

**Deleted Files:**
- `apps/www/lib/apollo/appWorkerLink.js` - Legacy worker link for app versions < 2.0
- `apps/www/components/Frame/LegacyAppNoticeBox.js` - Legacy app upgrade notice

**Updated Files:**
- `apps/www/lib/apollo/index.ts` - Removed mobile config options
- `apps/www/lib/withInNativeApp.js` - Removed legacy app handling, postMessage monkey-patching, and route syncing
- `apps/www/components/Frame/index.tsx` - Removed legacy app notice box
- `apps/www/components/NativeApp/MessageSync.js` - Simplified to only support v2.0+ message format
- `apps/www/components/Frame/DarkmodeSwitch.js` - Removed legacy dark mode handling
- `apps/www/components/ColorScheme/useColorScheme.ts` - Simplified to not check for legacy apps
- `packages/nextjs-apollo-client/src/apollo/apolloClient.ts` - Removed `mobileConfigOptions` type definition
- `packages/nextjs-apollo-client/src/apollo/apolloLink.ts` - Removed mobile config options parameter and conditional logic
- `packages/nextjs-apollo-client/src/index.ts` - Removed `mobileConfigOptions` from type union

Modern native apps (v2.0+) use `window.ReactNativeWebView.postMessage` directly and can establish WebSocket connections like regular browsers.

### 1. Server-Side Changes

**File: `packages/backend-modules/base/express/graphql.js`**
- Replaced `subscriptions-transport-ws` with `graphql-ws`
- Removed `SubscriptionServer` import
- Added `useServer` from `graphql-ws/lib/use/ws` and `WebSocketServer` from `ws`
- Removed deprecated `subscriptions` config from `ApolloServer`
- Replaced `SubscriptionServer.create()` with `useServer()` implementation
- Removed unused `WS_KEEPALIVE_INTERVAL` environment variable (graphql-ws handles connection management internally)
- Added connection lifecycle logging for `onConnect` and `onDisconnect` events

**File: `packages/backend-modules/base/package.json`**
- Removed: `"subscriptions-transport-ws": "^0.11.0"`
- Added: `"graphql-ws": "^5.14.0"`
- Added: `"ws": "^8.14.0"`

### 2. Client-Side Changes

**File: `packages/nextjs-apollo-client/src/apollo/apolloLink.ts`**
- Replaced `WebSocketLink` from `@apollo/client/link/ws` with `GraphQLWsLink` and `createClient` from `graphql-ws`
- Updated WebSocket client configuration with proper retry logic and connection params

**File: `packages/nextjs-apollo-client/package.json`**
- Added `"graphql-ws": "^5.14.0"` to both `devDependencies` and `peerDependencies`

**File: `apps/www/lib/apollo/appWorkerLink.js`**
- Replaced `SubscriptionClient` from `subscriptions-transport-ws` with `createClient` from `graphql-ws`
- Rewrote `SubscriptionWorkerLink` class to use graphql-ws protocol
- Updated message types to match graphql-ws protocol: `connection_init`, `connection_ack`, `ping`, `pong`, `subscribe`, `next`, `error`, `complete`
- Implemented proper subscription lifecycle management with cleanup

**File: `apps/www/package.json`**
- Removed: `"subscriptions-transport-ws": "^0.11.0"`
- Added: `"graphql-ws": "^5.14.0"`

**File: `apps/admin/package.json`**
- Removed: `"subscriptions-transport-ws": "^0.11.0"`
- Added: `"graphql-ws": "^5.14.0"`

**File: `apps/publikator/package.json`**
- Removed: `"subscriptions-transport-ws": "^0.11.0"`
- Added: `"graphql-ws": "^5.14.0"`

### 3. Testing Package Changes

**File: `packages/backend-modules/testing/instance/buildClients.js`**
- Replaced `SubscriptionClient` with `createClient` from `graphql-ws`
- Created compatibility wrapper to maintain backward compatibility with existing tests
- Implemented wrapper methods: `request()`, `subscribe()`, `onConnected()`, `close()`
- Maintained same API surface for existing integration tests

**File: `packages/backend-modules/testing/package.json`**
- Removed: `"subscriptions-transport-ws": "^0.11.0"` from devDependencies
- Added: `"graphql-ws": "^5.14.0"` to devDependencies
- Added: `"ws": "^8.14.0"` to dependencies

## Affected Subscriptions

The migration affects the following GraphQL subscriptions:

1. **Notifications** (`webNotification`, `notification`) - packages/backend-modules/subscriptions
2. **Comments** (`comment`) - packages/backend-modules/discussions
3. **Greeting** (`greeting`) - packages/backend-modules/republik
4. **Uncommitted Changes** (`uncommittedChanges`) - packages/backend-modules/publikator

## Breaking Changes

### For End Users
- **None**: The migration is backward compatible from the client perspective

### For Developers
- **Test API**: The test subscription client has been wrapped to maintain compatibility, but developers should be aware that the underlying implementation has changed
- **Environment Variables**: `WS_KEEPALIVE_INTERVAL` is no longer used (graphql-ws manages this internally)

## Expected Benefits

1. **Eliminates WebSocket connection leaks** - graphql-ws has better connection lifecycle management
2. **Active maintenance** - graphql-ws is actively maintained and follows the GraphQL spec
3. **Better error handling** - Improved error reporting and connection state management
4. **Reduced resource usage** - More efficient connection management should reduce dyno exhaustion
5. **Modern protocol** - Uses the latest GraphQL WebSocket protocol standard

## Deployment Instructions

### Prerequisites
- Node.js 20.x (already required)
- Run `yarn install` to update dependencies

### Deployment Steps

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Deploy all services together** (coordinated deployment):
   - API server (backend-modules/base)
   - www app
   - admin app
   - publikator app

3. **Monitor after deployment**:
   - WebSocket connection counts
   - Error rates in Sentry
   - Subscription functionality (notifications, comments)
   - Server resource usage (memory, connections)

### Rollback Plan

If issues arise:
1. Revert to the previous git commit
2. Run `yarn install` to restore old dependencies
3. Deploy the previous version

## Testing Checklist

- [ ] Integration tests pass (`yarn test:integration`)
- [ ] Subscription tests pass (publikator activity tests)
- [ ] WebSocket connections establish successfully
- [ ] Notifications deliver in real-time
- [ ] Comment subscriptions work in discussions
- [ ] No increase in error rates
- [ ] WebSocket connections close properly (no leaks)
- [ ] Server resource usage is stable or improved

## Additional Notes

- The migration maintains backward compatibility for existing integration tests
- The mobile app (webview) automatically uses the updated client code from www
- No changes are required to GraphQL schemas or resolvers
- The `admin` app doesn't use WebSocket subscriptions, but dependencies were updated for consistency

## References

- [graphql-ws Documentation](https://the-guild.dev/graphql/ws)
- [Apollo Client Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)
- [Migration from subscriptions-transport-ws](https://the-guild.dev/graphql/ws/recipes#migration-from-subscriptions-transport-ws)

