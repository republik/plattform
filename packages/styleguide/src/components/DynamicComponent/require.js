// d3-require Version 1.1.0 Copyright 2018 Observable, Inc.

// Stripped down version
// - removed default resolver, only requireFrom
// currently our setup explodes with template literals or async/await

/* eslint-disable */

const modules = new Map()
const queue = []
const map = queue.map
const some = queue.some
const hasOwnProperty = queue.hasOwnProperty

function string(value) {
  return typeof value === 'string' ? value : ''
}

export function requireFrom(resolver) {
  const requireBase = requireRelative(null)

  function requireAbsolute(url) {
    if (typeof url !== 'string') return url
    let module = modules.get(url)
    if (!module)
      modules.set(
        url,
        (module = new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.onload = () => {
            try {
              resolve(queue.pop()(requireRelative(url)))
            } catch (error) {
              reject(new Error('invalid module'))
            }
            script.remove()
          }
          script.onerror = () => {
            reject(new Error('unable to load module'))
            script.remove()
          }
          script.async = true
          script.src = url
          window.define = define
          document.head.appendChild(script)
        }))
      )
    return module
  }

  function requireRelative(base) {
    return name => Promise.resolve(resolver(name, base)).then(requireAbsolute)
  }

  function requireAlias(aliases) {
    return requireFrom((name, base) => {
      if (name in aliases) {
        ;(name = aliases[name]), (base = null)
        if (typeof name !== 'string') return name
      }
      return resolver(name, base)
    })
  }

  function require(name) {
    return arguments.length > 1
      ? Promise.all(map.call(arguments, requireBase)).then(merge)
      : requireBase(name)
  }

  require.alias = requireAlias
  require.resolve = resolver

  return require
}

function merge(modules) {
  const o = {}
  for (const m of modules) {
    for (const k in m) {
      if (hasOwnProperty.call(m, k)) {
        if (m[k] == null) Object.defineProperty(o, k, { get: getter(m, k) })
        else o[k] = m[k]
      }
    }
  }
  return o
}

function getter(object, name) {
  return () => object[name]
}

function isexports(name) {
  return name + '' === 'exports'
}

function define(name, dependencies, factory) {
  const n = arguments.length
  if (n < 2) (factory = name), (dependencies = [])
  else if (n < 3)
    (factory = dependencies),
      (dependencies = typeof name === 'string' ? [] : name)
  queue.push(
    some.call(dependencies, isexports)
      ? require => {
          const exports = {}
          return Promise.all(
            map.call(dependencies, name => {
              return isexports((name += '')) ? exports : require(name)
            })
          ).then(dependencies => {
            factory.apply(null, dependencies)
            return exports
          })
        }
      : require => {
          return Promise.all(map.call(dependencies, require)).then(
            dependencies => {
              return typeof factory === 'function'
                ? factory.apply(null, dependencies)
                : factory
            }
          )
        }
  )
}

define.amd = {}
