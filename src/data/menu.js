// ============================================================
//  飲料店菜單資料
//  可擴充更多店家，格式統一
// ============================================================

export const SHOPS = [
  { id: "guiji", name: "龜記茗品", emoji: "🐢", color: "#2E7D32" },
  { id: "gongcha", name: "貢茶", emoji: "👑", color: "#8B6914" },
  { id: "50lan", name: "50嵐", emoji: "🌊", color: "#0277BD" },
  { id: "custom", name: "自訂店家", emoji: "✏️", color: "#6A1B9A" },
];

export const MENUS = {
  guiji: {
    shopName: "龜記茗品",
    categories: {
      招牌系列: [
        { id: "g1", name: "龜苓膏鮮奶茶", price: 75, emoji: "🐢", desc: "招牌龜苓膏底，搭配濃醇鮮奶" },
        { id: "g2", name: "黑糖仙草鮮奶", price: 70, emoji: "🥛", desc: "現熬黑糖漿，仙草Q彈" },
        { id: "g3", name: "珍珠鮮奶茶", price: 65, emoji: "🧋", desc: "手工粉圓，每日新鮮製作" },
        { id: "g4", name: "芋頭鮮奶", price: 75, emoji: "🟣", desc: "台灣大甲芋頭，濃郁香氣" },
      ],
      鮮奶系列: [
        { id: "g5", name: "草莓鮮奶", price: 80, emoji: "🍓", desc: "新鮮草莓果泥，香甜滑順" },
        { id: "g6", name: "抹茶鮮奶", price: 70, emoji: "🍵", desc: "日本抹茶粉，微苦甘甜" },
        { id: "g7", name: "焦糖鮮奶", price: 70, emoji: "🍮", desc: "手工焦糖醬，濃郁香甜" },
      ],
      茶飲系列: [
        { id: "g8", name: "金萱烏龍", price: 50, emoji: "🍃", desc: "台灣高山茶，清香回甘" },
        { id: "g9", name: "四季春青茶", price: 45, emoji: "🌿", desc: "清爽甘甜，適合夏日" },
        { id: "g10", name: "阿薩姆紅茶", price: 45, emoji: "🫖", desc: "印度進口，濃郁茶香" },
      ],
      特調系列: [
        { id: "g11", name: "檸檬蜂蜜", price: 60, emoji: "🍋", desc: "新鮮現榨，酸甜開胃" },
        { id: "g12", name: "冬瓜檸檬", price: 55, emoji: "🍈", desc: "古早味冬瓜茶底，清涼消暑" },
        { id: "g13", name: "百香果綠茶", price: 60, emoji: "🌺", desc: "南洋百香果，熱帶風情" },
      ],
    },
  },
  gongcha: {
    shopName: "貢茶",
    categories: {
      招牌奶茶: [
        { id: "gc1", name: "珍珠奶茶", price: 65, emoji: "🧋", desc: "Q彈珍珠，濃醇奶茶" },
        { id: "gc2", name: "布丁奶茶", price: 70, emoji: "🍮", desc: "手工雞蛋布丁，細滑香甜" },
        { id: "gc3", name: "椰果奶茶", price: 65, emoji: "🥥", desc: "菲律賓椰果，清爽Q彈" },
      ],
      芝芝系列: [
        { id: "gc4", name: "芝芝莓莓", price: 85, emoji: "🍓", desc: "濃厚起司奶蓋，草莓茶底" },
        { id: "gc5", name: "芝芝烏龍", price: 80, emoji: "🍃", desc: "起司奶蓋搭配烏龍茶" },
        { id: "gc6", name: "芝芝抹抹", price: 85, emoji: "🍵", desc: "起司奶蓋搭配抹茶" },
      ],
      水果茶: [
        { id: "gc7", name: "多多綠茶", price: 60, emoji: "🟢", desc: "養樂多搭配清爽綠茶" },
        { id: "gc8", name: "葡萄多多", price: 65, emoji: "🍇", desc: "新鮮葡萄汁，酸甜開胃" },
      ],
    },
  },
  "50lan": {
    shopName: "50嵐",
    categories: {
      招牌系列: [
        { id: "f1", name: "四季春奶茶", price: 45, emoji: "🌿", desc: "清香四季春，滑順奶茶" },
        { id: "f2", name: "珍珠奶茶", price: 55, emoji: "🧋", desc: "古早味珍珠，濃郁奶茶" },
        { id: "f3", name: "波霸奶茶", price: 55, emoji: "🟤", desc: "大顆波霸，嚼勁十足" },
      ],
      茶類: [
        { id: "f4", name: "烏龍綠", price: 35, emoji: "🍵", desc: "清爽烏龍綠茶" },
        { id: "f5", name: "阿薩姆奶茶", price: 45, emoji: "🫖", desc: "濃郁阿薩姆，搭配鮮奶" },
        { id: "f6", name: "翡翠檸檬", price: 50, emoji: "🍋", desc: "四季春底，鮮榨檸檬" },
      ],
      冰沙: [
        { id: "f7", name: "芒果冰沙", price: 65, emoji: "🥭", desc: "愛文芒果，夏日必喝" },
        { id: "f8", name: "草莓冰沙", price: 65, emoji: "🍓", desc: "新鮮草莓果泥，酸甜冰涼" },
      ],
    },
  },
};

// 客製化選項
export const SIZES = [
  { label: "M", extraPrice: 0 },
  { label: "L", extraPrice: 10 },
];

export const SUGAR_LEVELS = ["無糖", "微糖", "半糖", "少糖", "全糖"];
export const ICE_LEVELS = ["去冰", "少冰", "正常冰", "多冰"];

export const ADD_ONS = [
  { id: "pearl", name: "珍珠", price: 10, emoji: "⚫" },
  { id: "pudding", name: "布丁", price: 15, emoji: "🍮" },
  { id: "grass_jelly", name: "仙草", price: 10, emoji: "🟫" },
  { id: "aloe", name: "蘆薈", price: 10, emoji: "🟢" },
  { id: "coconut", name: "椰果", price: 10, emoji: "🥥" },
];
