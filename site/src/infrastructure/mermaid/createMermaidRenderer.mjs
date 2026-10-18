/** Implements the diagram capability's render(source, id, theme) interaction. */
export function createMermaidRenderer(load = () => import('mermaid')) {
  let queue = Promise.resolve();
  return {
    render(source, id, theme) {
      const result = queue.then(async () => {
        const { default: mermaid } = await load();
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: theme === 'dark' ? 'dark' : 'default', suppressErrorRendering: true });
        return (await mermaid.render(id, source)).svg;
      });
      queue = result.catch(() => {});
      return result;
    },
  };
}
