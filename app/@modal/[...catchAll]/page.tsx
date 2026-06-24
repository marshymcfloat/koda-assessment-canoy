/**
 * Empty render of the `@modal` slot for any non-root route. Together with
 * `@modal/page.tsx`, this closes an intercepting-route modal on soft navigation
 * to a URL the slot doesn't otherwise match (parallel routes keep the previous
 * active subpage visible unless a segment here renders `null`).
 */
export default function ModalCatchAll() {
  return null;
}
