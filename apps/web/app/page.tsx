"use client";

import React from "react";

import { useSocket } from "../context/SocketProvider";
import styles from "./page.module.css";

export default function Page(): JSX.Element {
  const [message, setMessage] = React.useState<string>("");

  const { sendMessage } = useSocket();

  return (
    <div className={styles["container"]}>
      <div>
        <input
          className={styles["chat-input"]}
          type="text"
          placeholder="Send Message..."
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
        />
      </div>
      <div>
        <button
          className={styles["chat-sendBtn"]}
          onClick={() => sendMessage(message)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
