/**
 * Empty render of the `@modal` slot for `/`. Needed because the create/edit
 * Server Actions `redirect('/')` on success — a soft navigation, which keeps
 * the slot's previously active (intercepted) subpage mounted unless a matching
 * segment renders here. Without this, the modal stays open after submitting.
 */
export default function ModalRoot() {
  return null;
}
