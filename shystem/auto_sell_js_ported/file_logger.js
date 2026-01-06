// File Logger - JavaScript Port
// Port of file_logger.rs

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

/**
 * @typedef {Object} TokenTriggers
 * @property {boolean} topHolderSell
 * @property {boolean} liquidityRemoval
 * @property {boolean} accountFreeze
 */

/**
 * @typedef {Object} TokenAddedEvent
 * @property {Date} timestamp
 * @property {string} tokenMint
 * @property {number} topHoldersCount
 * @property {string} [shyftCallbackId]
 * @property {boolean} shyftCallbackSuccess
 * @property {string} [liquidityPool]
 * @property {TokenTriggers} triggersActive
 */

/**
 * @typedef {Object} TokenRemovedEvent
 * @property {Date} timestamp
 * @property {string} tokenMint
 * @property {string} reason
 * @property {string} [shyftCallbackId]
 * @property {boolean} shyftCleanupSuccess
 * @property {number} monitoringDurationSeconds
 */

/**
 * @typedef {Object} EventDetectedLog
 * @property {Date} timestamp
 * @property {string} tokenMint
 * @property {string} eventType
 * @property {string} detectionSource
 * @property {Object} triggerDetails
 * @property {string} [transactionSignature]
 * @property {boolean} willTriggerSell
 */

/**
 * @typedef {Object} SellAttemptLog
 * @property {Date} timestamp
 * @property {string} tokenMint
 * @property {string} triggerType
 * @property {string} triggerDetails
 * @property {boolean} sellStarted
 * @property {boolean} sellSuccess
 * @property {string} [transactionSignature]
 * @property {string} [errorMessage]
 * @property {number} [amountSold]
 * @property {number} [solReceived]
 * @property {number} [slippage]
 * @property {boolean} usedJito
 * @property {number} [confirmationTimeMs]
 * @property {number} sellDurationMs
 */

/**
 * @typedef {Object} SystemEvent
 * @property {Date} timestamp
 * @property {string} eventType
 * @property {string} message
 * @property {Object} [details]
 */

/**
 * @typedef {Object} WebhookLog
 * @property {Date} timestamp
 * @property {string} webhookType
 * @property {string} sourceIp
 * @property {number} payloadSize
 * @property {boolean} processingSuccess
 * @property {number} processingTimeMs
 * @property {string[]} eventsDetected
 * @property {string} [errorMessage]
 */

class FileLogger {
  constructor(dataDir) {
    this.dataDir = path.join(dataDir, "logs");
    this.enabled = true;

    // Create logs subdirectory
    try {
      if (!fsSync.existsSync(this.dataDir)) {
        fsSync.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (e) {
      console.error(`Failed to create logs directory: ${e}`);
    }
  }

  disable() {
    this.enabled = false;
  }

  logTokenAdded(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "token_events.jsonl");
    const logEntry = {
      type: "TOKEN_ADDED",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  logTokenRemoved(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "token_events.jsonl");
    const logEntry = {
      type: "TOKEN_REMOVED",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  logEventDetected(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "events_detected.jsonl");
    const logEntry = {
      type: "EVENT_DETECTED",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  logSellAttempt(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "sell_attempts.jsonl");
    const logEntry = {
      type: "SELL_ATTEMPT",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  logSystemEvent(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "system_events.jsonl");
    const logEntry = {
      type: "SYSTEM_EVENT",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  logWebhookReceived(event) {
    if (!this.enabled) return;

    const filePath = path.join(this.dataDir, "webhooks.jsonl");
    const logEntry = {
      type: "WEBHOOK_RECEIVED",
      data: {
        ...event,
        timestamp: event.timestamp.toISOString(),
      },
    };

    this.appendToFile(filePath, logEntry);
  }

  appendToFile(filePath, logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + "\n";
      fsSync.appendFileSync(filePath, logLine);
    } catch (e) {
      console.error(`Failed to write to log file ${filePath}: ${e}`);
    }
  }

  logError(context, error, details = null) {
    const event = {
      timestamp: new Date(),
      eventType: "ERROR",
      message: `${context}: ${error}`,
      details,
    };
    this.logSystemEvent(event);
  }

  logInfo(context, message, details = null) {
    const event = {
      timestamp: new Date(),
      eventType: "INFO",
      message: `${context}: ${message}`,
      details,
    };
    this.logSystemEvent(event);
  }

  logWarning(context, message, details = null) {
    const event = {
      timestamp: new Date(),
      eventType: "WARNING",
      message: `${context}: ${message}`,
      details,
    };
    this.logSystemEvent(event);
  }

  /**
   * Read triggered events from events_detected.jsonl
   * @param {number} [limit]
   * @returns {Array}
   */
  readTriggeredEvents(limit = null) {
    const filePath = path.join(this.dataDir, "events_detected.jsonl");

    if (!fsSync.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fsSync.readFileSync(filePath, "utf-8");
      let events = content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter((event) => event !== null);

      // Reverse to get newest first
      events.reverse();

      // Apply limit if specified
      if (limit) {
        events = events.slice(0, limit);
      }

      return events;
    } catch (e) {
      console.error(`Failed to read events_detected.jsonl: ${e}`);
      return [];
    }
  }

  /**
   * Read triggered events grouped by token
   * @param {number} [limit]
   * @returns {Object}
   */
  readTriggeredTokens(limit = null) {
    const events = this.readTriggeredEvents(null);

    // Group events by token_mint
    const tokensMap = new Map();

    for (const event of events) {
      if (event.data && event.data.tokenMint) {
        const tokenMint = event.data.tokenMint;
        if (!tokensMap.has(tokenMint)) {
          tokensMap.set(tokenMint, []);
        }
        tokensMap.get(tokenMint).push(event);
      }
    }

    // Convert to sorted list by most recent event
    let tokens = Array.from(tokensMap.entries()).map(([tokenMint, events]) => {
      const eventCount = events.length;
      const latestEvent = events[0];
      const firstEvent = events[events.length - 1];

      const latestTimestamp = latestEvent?.data?.timestamp || "";
      const firstTimestamp = firstEvent?.data?.timestamp || "";

      // Collect unique event types
      const eventTypes = new Set();
      for (const event of events) {
        if (event.data && event.data.eventType) {
          eventTypes.add(event.data.eventType);
        }
      }

      return {
        token_mint: tokenMint,
        trigger_count: eventCount,
        first_triggered_at: firstTimestamp,
        last_triggered_at: latestTimestamp,
        event_types: Array.from(eventTypes),
        events,
      };
    });

    // Sort by latest event timestamp (newest first)
    tokens.sort((a, b) => {
      return b.last_triggered_at.localeCompare(a.last_triggered_at);
    });

    // Apply limit if specified
    if (limit) {
      tokens = tokens.slice(0, limit);
    }

    return {
      total_tokens: tokens.length,
      tokens,
    };
  }
}

// Global file logger instance
let globalFileLogger = null;

/**
 * Initialize the file logger
 * @param {string} dataDir
 */
async function initFileLogger(dataDir) {
  globalFileLogger = new FileLogger(dataDir);
}

/**
 * Get the file logger instance
 * @returns {FileLogger}
 */
async function getFileLogger() {
  return globalFileLogger;
}

module.exports = {
  FileLogger,
  initFileLogger,
  getFileLogger,
};
