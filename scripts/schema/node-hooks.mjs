// Node module hooks used by extract-card-schemas.mjs to import compiled card
// modules outside a bundler: @pihanga2/core -> recording stub, and CSS
// imports -> empty modules (Node can't load CSS).
const STUB = new URL("./core-recorder.mjs", import.meta.url).href;
export async function resolve(spec, ctx, next) {
  if (spec === "@pihanga2/core" || spec.startsWith("@pihanga2/core/")) return {url: STUB, shortCircuit: true};
  if (spec.endsWith(".css")) return {url: "data:text/javascript,export default {}", shortCircuit: true};
  return next(spec, ctx);
}
