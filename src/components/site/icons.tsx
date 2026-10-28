// Lichte lijn-iconen (1.6px stroke), passend bij de rustige eco-stijl.
type P = React.SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p });

export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconBag = (p: P) => (<svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconChevron = (p: P) => (<svg {...base({ width: 14, height: 14, ...p })}><path d="m6 9 6 6 6-6" /></svg>);
export const IconArrow = (p: P) => (<svg {...base({ width: 18, height: 18, ...p })}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconPlus = (p: P) => (<svg {...base({ width: 16, height: 16, ...p })}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = (p: P) => (<svg {...base({ width: 16, height: 16, ...p })}><path d="M5 12h14" /></svg>);
export const IconLeaf = (p: P) => (<svg {...base(p)}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19c3-4 6-7 10-9" /></svg>);
export const IconSeed = (p: P) => (<svg {...base(p)}><path d="M12 21v-7" /><path d="M12 14c0-4 3-6 7-6 0 4-3 6-7 6Z" /><path d="M12 12c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" /><path d="M8 21h8" /></svg>);
export const IconPen = (p: P) => (<svg {...base(p)}><path d="M4 20l4-1L19 8l-3-3L5 16l-1 4Z" /><path d="M14 7l3 3" /></svg>);
export const IconFlower = (p: P) => (<svg {...base(p)}><circle cx="12" cy="9" r="2.2" /><path d="M12 6.8c0-2.4 1-3.8 0-3.8s0 1.4 0 3.8ZM14.2 9c2.4 0 3.8-1 3.8 0s-1.4 0-3.8 0ZM9.8 9C7.4 9 6 8 6 9s1.4 0 3.8 0ZM12 11.2c0 2.4-1 3.8 0 3.8" /><path d="M12 11v10M12 17c-2 0-4-1-5-3M12 19c2 0 4-1 5-3" /></svg>);
export const IconTruck = (p: P) => (<svg {...base(p)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>);
export const IconDrop = (p: P) => (<svg {...base(p)}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></svg>);
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>);
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconPin = (p: P) => (<svg {...base(p)}><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></svg>);
export const IconPhone = (p: P) => (<svg {...base(p)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>);
export const IconMail = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const IconStar = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden {...p}><path d="m12 2.8 2.8 6 6.4.6-4.8 4.3 1.4 6.3L12 16.8 6.2 20l1.4-6.3L2.8 9.4l6.4-.6L12 2.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.4} /></svg>
);
export const IconInstagram = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>);
export const IconFacebook = (p: P) => (<svg {...base(p)}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" /></svg>);
export const IconYoutube = (p: P) => (<svg {...base(p)}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" /></svg>);
export const IconTiktok = (p: P) => (<svg {...base(p)}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 3 2.5 5 5.5 5" /></svg>);
export const IconWhatsApp = (p: P) => (
  <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden {...p}><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c0-.2-.3-.3-.6-.4Z" /></svg>
);
