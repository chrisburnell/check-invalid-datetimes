#!/usr/bin/env node

import { checkInvalidDateTimes } from "./checkInvalidDateTimes.js"

const cli = new checkInvalidDateTimes()
cli.run()
