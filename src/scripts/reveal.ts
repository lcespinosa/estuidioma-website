// src/scripts/reveal.ts
export default function mountReveal() {
  const els = document.querySelectorAll<HTMLElement>(".reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target); // aparece solo una vez
        }
      }
    },
    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
}
