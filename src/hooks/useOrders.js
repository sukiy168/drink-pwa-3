// ============================================================
//  useOrders Hook
//  負責與 Firebase Realtime Database 溝通
//  提供訂單的讀寫、即時監聽功能
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { ref, set, remove, onValue, off, update, get } from "firebase/database";
import { db } from "../config/firebase";

export function useOrders(roomCode, userId) {
  const [allOrders, setAllOrders] = useState({});   // { userId: { userName, items: {} } }
  const [roomInfo, setRoomInfo] = useState(null);   // { status, shopName, hostName, ... }
  const [loading, setLoading] = useState(true);

  // 即時監聽整個房間資料
  useEffect(() => {
    // SSR 保護：db 為 null 時（server side build）直接跳過
    if (!roomCode || !db) { setLoading(false); return; }
    setLoading(true);

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomInfo({
          status: data.status,
          shopId: data.shopId,
          shopName: data.shopName,
          hostName: data.hostName,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
        });
        setAllOrders(data.orders || {});
      }
      setLoading(false);
    });

    return () => off(roomRef, "value", unsubscribe);
  }, [roomCode]);

  // 新增 / 更新一個品項
  const addItem = useCallback(async (userName, item) => {
    if (!db) return;
    const itemId = `item_${Date.now()}`;
    await set(ref(db, `rooms/${roomCode}/orders/${userId}/items/${itemId}`), item);
    await set(ref(db, `rooms/${roomCode}/orders/${userId}/userName`), userName);
    await set(ref(db, `rooms/${roomCode}/orders/${userId}/updatedAt`), Date.now());
  }, [roomCode, userId]);

  // 刪除一個品項
  const removeItem = useCallback(async (itemId) => {
    if (!db) return;
    await remove(ref(db, `rooms/${roomCode}/orders/${userId}/items/${itemId}`));
  }, [roomCode, userId]);

  // 清空自己的訂單
  const clearMyOrder = useCallback(async () => {
    if (!db) return;
    await remove(ref(db, `rooms/${roomCode}/orders/${userId}`));
  }, [roomCode, userId]);

  // 關閉訂單（主揪專用）
  const closeOrder = useCallback(async () => {
    if (!db) return;
    await set(ref(db, `rooms/${roomCode}/status`), "closed");
  }, [roomCode]);

  // 重開訂單
  const reopenOrder = useCallback(async () => {
    if (!db) return;
    await set(ref(db, `rooms/${roomCode}/status`), "open");
  }, [roomCode]);

  return {
    allOrders,
    roomInfo,
    loading,
    addItem,
    removeItem,
    clearMyOrder,
    closeOrder,
    reopenOrder,
    myOrder: allOrders[userId] || null,
  };
}

// ============================================================
//  房間管理工具函式
// ============================================================

// 產生 6 位英數字房間碼
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 建立新房間
export async function createRoom({ roomCode, userId, userName, shopId, shopName }) {
  if (!db) throw new Error("Firebase 尚未初始化，請確認 Vercel 環境變數設定");
  await set(ref(db, `rooms/${roomCode}`), {
    createdAt: Date.now(),
    createdBy: userId,
    hostName: userName,
    shopId,
    shopName,
    status: "open",
    orders: {},
  });
}

// 檢查房間是否存在
export async function checkRoomExists(roomCode) {
  if (!db) throw new Error("Firebase 尚未初始化，請確認 Vercel 環境變數設定");
  const snapshot = await get(ref(db, `rooms/${roomCode}`));
  return snapshot.exists();
}

// 產生使用者 ID（儲存在 AsyncStorage）
export function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
