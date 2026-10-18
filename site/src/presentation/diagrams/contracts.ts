export type ResolvedTheme = 'light' | 'dark';
export interface DiagramRenderer {
  /** Strict/sanitized SVG markup; the renderer owns its library/security setup. */
  render(source: string, id: string, theme: ResolvedTheme): Promise<string>;
}
export interface DiagramOptions {
  renderer: DiagramRenderer;
  theme(): ResolvedTheme;
  subscribe(changed: () => void): () => void;
}
export interface DiagramView { scale: number; x: number; y: number }
