"use client";

import React, { useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

// Public echo WebSocket endpoint per https://websocket.org/tools/websocket-echo-server/
const WS_URL = "wss://echo.websocket.org";

type Msg = {
  id: string;
  direction: "sent" | "received" | "system";
  text: string;
  time: string;
};

const now = () => new Date().toLocaleTimeString();

export default function WebSocketDemoPage() {
  const [shouldConnect, setShouldConnect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: crypto.randomUUID(),
      direction: "system",
      text: `Ready. Click Connect to open ${WS_URL}`,
      time: now(),
    },
  ]);
  
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    WS_URL,
    {
      shouldReconnect: () => true,
      reconnectAttempts: Infinity,
      reconnectInterval: 3000,
      share: true,
      onOpen: () => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), direction: "system", text: "Connected", time: now() },
        ]);
      },
      onClose: () => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), direction: "system", text: "Disconnected", time: now() },
        ]);
      },
      onError: () => {
        setError("WebSocket error occurred");
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), direction: "system", text: "Error on connection", time: now() },
        ]);
      },
    },
    shouldConnect
  );

  const status = useMemo(() => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return "connecting";
      case ReadyState.OPEN:
        return "connected";
      case ReadyState.CLOSING:
        return "connecting";
      case ReadyState.CLOSED:
      case ReadyState.UNINSTANTIATED:
      default:
        return "disconnected";
    }
  }, [readyState]) as "disconnected" | "connecting" | "connected" | "error";

  const canSend = status === "connected";

  const connect = () => {
    setError(null);
    setShouldConnect(true);
  };

  const disconnect = () => {
    setShouldConnect(false);
    getWebSocket()?.close();
  };

  const send = () => {
    if (!canSend) return;
    const text = input || "(empty message)";
    sendMessage(text);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), direction: "sent", text, time: now() },
    ]);
    setInput("");
  };

  useEffect(() => {
    if (lastMessage) {
      const text =
        typeof lastMessage.data === "string"
          ? lastMessage.data
          : "[binary message]";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), direction: "received", text, time: now() },
      ]);
    }
  }, [lastMessage]);

  useEffect(() => {
    return () => {
      setShouldConnect(false);
      getWebSocket()?.close();
    };
  }, [getWebSocket]);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">WebSocket Echo Demo</h1>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          {status !== "connected" ? (
            <button
              onClick={connect}
              className="rounded bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="rounded bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-700"
            >
              Disconnect
            </button>
          )}
        </div>
      </header>

      <p className="text-sm text-gray-600">
        Endpoint: <code className="rounded bg-gray-100 px-1 py-0.5">{WS_URL}</code>
      </p>

      <section className="space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 rounded border px-3 py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={!canSend}
          />
          <button
            onClick={send}
            disabled={!canSend}
            className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Messages</h2>
        <div className="h-80 overflow-auto rounded border p-3">
          <ul className="space-y-2">
            {messages.map((m) => (
              <li key={m.id} className="text-sm">
                <span
                  className={
                    m.direction === "sent"
                      ? "text-blue-600"
                      : m.direction === "received"
                      ? "text-green-700"
                      : "text-gray-500"
                  }
                >
                  [{m.time}] {m.direction.toUpperCase()}: {m.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "disconnected" | "connecting" | "connected" | "error";
}) {
  const label =
    status === "connected"
      ? "Connected"
      : status === "connecting"
      ? "Connecting"
      : status === "error"
      ? "Error"
      : "Disconnected";
  const color =
    status === "connected"
      ? "bg-green-100 text-green-800"
      : status === "connecting"
      ? "bg-yellow-100 text-yellow-800"
      : status === "error"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${color}`}>
      {label}
    </span>
  );
}
