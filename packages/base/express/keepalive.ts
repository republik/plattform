/**
 * It aims to prevent load balancers or proxies to terminate a long-
 * running request prematurly.
 *
 * Middleware sends processing status code at defined intervals to
 * indicate to load balancers, proxies and client that server will
 * respond eventually.
 *
 * Inspired by https://spin.atomicobject.com/2018/05/15/extending-heroku-timeout-node/
 */
import { Request, Response, NextFunction } from 'express'
import _debug from 'debug'

const debug = _debug('base:express:keepalive')

interface State {
  count: number
  keepaliveTimer: ReturnType<typeof setTimeout> | false
  withdrawTimer: ReturnType<typeof setTimeout> | false
}

// Noop middelware if keepalive should not intervene
const keepaliveNoop = (_req: Request, _res: Response, next: NextFunction) =>
  next()

module.exports = (intervalsSecs: number[], maxSecs?: number) => {
  debug('create %o', { intervalsSecs, maxSecs })

  // Provide noop middleware if there are not intervals provided
  if (!intervalsSecs.length) {
    debug('return keepliveNoop')
    return keepaliveNoop
  }

  // Seconds after which keepalive will withdraw if response is is not finished
  // or closed. It's either {maxSecs} or last entry in {intervalsSecs}.
  const withdrawAfterSecs = maxSecs || intervalsSecs[intervalsSecs.length - 1]

  debug('return keepaliveMiddleware %o', { intervalsSecs, withdrawAfterSecs })
  return function keepaliveMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    debug('begin %o', { path: req.path })

    const state: State = {
      count: 0, // n times keepalive signal was sent
      keepaliveTimer: false,
      withdrawTimer: false,
    }

    /**
     * Returns ms until next interval is due. If {state.count} is bigger than
     * available {intervalsSecs}, it will use last entry in {intervalSecs}.
     */
    const getInterval = () => {
      if (state.count >= intervalsSecs.length) {
        return 1000 * intervalsSecs[intervalsSecs.length - 1]
      }

      return 1000 * intervalsSecs[state.count]
    }

    /**
     * Send HTTP Status Code 102 (Processing) to keep connection alive and
     * indicate to client, there is more coming.
     */
    const onKeepalive = () => {
      debug('onKeepalive %o', { path: req.path })

      // As to not interfere with response itself, withdraw from keeping
      // connection alive if response headers were send already.
      if (res.headersSent) {
        debug('headers sent, ending %o', { path: req.path })
        return end()
      }

      res.writeProcessing()

      state.count++
      state.keepaliveTimer = setTimeout(onKeepalive, getInterval())
    }

    /**
     * Withdraw sunset at once.
     */
    const onWithdraw = () => {
      debug('onWithdraw %o', { path: req.path })
      end()
    }

    /**
     * End keepalive functionality
     */
    const end = () => {
      debug('will end %o', {
        path: req.path,
      })

      // Clear timers if there are any
      state.keepaliveTimer && clearTimeout(state.keepaliveTimer)
      state.withdrawTimer && clearTimeout(state.withdrawTimer)

      // Remove listener on response (if there are any)
      res.off('finish', end)
      res.off('close', end)

      debug('ended %o', {
        path: req.path,
      })
    }

    /**
     * End keepalive if response event "finish" or "close" are emitted,
     * "finish" indidcated response was or is about to be sent, "close"
     * if connection to server is terminated prematurely.
     */
    res.once('finish', end)
    res.once('close', end)

    state.keepaliveTimer = setTimeout(onKeepalive, getInterval())
    state.withdrawTimer = setTimeout(onWithdraw, 1000 * withdrawAfterSecs)

    next()
  }
}
