// ============================================================
//  房間頁 — 菜單 / 訂單 / 彙整（全部在同一頁用 state 切換）
// ============================================================
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useOrders } from "../../src/hooks/useOrders";
import { MENUS, SHOPS, SIZES, SUGAR_LEVELS, ICE_LEVELS, ADD_ONS } from "../../src/data/menu";

// ── 顏色 / 常數 ────────────────────────────────────────────
const C = {
  bg: "#f8f8f8",
  white: "#fff",
  border: "#f0f0f0",
  text: "#222",
  sub: "#888",
  lite: "#bbb",
  red: "#ff6b6b",
};

export default function RoomPage() {
  const router = useRouter();
  const { code, uid, name, host } = router.query;
  const isHost = host === "1";

  const [screen, setScreen] = useState("menu"); // menu | detail | cart | group
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [toast, setToast] = useState("");

  const { allOrders, roomInfo, addItem, removeItem, clearMyOrder, closeOrder, reopenOrder, myOrder, loading }
    = useOrders(code, uid);

  const shopId = roomInfo?.shopId || "guiji";
  const shopInfo = SHOPS.find(s => s.id === shopId) || SHOPS[0];
  const menu = MENUS[shopId] || MENUS.guiji;
  const categories = Object.keys(menu.categories);
  const currentCat = activeCategory || categories[0];

  const myItems = myOrder?.items ? Object.entries(myOrder.items) : [];
  const myTotal = myItems.reduce((s, [, i]) => s + i.totalPrice, 0);
  const myCount = myItems.reduce((s, [, i]) => s + i.qty, 0);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function shareRoom() {
    const url = `${window.location.origin}/?room=${code}`;
    if (navigator.share) {
      navigator.share({ title: "一起來點飲料！", text: `房間碼：${code}\n${url}` });
    } else {
      navigator.clipboard.writeText(`房間碼：${code}\n一起點飲料：${url}`);
      showToast("🔗 已複製分享連結！");
    }
  }

  if (!code || loading) return <LoadingScreen />;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: C.bg, position: "relative", overflow: "hidden" }}>
      {toast && <Toast msg={toast} />}

      {screen === "menu" && (
        <MenuView
          code={code} shopInfo={shopInfo} menu={menu} currentCat={currentCat}
          categories={categories} setActiveCategory={setActiveCategory}
          allOrders={allOrders} myCount={myCount} myTotal={myTotal}
          userName={name} isHost={isHost} isClosed={roomInfo?.status === "closed"}
          onItemClick={item => { setSelectedItem(item); setScreen("detail"); }}
          onCartClick={() => setScreen("cart")}
          onGroupClick={() => setScreen("group")}
          onShare={shareRoom}
        />
      )}

      {screen === "detail" && selectedItem && (
        <DetailView
          item={selectedItem} shopInfo={shopInfo}
          isClosed={roomInfo?.status === "closed"}
          onBack={() => setScreen("menu")}
          onAdd={async (orderItem) => {
            await addItem(name, orderItem);
            showToast(`已加入「${selectedItem.name}」🛒`);
            setScreen("menu");
          }}
        />
      )}

      {screen === "cart" && (
        <CartView
          myItems={myItems} myTotal={myTotal} myCount={myCount}
          shopInfo={shopInfo} userName={name} isHost={isHost}
          onBack={() => setScreen("menu")}
          onRemove={removeItem}
          onClear={clearMyOrder}
          onGroup={() => setScreen("group")}
          showToast={showToast}
        />
      )}

      {screen === "group" && (
        <GroupView
          allOrders={allOrders} shopInfo={shopInfo} roomInfo={roomInfo}
          isHost={isHost} userId={uid}
          onBack={() => setScreen("menu")}
          onClose={closeOrder} onReopen={reopenOrder}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MenuView
// ══════════════════════════════════════════════════════════
function MenuView({ code, shopInfo, menu, currentCat, categories, setActiveCategory,
  allOrders, myCount, myTotal, userName, isHost, isClosed,
  onItemClick, onCartClick, onGroupClick, onShare }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "12px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>{shopInfo.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{menu.shopName}</div>
              <div style={{ fontSize: 11, color: C.sub }}>房間碼：{code}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn label="分享 🔗" onClick={onShare} bg="#f0f0f0" color="#555" small />
            {isHost && <Btn label="彙整 📋" onClick={onGroupClick} bg={shopInfo.color} small />}
          </div>
        </div>

        {/* 人員列 */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
          {Object.entries(allOrders).map(([uid, order]) => {
            const cnt = order.items ? Object.keys(order.items).length : 0;
            return (
              <div key={uid} style={{ flexShrink: 0, background: "#f5f5f5", borderRadius: 20, padding: "4px 10px", fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{order.userName}</span>
                <span style={{ color: C.sub }}> {cnt}杯</span>
              </div>
            );
          })}
        </div>

        {/* 分類 */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 500,
                background: currentCat === cat ? shopInfo.color : "#f0f0f0",
                color: currentCat === cat ? "#fff" : "#666" }}>
              {cat}
            </button>
          ))}
        </div>

        {isClosed && (
          <div style={{ background: "#fce4ec", color: "#c62828", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: "center" }}>
            🔒 已截止收單，無法再修改訂單
          </div>
        )}
      </div>

      {/* 品項列表 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px", paddingBottom: myCount > 0 ? 90 : 20 }}>
        {(menu.categories[currentCat] || []).map(item => (
          <div key={item.id} onClick={() => onItemClick(item)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              background: C.white, borderRadius: 14, padding: 14, marginBottom: 10,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{ fontSize: 30, background: "#fafafa", borderRadius: 10, padding: "6px 8px", flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{item.name}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: shopInfo.color, fontSize: 16 }}>NT${item.price}</div>
              <div style={{ fontSize: 11, color: C.lite }}>起</div>
            </div>
          </div>
        ))}
      </div>

      {/* 購物車按鈕 */}
      {myCount > 0 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: C.white, borderTop: `1px solid ${C.border}` }}>
          <Btn label={`🛒 查看訂單（${myCount} 杯 · NT$${myTotal}）`} onClick={onCartClick} bg={shopInfo.color} full />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  DetailView（客製化）
// ══════════════════════════════════════════════════════════
function DetailView({ item, shopInfo, isClosed, onBack, onAdd }) {
  const [size, setSize] = useState("M");
  const [sugar, setSugar] = useState("半糖");
  const [ice, setIce] = useState("少冰");
  const [addOns, setAddOns] = useState([]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const sizeExtra = SIZES.find(s => s.label === size)?.extraPrice || 0;
  const addOnTotal = addOns.reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + sizeExtra + addOnTotal;
  const total = unitPrice * qty;

  function toggleAddOn(ao) {
    setAddOns(p => p.find(a => a.id === ao.id) ? p.filter(a => a.id !== ao.id) : [...p, ao]);
  }

  async function handleAdd() {
    if (isClosed) return alert("訂單已截止，無法新增");
    setAdding(true);
    await onAdd({ name: item.name, emoji: item.emoji, size, sugar, ice, addOns: addOns.map(a => a.name), qty, unitPrice, totalPrice: total });
    setAdding(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 100 }}>
        {/* 返回 */}
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.sub, fontSize: 14, padding: "4px 0", marginBottom: 12 }}>← 返回菜單</button>

        {/* 品項卡 */}
        <div style={{ textAlign: "center", background: C.white, borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 60 }}>{item.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10, color: C.text }}>{item.name}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{item.desc}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: shopInfo.color, marginTop: 8 }}>NT${item.price} 起</div>
        </div>

        <OptSection title="🥤 尺寸">
          {SIZES.map(s => (
            <OptChip key={s.label} label={s.label} sub={s.extraPrice > 0 ? `+${s.extraPrice}` : ""} active={size === s.label} color={shopInfo.color} onClick={() => setSize(s.label)} />
          ))}
        </OptSection>
        <OptSection title="🍬 甜度">
          {SUGAR_LEVELS.map(s => <OptChip key={s} label={s} active={sugar === s} color={shopInfo.color} onClick={() => setSugar(s)} />)}
        </OptSection>
        <OptSection title="🧊 冰量">
          {ICE_LEVELS.map(s => <OptChip key={s} label={s} active={ice === s} color={shopInfo.color} onClick={() => setIce(s)} />)}
        </OptSection>
        <OptSection title="➕ 加料（可複選）">
          {ADD_ONS.map(ao => (
            <OptChip key={ao.id} label={`${ao.emoji}${ao.name}`} sub={`+${ao.price}`} active={!!addOns.find(a => a.id === ao.id)} color={shopInfo.color} onClick={() => toggleAddOn(ao)} />
          ))}
        </OptSection>
        <OptSection title="📦 數量">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 40, height: 40, borderRadius: 10, background: "#eee", fontSize: 20, fontWeight: 700 }}>－</button>
            <span style={{ fontSize: 22, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{qty}</span>
            <button onClick={() => setQty(q => q+1)} style={{ width: 40, height: 40, borderRadius: 10, background: shopInfo.color, color: "#fff", fontSize: 20, fontWeight: 700 }}>＋</button>
          </div>
        </OptSection>
      </div>

      <div style={{ padding: "12px 16px", background: C.white, borderTop: `1px solid ${C.border}` }}>
        <Btn label={adding ? "加入中…" : `加入訂單 · NT$${total}`} onClick={handleAdd} bg={shopInfo.color} full disabled={adding || isClosed} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CartView
// ══════════════════════════════════════════════════════════
function CartView({ myItems, myTotal, myCount, shopInfo, userName, isHost, onBack, onRemove, onClear, onGroup, showToast }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{userName} 的訂單</div>
          <div style={{ fontSize: 12, color: C.sub }}>共 {myCount} 杯 · NT${myTotal}</div>
        </div>
        {myItems.length > 0 && (
          <button onClick={() => { if (confirm("確定清空所有品項？")) onClear(); }} style={{ background: "#fff0f0", border: "none", color: C.red, fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>清空</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 120 }}>
        {myItems.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: C.lite }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧋</div>
            <div>還沒有點餐</div>
          </div>
        ) : myItems.map(([id, item]) => (
          <div key={id} style={{ display: "flex", justifyContent: "space-between", background: C.white, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 10, flex: 1 }}>
              <span style={{ fontSize: 28 }}>{item.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                  {item.size} · {item.sugar} · {item.ice}{item.addOns?.length ? ` · ${item.addOns.join("/")}` : ""}
                </div>
                <div style={{ fontSize: 12, color: C.lite }}>x{item.qty} · NT${item.unitPrice}/杯</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontWeight: 700, color: shopInfo.color }}>NT${item.totalPrice}</span>
              <button onClick={() => onRemove(id)} style={{ background: "#fff0f0", border: "none", color: C.red, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>移除</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        {myItems.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            <span>小計</span>
            <span style={{ color: shopInfo.color }}>NT${myTotal}</span>
          </div>
        )}
        <Btn label="← 繼續點餐" onClick={onBack} bg="#f0f0f0" color="#555" full />
        {isHost && <Btn label="📋 查看所有人的訂單" onClick={onGroup} bg={shopInfo.color} full />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  GroupView（主揪視角）
// ══════════════════════════════════════════════════════════
function GroupView({ allOrders, shopInfo, roomInfo, isHost, userId, onBack, onClose, onReopen, showToast }) {
  const isClosed = roomInfo?.status === "closed";

  const userOrders = useMemo(() => {
    return Object.entries(allOrders).map(([uid, order]) => {
      const items = order.items ? Object.entries(order.items) : [];
      const total = items.reduce((s, [, i]) => s + i.totalPrice, 0);
      const count = items.reduce((s, [, i]) => s + i.qty, 0);
      return { uid, userName: order.userName || "未知", items, total, count };
    }).filter(u => u.items.length > 0);
  }, [allOrders]);

  const grandTotal = userOrders.reduce((s, u) => s + u.total, 0);
  const grandCount = userOrders.reduce((s, u) => s + u.count, 0);

  const orderText = useMemo(() => {
    let t = `🧋 ${roomInfo?.shopName || "飲料訂單"}\n${"─".repeat(24)}\n`;
    userOrders.forEach(u => {
      t += `\n👤 ${u.userName}：\n`;
      u.items.forEach(([, i]) => {
        const ao = i.addOns?.length ? ` +${i.addOns.join("/")}` : "";
        t += `  • ${i.name} ${i.size}/${i.sugar}/${i.ice}${ao} ×${i.qty}  NT$${i.totalPrice}\n`;
      });
      t += `  小計：NT$${u.total}\n`;
    });
    t += `${"─".repeat(24)}\n📦 共 ${grandCount} 杯  合計：NT$${grandTotal}`;
    return t;
  }, [userOrders, grandTotal, grandCount, roomInfo]);

  async function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "飲料訂單清單", text: orderText });
    } else {
      await navigator.clipboard.writeText(orderText);
      showToast("✅ 已複製下單清單！");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>📋 彙整訂單</div>
          <div style={{ fontSize: 12, color: C.sub }}>{userOrders.length} 人 · 共 {grandCount} 杯</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 12, background: isClosed ? "#fce4ec" : "#e8f5e9", color: isClosed ? "#c62828" : "#2E7D32" }}>
            {isClosed ? "🔒 已截止" : "🟢 收單中"}
          </span>
          <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", color: "#555", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>返回</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: 140 }}>
        {userOrders.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: C.lite }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <div>還沒有人點餐</div>
          </div>
        ) : userOrders.map(u => (
          <div key={u.uid} style={{ background: C.white, borderRadius: 14, padding: 14, marginBottom: 12, borderLeft: `3px solid ${u.uid === userId ? shopInfo.color : "#ddd"}`, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{u.uid === userId ? "⭐ " : ""}{u.userName}</span>
              <span style={{ fontWeight: 700, color: shopInfo.color }}>NT${u.total}</span>
            </div>
            {u.items.map(([id, item]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
                <div>
                  <span style={{ fontSize: 18, marginRight: 6 }}>{item.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                  <div style={{ fontSize: 12, color: C.sub, paddingLeft: 24, marginTop: 2 }}>
                    {item.size} / {item.sugar} / {item.ice}{item.addOns?.length ? ` / ${item.addOns.join("/")}` : ""} ×{item.qty}
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: shopInfo.color, alignSelf: "center" }}>NT${item.totalPrice}</span>
              </div>
            ))}
          </div>
        ))}

        {/* 總計 */}
        {userOrders.length > 0 && (
          <>
            <div style={{ background: shopInfo.color, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 15 }}>總計</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 26 }}>NT${grandTotal}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 }}>共 {grandCount} 杯 · {userOrders.length} 人</div>
            </div>

            {/* 下單清單預覽 */}
            <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "#8899aa", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>下單清單預覽</div>
              <pre style={{ color: "#ccc", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{orderText}</pre>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: 16, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        {userOrders.length > 0 && <Btn label="📱 複製 + 分享下單清單" onClick={handleShare} bg={shopInfo.color} full />}
        {isHost && (
          <Btn
            label={isClosed ? "🔓 重新開放訂單" : "🔒 關閉收單"}
            onClick={() => { if (confirm(isClosed ? "重新開放讓大家繼續點餐？" : "確定關閉收單？")) isClosed ? onReopen() : onClose(); }}
            bg={isClosed ? "#4CAF50" : C.red} full
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  共用小元件
// ══════════════════════════════════════════════════════════
function Btn({ label, onClick, bg, color = "#fff", small, full, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: small ? "7px 12px" : "14px 20px", borderRadius: small ? 20 : 12,
        background: disabled ? "#ccc" : bg, color, border: "none",
        fontSize: small ? 13 : 15, fontWeight: 700, width: full ? "100%" : "auto",
        opacity: disabled ? 0.7 : 1 }}>
      {label}
    </button>
  );
}

function OptSection({ title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

function OptChip({ label, sub, active, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${active ? color : "#e0e0e0"}`,
        background: active ? color : "#f5f5f5", color: active ? "#fff" : "#555",
        fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
      {label}
      {sub && <span style={{ fontSize: 11, opacity: 0.8 }}>{sub}</span>}
    </button>
  );
}

function Toast({ msg }) {
  return (
    <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.82)", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 500, zIndex: 9999, whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, background: "#1a1a2e", color: "#fff" }}>
      <div style={{ fontSize: 48 }}>🧋</div>
      <div style={{ fontSize: 16 }}>載入中…</div>
    </div>
  );
}
