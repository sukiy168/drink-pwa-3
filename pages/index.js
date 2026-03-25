// ============================================================
//  首頁 — 建立揪團 / 加入揪團
// ============================================================
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createRoom, checkRoomExists, generateRoomCode } from "../src/hooks/useOrders";
import { SHOPS } from "../src/data/menu";

const S = {
  safe: { minHeight: "100dvh", background: "linear-gradient(160deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)", display: "flex", flexDirection: "column" },
  scroll: { flex: 1, overflowY: "auto", padding: "20px 20px 40px" },
  header: { textAlign: "center", padding: "40px 0 32px" },
  logo: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#8899aa", marginTop: 6 },
  card: { background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" },
  label: { fontSize: 12, fontWeight: 700, color: "#8899aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  input: { width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#333", outline: "none", background: "#fafafa" },
  codeInput: { letterSpacing: 6, fontSize: 24, fontWeight: 800, textAlign: "center" },
  tabs: { display: "flex", background: "#fff", borderRadius: 14, padding: 4, marginBottom: 14 },
  tab: { flex: 1, padding: "10px 0", borderRadius: 10, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#aaa", background: "none", border: "none" },
  tabActive: { background: "#1a1a2e", color: "#fff" },
  btn: { width: "100%", padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 16, border: "none" },
  hint: { fontSize: 12, color: "#aaa", marginTop: 8, textAlign: "center", background: "none", border: "none", width: "100%" },
  shopGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 },
  shopCard: { padding: "12px 10px", borderRadius: 14, border: "2px solid #eee", textAlign: "center", background: "#fafafa", cursor: "pointer" },
  shopEmoji: { fontSize: 28, display: "block", marginBottom: 4 },
  shopName: { fontSize: 13, color: "#555", fontWeight: 500 },
  err: { fontSize: 13, color: "#e53935", marginTop: 8, textAlign: "center" },
};

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState("join");
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [selectedShop, setSelectedShop] = useState(SHOPS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRoom, setLastRoom] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // 讀取本地儲存
    const id = localStorage.getItem("drinkUserId") || `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    localStorage.setItem("drinkUserId", id);
    setUserId(id);
    const name = localStorage.getItem("drinkUserName") || "";
    setUserName(name);
    const last = localStorage.getItem("drinkLastRoom") || "";
    setLastRoom(last);
  }, []);

  async function handleJoin() {
    setError("");
    if (!userName.trim()) return setError("請輸入你的暱稱");
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) return setError("請輸入 6 位房間碼");
    setLoading(true);
    try {
      const exists = await checkRoomExists(code);
      if (!exists) { setError("找不到這個房間，請確認房間碼"); return; }
      localStorage.setItem("drinkUserName", userName.trim());
      localStorage.setItem("drinkLastRoom", code);
      router.push(`/room/${code}?uid=${userId}&name=${encodeURIComponent(userName.trim())}`);
    } catch(e) { setError("加入失敗，請稍後再試"); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    setError("");
    if (!userName.trim()) return setError("請輸入你的暱稱");
    setLoading(true);
    try {
      const code = generateRoomCode();
      await createRoom({ roomCode: code, userId, userName: userName.trim(), shopId: selectedShop.id, shopName: selectedShop.name });
      localStorage.setItem("drinkUserName", userName.trim());
      localStorage.setItem("drinkLastRoom", code);
      router.push(`/room/${code}?uid=${userId}&name=${encodeURIComponent(userName.trim())}&host=1`);
    } catch(e) { setError("建立失敗，請稍後再試"); }
    finally { setLoading(false); }
  }

  return (
    <div style={S.safe}>
      <div style={S.scroll}>
        <div style={S.header}>
          <div style={S.logo}>🧋</div>
          <div style={S.title}>飲料訂購系統</div>
          <div style={S.subtitle}>揪朋友一起點，主揪負責下單</div>
        </div>

        {/* 暱稱 */}
        <div style={S.card}>
          <div style={S.label}>你的暱稱</div>
          <input style={S.input} placeholder="輸入你的名字（例如：小明）" value={userName}
            onChange={e => setUserName(e.target.value)} maxLength={10} />
        </div>

        {/* Tab */}
        <div style={S.tabs}>
          {["join","create"].map(t => (
            <button key={t} style={{...S.tab, ...(tab===t ? S.tabActive : {})}} onClick={() => { setTab(t); setError(""); }}>
              {t === "join" ? "加入揪團" : "我來揪團"}
            </button>
          ))}
        </div>

        {/* 加入 */}
        {tab === "join" && (
          <div style={S.card}>
            <div style={S.label}>房間碼</div>
            <input style={{...S.input, ...S.codeInput}} placeholder="A B C 1 2 3"
              value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={6} />
            {lastRoom && (
              <button style={S.hint} onClick={() => setRoomCode(lastRoom)}>
                上次的房間：{lastRoom}（點此填入）
              </button>
            )}
            {error && <div style={S.err}>{error}</div>}
            <button style={{...S.btn, background: "#4F86C6", opacity: loading ? 0.7 : 1}}
              onClick={handleJoin} disabled={loading}>
              {loading ? "加入中…" : "加入點餐 →"}
            </button>
          </div>
        )}

        {/* 建立 */}
        {tab === "create" && (
          <div style={S.card}>
            <div style={S.label}>選擇飲料店</div>
            <div style={S.shopGrid}>
              {SHOPS.map(shop => (
                <div key={shop.id} style={{...S.shopCard,
                  borderColor: selectedShop.id === shop.id ? shop.color : "#eee",
                  background: selectedShop.id === shop.id ? shop.color+"15" : "#fafafa",
                }} onClick={() => setSelectedShop(shop)}>
                  <span style={S.shopEmoji}>{shop.emoji}</span>
                  <span style={{...S.shopName, color: selectedShop.id === shop.id ? shop.color : "#555", fontWeight: selectedShop.id === shop.id ? 700 : 500}}>
                    {shop.name}
                  </span>
                </div>
              ))}
            </div>
            {error && <div style={S.err}>{error}</div>}
            <button style={{...S.btn, background: selectedShop.color, opacity: loading ? 0.7 : 1}}
              onClick={handleCreate} disabled={loading}>
              {loading ? "建立中…" : "建立揪團 🎉"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
