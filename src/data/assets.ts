import type { ActionId, Asset, CharacterViewId, ClosetItemId, ExpressionId, MouthId, PoseId } from "../types/editor";

export const assets: Asset[] = [
  { id: "bg-time-card", name: "Time Card", category: "Backgrounds", kind: "background", tags: ["title", "later", "time", "card"], color: "#244f50", thumbnail: "time-card" },
  { id: "prop-microwave", name: "Microwave", category: "Props", kind: "prop", tags: ["kitchen", "cook", "food"], color: "#e3e6e7", accent: "#36464c", thumbnail: "microwave" },
  { id: "prop-pizza", name: "Pizza", category: "Props", kind: "prop", tags: ["food", "dinner", "kitchen", "delivery"], color: "#e9bd62", accent: "#c65548", thumbnail: "pizza" },
  { id: "prop-clock", name: "Wall Clock", category: "Props", kind: "prop", tags: ["time", "clock", "waiting"], color: "#f2f6ee", accent: "#33484e", thumbnail: "clock" },
  { id: "prop-sofa", name: "Sofa", category: "Props", kind: "prop", tags: ["seat", "couch", "living room"], color: "#699890", accent: "#3d5755", thumbnail: "sofa" },
  { id: "prop-plant", name: "Potted Plant", category: "Props", kind: "prop", tags: ["room", "leaves", "plant"], color: "#609566", accent: "#c98273", thumbnail: "plant" },
  { id: "prop-dumbbell", name: "Dumbbell", category: "Props", kind: "prop", tags: ["gym", "fitness", "weight", "workout"], color: "#66737a", accent: "#2f3940", thumbnail: "dumbbell" },
  { id: "prop-shopping-bag", name: "Shopping Bag", category: "Props", kind: "prop", tags: ["mall", "shopping", "store", "bag"], color: "#d68a59", accent: "#f2e6cc", thumbnail: "shopping-bag" },
  { id: "prop-dinner-plate", name: "Dinner Plate", category: "Props", kind: "prop", tags: ["restaurant", "dinner", "food", "table"], color: "#f1eee2", accent: "#d07749", thumbnail: "plate" },
  { id: "char-businesswoman", name: "Businesswoman", category: "Characters", kind: "character", tags: ["woman", "office", "suit"], color: "#596678", accent: "#493124", thumbnail: "person", appearance: { outfit: "business", hair: "bob", skinColor: "#dca477" } },
  { id: "char-elegant", name: "Evening Guest", category: "Characters", kind: "character", tags: ["woman", "dress", "formal", "rich"], color: "#9b4773", accent: "#26232c", thumbnail: "person", appearance: { outfit: "dress", hair: "bun", skinColor: "#9a6248" } },
  { id: "char-executive", name: "Executive", category: "Characters", kind: "character", tags: ["man", "rich", "business", "luxury"], color: "#363242", accent: "#777b81", thumbnail: "person", appearance: { outfit: "luxury", hair: "short" } },
  { id: "char-traveler", name: "Traveler", category: "Characters", kind: "character", tags: ["worn", "homeless", "casual"], color: "#85816b", accent: "#634937", thumbnail: "person", appearance: { outfit: "worn", hair: "curly", skinColor: "#c78c62" } },
  { id: "bg-mall-exterior", name: "Mall Exterior", category: "Backgrounds", kind: "background", tags: ["mall", "shopping", "exterior", "outside", "plaza"], color: "#b9d8df", thumbnail: "mall-exterior" },
  { id: "bg-restaurant-exterior", name: "Restaurant Exterior", category: "Backgrounds", kind: "background", tags: ["restaurant", "cafe", "exterior", "outside", "patio"], color: "#d9bbb2", thumbnail: "restaurant-exterior" },
  { id: "bg-parking-lot", name: "Parking Lot", category: "Backgrounds", kind: "background", tags: ["parking", "car", "mall", "restaurant", "exterior", "outside"], color: "#a8bcbf", thumbnail: "parking-lot" },
  { id: "bg-sidewalk", name: "Neighborhood Sidewalk", category: "Backgrounds", kind: "background", tags: ["sidewalk", "street", "walking", "outside"], color: "#bddfd8", thumbnail: "sidewalk" },
  { id: "bg-alley", name: "Alley", category: "Backgrounds", kind: "background", tags: ["alley", "city", "street", "outside"], color: "#adb5bd", thumbnail: "alley" },
  { id: "bg-restaurant", name: "Restaurant", category: "Backgrounds", kind: "background", tags: ["restaurant", "food", "dining", "cafe"], color: "#dabac0", thumbnail: "restaurant" },
  { id: "bg-gym", name: "Gym", category: "Backgrounds", kind: "background", tags: ["gym", "fitness", "exercise", "weights"], color: "#a6c5c5", thumbnail: "gym" },
  { id: "char-young-man", name: "Young Man", category: "Characters", kind: "character", tags: ["person", "male", "happy", "explainer"], color: "#7fa9d6", accent: "#203047", thumbnail: "person" },
  { id: "char-young-woman", name: "Young Woman", category: "Characters", kind: "character", tags: ["person", "female", "host", "friendly"], color: "#df8aa7", accent: "#392237", thumbnail: "person" },
  { id: "char-business", name: "Business Person", category: "Characters", kind: "character", tags: ["office", "money", "serious"], color: "#566b78", accent: "#2b3134", thumbnail: "person" },
  { id: "char-scientist", name: "Scientist", category: "Characters", kind: "character", tags: ["lab", "medical", "school"], color: "#f2f1e8", accent: "#3a7f75", thumbnail: "person" },
  { id: "char-worker", name: "Worker", category: "Characters", kind: "character", tags: ["factory", "warehouse", "shop"], color: "#e0a343", accent: "#57401d", thumbnail: "person" },
  { id: "bg-blank-room", name: "Blank Room", category: "Backgrounds", kind: "background", tags: ["blank", "room", "scratch", "builder"], color: "#d2d0c6", accent: "#9a9588", thumbnail: "blank-room" },
  { id: "bg-blank-outdoor", name: "Blank Outdoor", category: "Backgrounds", kind: "background", tags: ["blank", "outside", "park", "street", "builder"], color: "#b9c6ca", accent: "#8aa174", thumbnail: "blank-outdoor" },
  { id: "bg-bedroom", name: "Bedroom", category: "Backgrounds", kind: "background", tags: ["room", "home", "sleep", "bed"], color: "#b9c1c8", accent: "#d4a66a", thumbnail: "bedroom" },
  { id: "bg-kitchen", name: "Kitchen", category: "Backgrounds", kind: "background", tags: ["kitchen", "home", "food", "fridge", "cabinets"], color: "#d0a176", accent: "#4d586d", thumbnail: "kitchen" },
  { id: "bg-office", name: "Office", category: "Backgrounds", kind: "background", tags: ["office", "work", "money", "desk"], color: "#aab7bb", accent: "#7c8d79", thumbnail: "office" },
  { id: "bg-street", name: "City Sidewalk", category: "Backgrounds", kind: "background", tags: ["street", "city", "outside"], color: "#aeb1ac", accent: "#c9ad55", thumbnail: "street" },
  { id: "bg-lab", name: "Laboratory", category: "Backgrounds", kind: "background", tags: ["lab", "science", "medical", "bottle", "potion"], color: "#b8c8c4", accent: "#55a5a1", thumbnail: "lab" },
  { id: "bg-store", name: "Convenience Store", category: "Backgrounds", kind: "background", tags: ["shop", "food", "money", "shelf"], color: "#b8b5aa", accent: "#db5b48", thumbnail: "store" },
  { id: "bg-hospital", name: "Hospital Room", category: "Backgrounds", kind: "background", tags: ["medical", "doctor", "room", "bed"], color: "#c9d9d8", accent: "#68a0b0", thumbnail: "hospital" },
  { id: "bg-classroom", name: "Classroom", category: "Backgrounds", kind: "background", tags: ["school", "learning", "room", "board"], color: "#b8a886", accent: "#446d57", thumbnail: "classroom" },
  { id: "bg-park", name: "Park", category: "Backgrounds", kind: "background", tags: ["park", "tree", "bench", "outside"], color: "#b7c6aa", accent: "#6f8b5a", thumbnail: "park" },
  { id: "bg-night", name: "Night Street", category: "Backgrounds", kind: "background", tags: ["night", "street", "dramatic"], color: "#38414a", accent: "#e4b649", thumbnail: "street" },
  { id: "prop-phone", name: "Phone", category: "Props", kind: "prop", tags: ["phone", "tech", "holding"], color: "#2d3440", accent: "#71b9d6", thumbnail: "phone" },
  { id: "prop-brand-sign", name: "Brand Sign", category: "Props", kind: "prop", tags: ["brand", "logo", "store", "editable", "sign", "display"], color: "#eef5f2", accent: "#27827b", thumbnail: "brand-sign" },
  { id: "prop-money", name: "Money Stack", category: "Props", kind: "prop", tags: ["money", "cash", "finance"], color: "#7cb783", accent: "#e7e2b0", thumbnail: "money" },
  { id: "prop-laptop", name: "Laptop", category: "Props", kind: "prop", tags: ["office", "computer", "work"], color: "#5d6870", accent: "#b6d5db", thumbnail: "laptop" },
  { id: "prop-chart", name: "Chart Board", category: "Props", kind: "prop", tags: ["chart", "money", "explain"], color: "#f0eee2", accent: "#d15b4a", thumbnail: "chart" },
  { id: "prop-cup", name: "Cup", category: "Props", kind: "prop", tags: ["drink", "kitchen", "office"], color: "#d7e0df", accent: "#b65043", thumbnail: "cup" },
  { id: "prop-paper", name: "Document", category: "Props", kind: "prop", tags: ["paper", "document", "office"], color: "#f4f0dc", accent: "#4a6f8f", thumbnail: "paper" },
  { id: "prop-box", name: "Box", category: "Props", kind: "prop", tags: ["warehouse", "package", "shop"], color: "#b98b54", accent: "#7d5530", thumbnail: "box" },
  { id: "prop-bed", name: "Bed", category: "Props", kind: "prop", tags: ["bedroom", "sleep", "home"], color: "#a8bdd4", accent: "#d9c7a6", thumbnail: "bed" },
  { id: "prop-chair", name: "Chair", category: "Props", kind: "prop", tags: ["chair", "sitting", "office", "school"], color: "#7d8b91", accent: "#3e484c", thumbnail: "chair" },
  { id: "prop-bench", name: "Bench", category: "Props", kind: "prop", tags: ["bench", "sitting", "park", "room"], color: "#8c7660", accent: "#4d4034", thumbnail: "bench" },
  { id: "prop-tree", name: "Tree", category: "Props", kind: "prop", tags: ["tree", "park", "forest", "outside"], color: "#6f8b5a", accent: "#6c5137", thumbnail: "tree" },
  { id: "prop-table", name: "Table", category: "Props", kind: "prop", tags: ["table", "desk", "room", "office"], color: "#9b7653", accent: "#574333", thumbnail: "table" },
  { id: "prop-car", name: "Car", category: "Props", kind: "prop", tags: ["car", "street", "city", "outside"], color: "#9eb4c9", accent: "#2b3134", thumbnail: "car" },
  { id: "prop-shelf", name: "Shelf", category: "Props", kind: "prop", tags: ["shelf", "store", "bedroom", "office"], color: "#9c8062", accent: "#5b4532", thumbnail: "shelf" },
  { id: "prop-lab-bottle", name: "Potion Bottle", category: "Props", kind: "prop", tags: ["lab", "science", "bottle", "potion"], color: "#72b9b1", accent: "#d7f0e8", thumbnail: "bottle" },
  { id: "prop-magnifier", name: "Magnifier", category: "Props", kind: "prop", tags: ["lab", "science", "detective", "glass"], color: "#d7edf0", accent: "#47565c", thumbnail: "magnifier" },
  { id: "prop-window", name: "Window", category: "Props", kind: "prop", tags: ["window", "room", "house", "background"], color: "#cfe0e4", accent: "#7c8d96", thumbnail: "window" },
  { id: "prop-lamp", name: "Lamp", category: "Props", kind: "prop", tags: ["lamp", "bedroom", "living room", "light"], color: "#e6c66a", accent: "#6c5c48", thumbnail: "lamp" },
  { id: "shape-arrow", name: "Arrow", category: "Shapes", kind: "shape", tags: ["arrow", "pointing", "highlight"], color: "#e25f4b", accent: "#1f2328", thumbnail: "arrow" },
  { id: "shape-bubble", name: "Speech Bubble", category: "Shapes", kind: "shape", tags: ["talk", "caption", "explain"], color: "#fff8da", accent: "#1f2328", thumbnail: "bubble" },
  { id: "effect-burst", name: "Impact Burst", category: "Effects", kind: "effect", tags: ["shock", "pop", "highlight"], color: "#f0ca4d", accent: "#d85645", thumbnail: "burst" },
  { id: "effect-glow", name: "Soft Glow", category: "Effects", kind: "effect", tags: ["glow", "subtle", "light", "highlight"], color: "#f5d86a", accent: "#fff1a8", thumbnail: "glow" },
  { id: "effect-speed-lines", name: "Speed Lines", category: "Effects", kind: "effect", tags: ["speed", "motion", "action", "running"], color: "#f7f1df", accent: "#1f2328", thumbnail: "speed-lines" },
  { id: "effect-dust", name: "Dust Motes", category: "Effects", kind: "effect", tags: ["dust", "subtle", "air", "room"], color: "#eadfbf", accent: "#ffffff", thumbnail: "dust" },
  { id: "effect-question", name: "Question Marks", category: "Effects", kind: "effect", tags: ["confused", "thinking", "question"], color: "#74a9c9", accent: "#1f2328", thumbnail: "question" },
  { id: "text-caption", name: "Shorts Caption", category: "Text", kind: "text", tags: ["text", "subtitle", "caption"], color: "#ffffff", accent: "#111111", thumbnail: "text" }
];

export const expressions: Array<{ id: ExpressionId; name: string }> = [
  { id: "neutral", name: "Neutral" },
  { id: "happy", name: "Happy" },
  { id: "sad", name: "Sad" },
  { id: "angry", name: "Angry" },
  { id: "shocked", name: "Shocked" },
  { id: "thinking", name: "Thinking" }
];

export const poses: Array<{ id: PoseId; name: string }> = [
  { id: "arms-down", name: "Arms Down" },
  { id: "explaining", name: "Explaining" },
  { id: "point-left", name: "Point Left" },
  { id: "point-right", name: "Point Right" },
  { id: "palms-up", name: "Palms Up" },
  { id: "hands-hips", name: "Hands On Hips" }
];

export const mouths: Array<{ id: MouthId; name: string }> = [
  { id: "auto", name: "Auto" },
  { id: "flat", name: "Flat" },
  { id: "smile", name: "Smile" },
  { id: "frown", name: "Frown" },
  { id: "open", name: "Open" },
  { id: "wide-open", name: "Wide Open" },
  { id: "talk-small", name: "Talk Small" },
  { id: "talk-wide", name: "Talk Wide" },
  { id: "smirk", name: "Smirk" }
];

export const actions: Array<{ id: ActionId; name: string }> = [
  { id: "idle", name: "Idle" },
  { id: "talking", name: "Talking" },
  { id: "walking", name: "Walking" },
  { id: "running", name: "Running" },
  { id: "sitting", name: "Sitting" },
  { id: "looking-up", name: "Looking Up" },
  { id: "looking-down", name: "Looking Down" },
  { id: "thinking", name: "Thinking" },
  { id: "waving", name: "Waving" }
];

export const characterViews: Array<{ id: CharacterViewId; name: string }> = [
  { id: "front", name: "Front" },
  { id: "three-quarter-left", name: "3/4 Left" },
  { id: "three-quarter-right", name: "3/4 Right" },
  { id: "side-left", name: "Side Left" },
  { id: "side-right", name: "Side Right" },
  { id: "seated-side", name: "Seated Side" }
];

export const closetItems: Array<{ id: ClosetItemId; name: string }> = [
  { id: "hat", name: "Hat" },
  { id: "glasses", name: "Glasses" },
  { id: "mustache", name: "Mustache" },
  { id: "bowtie", name: "Bowtie" },
  { id: "lab-coat", name: "Lab Coat" },
  { id: "jacket", name: "Jacket" },
  { id: "backpack", name: "Backpack" },
  { id: "phone-hand", name: "Phone" },
  { id: "paper-hand", name: "Paper" },
  { id: "coffee-hand", name: "Coffee" }
];

export function assetById(id: string) {
  return assets.find((asset) => asset.id === id);
}
