"use client";

import {
  connectToPhantom,
  disconnectPhantom,
  isPhantomConnected,
  isPhantomInstalled,
} from "@/lib/wallet/phantomUtils";
import { testPhantomConnection } from "@/lib/wallet/walletDetector";
import { useState } from "react";

export default function PhantomDebugger() {
  const [log, setLog] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const addLog = (message) => {
    setLog((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const checkPhantom = async () => {
    addLog("Checking Phantom wallet...");
    const installed = isPhantomInstalled();
    addLog(`Phantom installed: ${installed}`);

    if (installed) {
      const connected = isPhantomConnected();
      addLog(`Phantom connected: ${connected}`);

      if (connected && window.solana.publicKey) {
        addLog(`Public Key: ${window.solana.publicKey.toString()}`);
      }

      const testResult = await testPhantomConnection();
      addLog(`Test result: ${JSON.stringify(testResult)}`);
    }
  };

  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      addLog("Attempting direct connection to Phantom...");
      const result = await connectToPhantom();
      addLog(`Connection successful: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Connection error: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPhantomWallet = async () => {
    try {
      addLog("Disconnecting from Phantom...");
      const result = await disconnectPhantom();
      addLog(`Disconnection ${result ? "successful" : "failed"}`);
    } catch (error) {
      addLog(`Disconnect error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4">Phantom Wallet Debugger</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={checkPhantom}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Check Phantom
        </button>
        <button
          onClick={connectPhantom}
          disabled={isConnecting}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          {isConnecting ? "Connecting..." : "Connect Phantom"}
        </button>
        <button
          onClick={disconnectPhantomWallet}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Disconnect Phantom
        </button>
        <button
          onClick={clearLog}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Clear Log
        </button>
      </div>

      <div className="h-64 overflow-y-auto border p-2 font-mono text-xs">
        {log.length === 0 ? (
          <div className="text-gray-500">No logs yet</div>
        ) : (
          log.map((entry, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {entry}
            </div>
          ))
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Note: If the Phantom popup doesn't appear, make sure you don't have any
        pending requests in the extension.
      </p>
    </div>
  );
}
