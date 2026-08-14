"use client";

import { useEffect, useState } from "react";

export default function ChatPanel({ threadId, token, role = "owner" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function loadMessages() {
    if (!threadId && !token) return;
    const query = token ? `token=${encodeURIComponent(token)}` : `threadId=${encodeURIComponent(threadId)}`;
    const response = await fetch(`/api/chat?${query}&_=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || "Chat unavailable."); return; }
    setMessages(data.messages || []);
    setStatus("");
  }

  useEffect(() => {
    if (!open) return undefined;
    loadMessages();
    const timer = setInterval(loadMessages, 5000);
    return () => clearInterval(timer);
  }, [open, threadId, token]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ threadId, token, message }) });
    const data = await response.json();
    if (!response.ok) setStatus(data.error || "Could not send message.");
    else { setMessages((current) => [...current, data.message]); setMessage(""); setStatus(""); }
    setBusy(false);
  }

  function handleMessageKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  if (!threadId && !token) return null;
  return <div className={`chat-panel ${open ? "open" : ""}`}>
    <button className="chat-toggle" onClick={() => setOpen((value) => !value)} type="button">{open ? "Close private chat" : role === "owner" ? "Reply privately" : "Chat privately with owner"}</button>
    {open ? <div className="chat-box"><div className="chat-note">Anonymous text chat. Phone numbers are never shared. This chat expires after 48 hours.</div><div className="chat-messages">{messages.length === 0 ? <span className="chat-empty">No replies yet.</span> : messages.map((item) => <div className={`chat-message ${item.sender === role ? "mine" : "theirs"}`} key={item.id}><span>{item.body}</span><small>{item.sender === role ? "You" : item.sender === "owner" ? "Owner" : "Scanner"}</small></div>)}</div><div className="chat-compose"><input aria-label="Private chat message" maxLength={500} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleMessageKeyDown} placeholder="Write a private reply..." value={message} /><button disabled={busy || !message.trim()} onClick={sendMessage} type="button">Send</button></div>{status ? <div className="chat-status">{status}</div> : null}</div> : null}
  </div>;
}
