/**
 * copy.js — [data-copy] buttons put their value on the clipboard.
 *
 * The button says "Copied" for a moment afterwards, then goes back to its
 * own label. Without the Clipboard API (or permission) the click does
 * nothing harmful: the address next to it is still a plain mailto link.
 */

const timers = new Map();
const buttons = [];

async function copy(button) {
  const value = button.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    return;
  }
  const label = button.dataset.label ?? (button.dataset.label = button.textContent);
  button.textContent = "Copied";
  button.dataset.copied = "";
  clearTimeout(timers.get(button));
  timers.set(button, setTimeout(() => {
    button.textContent = label;
    delete button.dataset.copied;
  }, 1600));
}

const onClick = (event) => copy(event.currentTarget);

export function init(root = document) {
  root.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", onClick);
    buttons.push(button);
  });
  return destroy;
}

export function destroy() {
  buttons.forEach((button) => button.removeEventListener("click", onClick));
  buttons.length = 0;
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
}
