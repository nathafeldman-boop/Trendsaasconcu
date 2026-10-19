// The VSL player (components/vsl) plays scripted "films" made of real app
// screenshots (public/vsl, from scripts/capture-vsl.mjs) moved by a camera.
//
// Units, so the scripts read like the screenshots:
// - screen: CSS pixels of the app's viewport (browser 1440×900, phone 390×844)
// - image: CSS pixels of the screenshot (browser: the content right of the
//   288px sidebar, 1152 wide; phone: the whole page, 390 wide)
// - t: position in the scene, 0 → 1

export type Device = "browser" | "phone";

export type CameraKey = {
  t: number;
  /** Point of the screen kept at the center of the frame. Defaults to the screen's center. */
  x?: number;
  y?: number;
  /** 1 = the whole device fits the frame. */
  zoom?: number;
  /** How far the page is scrolled, in image pixels. */
  scroll?: number;
  /** Slight 3D tilt, in degrees. */
  tiltX?: number;
  tiltY?: number;
};

export type CursorKey = { t: number; x: number; y: number; click?: boolean };

export type Highlight = { from: number; to: number; rect: [number, number, number, number] };

export type Callout = { from: number; to: number; x: number; y: number; text: string; align?: "left" | "right" };

export type ScreenScene = {
  kind: "screen";
  id: string;
  chapter: string;
  /** *word* is shown in the accent color. */
  caption: string;
  seconds: number;
  device: Device;
  image: string;
  imageHeight: number;
  /** Browser scenes: the member area's fixed left column. */
  sidebar?: string;
  url?: string;
  camera: CameraKey[];
  cursor?: CursorKey[];
  highlights?: Highlight[];
  callouts?: Callout[];
  /** Shown in a corner, e.g. "Données de démonstration". */
  badge?: string;
};

export type TitleScene = {
  kind: "intro" | "outro";
  id: string;
  chapter: string;
  title: string;
  sub?: string;
  seconds: number;
  /** Screenshots floating behind the title. */
  images?: string[];
};

export type Scene = ScreenScene | TitleScene;

export type Film = { id: string; label: string; scenes: Scene[] };
