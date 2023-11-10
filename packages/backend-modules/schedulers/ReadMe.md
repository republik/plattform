
# @orbiting/backend-modules-schedulers

This module exports three functions that can be used to periodically run functions either on a specific day of the month, a fixed interval or a specific time of day.

## Exported Functions

### dayOfMonthScheduler
Can be used to run a function on a specific day every months. For example: it is used to calculate KPI's ever 15th of the month (`/packages/backend-modules/republik/lib/scheduler/calculateKpis.js`)

| Prop | Value & Description |
| ----------- | ----------- |
| name | `string!` - name of the function |
| context | `any!` - context includes redis |
| runFunc | `function(args, context)!` -  the function that should be run by the scheduler, needs to specify a dryRun |
| runAtTime | `sring` - Format: HH:MM'- time of day when the scheduler should run |
| runAtDayOfMonth | `int` - day of the month when the scheduler should run |
| runInitially | `book(false)` - if true, function runs on first invocation |
| dryRun | `bool (false)` -  if true, the function specified in runFunc will be called with the argument: dryRun |

### intervalScheduler
Can be used to run a function in a fixed interval. For example: it is used to calculate KPI's ever 15th of the month (`/packages/backend-modules/republik/lib/scheduler/calculateKpis.js`)

| Prop | Value & Description |
| ----------- | ----------- |
| name | `string!` - name of the function |
| context | `any!` - context includes redis |
| runFunc | `function!` -  the function that should be run by the scheduler |
| runAtTime | `sring` - Format: HH:MM'- time of day when the scheduler should run |
| runAtDayOfMonth | `int` - day of the month when the scheduler should run |
| runInitially | `book(false)` - if true, function runs on first invocation |
| dryRun | `bool (false)` -  |

### timeScheduler




## Using a Scheduler

## Initiating a Scheduler on the server


/apps/api/server.js
